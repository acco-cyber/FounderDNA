import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createAdminClient,
  createContextClient,
} from "@supabase/server/core";
import { config, persistenceProvider } from "./config.mjs";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const localDataPath = path.resolve(moduleDirectory, "../../data/local-state.json");
const emptyState = () => ({
  agentRuns: [],
  evidence: [],
  profiles: {},
  matchProfiles: {},
  connections: [],
});
const normalizeState = (state) => ({
  agentRuns: Array.isArray(state?.agentRuns) ? state.agentRuns : [],
  evidence: Array.isArray(state?.evidence) ? state.evidence : [],
  profiles:
    state?.profiles && typeof state.profiles === "object" ? state.profiles : {},
  matchProfiles:
    state?.matchProfiles && typeof state.matchProfiles === "object"
      ? state.matchProfiles
      : {},
  connections: Array.isArray(state?.connections) ? state.connections : [],
});

const supabaseEnvironment = () => ({
  url: config.supabaseUrl,
  publishableKeys: { default: config.supabasePublishableKey },
  secretKeys: config.supabaseSecretKey
    ? { default: config.supabaseSecretKey }
    : {},
  jwks: new URL(config.supabaseJwksUrl),
});

const throwDatabaseError = (error) => {
  const wrapped = new Error(`Supabase persistence failed: ${error.message}`);
  wrapped.code = error.code;
  wrapped.details = error.details;
  throw wrapped;
};

class LocalFileStore {
  provider = "local-file";
  #writeQueue = Promise.resolve();

  async #read() {
    try {
      return normalizeState(JSON.parse(await readFile(localDataPath, "utf8")));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      return emptyState();
    }
  }

  async #write(state) {
    await mkdir(path.dirname(localDataPath), { recursive: true });
    const temporaryPath = `${localDataPath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(state, null, 2), "utf8");
    await rename(temporaryPath, localDataPath);
  }

  async #update(update) {
    const operation = this.#writeQueue.then(async () => {
      const state = await this.#read();
      const result = update(state);
      await this.#write(state);
      return result;
    });
    this.#writeQueue = operation.catch(() => undefined);
    return operation;
  }

  async saveAgentRun(run, ownerId) {
    const record = {
      id: run.id ?? randomUUID(),
      createdAt: run.createdAt ?? new Date().toISOString(),
      ownerId,
      ...run,
    };
    await this.#update((state) => {
      state.agentRuns.unshift(record);
      state.agentRuns = state.agentRuns.slice(0, 250);
    });
    return record;
  }

  async listAgentRuns(limit = 30, ownerId) {
    const state = await this.#read();
    return state.agentRuns
      .filter((item) => item.ownerId === ownerId)
      .slice(0, limit);
  }

  async addEvidence(event, ownerId) {
    const record = {
      id: event.id ?? randomUUID(),
      createdAt: event.createdAt ?? new Date().toISOString(),
      ownerId,
      ...event,
    };
    await this.#update((state) => {
      const existingIndex = state.evidence.findIndex(
        (item) => item.id === record.id,
      );
      if (existingIndex >= 0) state.evidence[existingIndex] = record;
      else state.evidence.unshift(record);
      state.evidence = state.evidence.slice(0, 1000);
    });
    return record;
  }

  async listEvidence(limit = 250, ownerId) {
    const state = await this.#read();
    return state.evidence
      .filter((item) => item.ownerId === ownerId)
      .slice(0, limit);
  }

  async getProfile(ownerId) {
    const state = await this.#read();
    return state.profiles[ownerId]?.profile ?? null;
  }

  async saveProfile(profile, ownerId) {
    const saved = {
      profile,
      updatedAt: new Date().toISOString(),
    };
    await this.#update((state) => {
      state.profiles[ownerId] = saved;
    });
    return saved;
  }

  async getMatchProfile(ownerId) {
    const state = await this.#read();
    return state.matchProfiles[ownerId] ?? null;
  }

  async saveMatchProfile(profile, ownerId) {
    const saved = {
      ...profile,
      userId: ownerId,
      updatedAt: new Date().toISOString(),
    };
    await this.#update((state) => {
      state.matchProfiles[ownerId] = saved;
    });
    return saved;
  }

  async listMatchProfiles(_ownerId) {
    const state = await this.#read();
    return Object.values(state.matchProfiles).filter(
      (profile) => profile.published,
    );
  }

  async requestConnection(recipientId, note, ownerId) {
    const connection = {
      id: randomUUID(),
      requesterId: ownerId,
      recipientId,
      status: "requested",
      note,
      createdAt: new Date().toISOString(),
    };
    await this.#update((state) => {
      state.connections.unshift(connection);
    });
    return connection;
  }

  async health() {
    return { ready: true, detail: "Local development store is ready." };
  }
}

const toMatchProfile = (row) => ({
  userId: row.user_id,
  displayName: row.display_name,
  track: row.track,
  headline: row.headline,
  bio: row.bio,
  location: row.location,
  workMode: row.work_mode,
  industry: row.industry,
  ambition: row.ambition,
  stage: row.stage,
  equityExpectation: row.equity_expectation,
  weeklyHours: row.weekly_hours,
  skills: row.skills ?? [],
  seekingSkills: row.seeking_skills ?? [],
  vision: row.vision,
  published: row.published,
  identityVerified: row.identity_verified,
  phoneVerified: row.phone_verified,
  linkedinVerified: row.linkedin_verified,
  updatedAt: row.updated_at,
});

class SupabaseStore {
  provider = "supabase";
  #admin = null;

  #client(requestClient) {
    if (requestClient) return requestClient;
    if (!config.supabaseSecretKey) {
      throw new Error(
        "A Supabase user client or SUPABASE_SECRET_KEY is required for this operation.",
      );
    }
    this.#admin ??= createAdminClient({ env: supabaseEnvironment() });
    return this.#admin;
  }

  async saveAgentRun(run, ownerId, requestClient) {
    const createdAt = run.createdAt ?? new Date().toISOString();
    const record = {
      id: run.id ?? randomUUID(),
      createdAt,
      ownerId,
      ...run,
    };
    const { error } = await this.#client(requestClient)
      .from("agent_runs")
      .upsert({
        id: record.id,
        user_id: ownerId,
        type: record.type,
        status: record.status,
        provider: record.provider ?? "",
        model: record.model ?? null,
        payload: record,
        created_at: createdAt,
      });
    if (error) throwDatabaseError(error);
    return record;
  }

  async listAgentRuns(limit = 30, ownerId, requestClient) {
    const { data, error } = await this.#client(requestClient)
      .from("agent_runs")
      .select("id, payload, created_at")
      .eq("user_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throwDatabaseError(error);
    return (data ?? []).map((row) => ({
      ...(row.payload ?? {}),
      id: row.id,
      ownerId,
      createdAt: row.created_at,
    }));
  }

  async addEvidence(event, ownerId, requestClient) {
    const createdAt = event.createdAt ?? new Date().toISOString();
    const record = {
      id: event.id ?? randomUUID(),
      createdAt,
      ownerId,
      ...event,
    };
    const { error } = await this.#client(requestClient)
      .from("evidence_events")
      .upsert({
        id: record.id,
        user_id: ownerId,
        type: record.type,
        status: record.status,
        amount: record.amount ?? null,
        currency: record.currency ?? "USD",
        customer_ref: record.customerRef ?? null,
        source_ref: record.source ?? null,
        payload: record,
        created_at: createdAt,
      });
    if (error) throwDatabaseError(error);
    return record;
  }

  async listEvidence(limit = 250, ownerId, requestClient) {
    const { data, error } = await this.#client(requestClient)
      .from("evidence_events")
      .select("id, payload, created_at")
      .eq("user_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throwDatabaseError(error);
    return (data ?? []).map((row) => ({
      ...(row.payload ?? {}),
      id: row.id,
      ownerId,
      createdAt: row.created_at,
    }));
  }

  async getProfile(ownerId, requestClient) {
    const { data, error } = await this.#client(requestClient)
      .from("founder_profiles")
      .select("profile")
      .eq("user_id", ownerId)
      .maybeSingle();
    if (error) throwDatabaseError(error);
    return data?.profile ?? null;
  }

  async saveProfile(profile, ownerId, requestClient) {
    const updatedAt = new Date().toISOString();
    const { error } = await this.#client(requestClient)
      .from("founder_profiles")
      .upsert({
        user_id: ownerId,
        profile,
        updated_at: updatedAt,
      });
    if (error) throwDatabaseError(error);
    return { profile, updatedAt };
  }

  async getMatchProfile(ownerId, requestClient) {
    const { data, error } = await this.#client(requestClient)
      .from("match_profiles")
      .select("*")
      .eq("user_id", ownerId)
      .maybeSingle();
    if (error) throwDatabaseError(error);
    return data ? toMatchProfile(data) : null;
  }

  async saveMatchProfile(profile, ownerId, requestClient) {
    const { data, error } = await this.#client(requestClient)
      .from("match_profiles")
      .upsert({
        user_id: ownerId,
        display_name: profile.displayName,
        track: profile.track,
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        work_mode: profile.workMode,
        industry: profile.industry,
        ambition: profile.ambition,
        stage: profile.stage,
        equity_expectation: profile.equityExpectation,
        weekly_hours: profile.weeklyHours,
        skills: profile.skills,
        seeking_skills: profile.seekingSkills,
        vision: profile.vision,
        published: profile.published,
      })
      .select("*")
      .single();
    if (error) throwDatabaseError(error);
    return toMatchProfile(data);
  }

  async listMatchProfiles(ownerId, requestClient) {
    const { data, error } = await this.#client(requestClient)
      .from("match_profiles")
      .select("*")
      .eq("published", true)
      .neq("user_id", ownerId)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throwDatabaseError(error);
    return (data ?? []).map(toMatchProfile);
  }

  async requestConnection(recipientId, note, ownerId, requestClient) {
    const client = this.#client(requestClient);
    const { data, error } = await client
      .from("connections")
      .insert({
        requester_id: ownerId,
        recipient_id: recipientId,
        status: "requested",
        note,
      })
      .select("*")
      .single();

    if (error?.code === "23505") {
      const { data: existing, error: existingError } = await client
        .from("connections")
        .select("*")
        .or(
          `and(requester_id.eq.${ownerId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${ownerId})`,
        )
        .maybeSingle();
      if (existingError) throwDatabaseError(existingError);
      if (existing) {
        return {
          id: existing.id,
          requesterId: existing.requester_id,
          recipientId: existing.recipient_id,
          status: existing.status,
          note: existing.note,
          createdAt: existing.created_at,
        };
      }
    }
    if (error) throwDatabaseError(error);
    return {
      id: data.id,
      requesterId: data.requester_id,
      recipientId: data.recipient_id,
      status: data.status,
      note: data.note,
      createdAt: data.created_at,
    };
  }

  async health() {
    const client = createContextClient({ env: supabaseEnvironment() });
    const { error } = await client
      .from("founder_profiles")
      .select("user_id")
      .limit(0);
    return error
      ? {
          ready: false,
          detail:
            error.code === "PGRST205"
              ? "Apply the Founder DNA Supabase migration."
              : "Supabase could not verify the application schema.",
        }
      : { ready: true, detail: "Supabase schema and RLS are reachable." };
  }
}

export const store =
  persistenceProvider() === "supabase"
    ? new SupabaseStore()
    : new LocalFileStore();
