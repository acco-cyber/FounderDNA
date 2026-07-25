import { useCallback, useEffect, useState } from "react";
import { emptyProfile } from "../data/mockData";
import { getFounderProfile, saveFounderProfile } from "../lib/api";
import type { FounderProfile } from "../types";

const STORAGE_KEY = "founder-dna-profile-v1";

function storageKey(userId?: string) {
  return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
}

function readLocalProfile(userId?: string): FounderProfile {
  try {
    const stored = window.localStorage.getItem(storageKey(userId));
    return stored ? (JSON.parse(stored) as FounderProfile) : emptyProfile;
  } catch {
    return emptyProfile;
  }
}

export function usePersistentProfile(
  userId?: string,
  localReview = false,
) {
  const [profile, setProfileState] = useState<FounderProfile>(() =>
    readLocalProfile(userId),
  );
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<
    "loading" | "synced" | "local" | "error"
  >(userId ? "loading" : "local");

  useEffect(() => {
    let active = true;
    const localProfile = readLocalProfile(userId);
    setProfileState(localProfile);

    if (!userId || localReview) {
      setHydrated(true);
      setSyncState("local");
      return () => {
        active = false;
      };
    }

    setHydrated(false);
    setSyncState("loading");
    void getFounderProfile()
      .then(({ profile: remoteProfile }) => {
        if (!active) return;
        if (remoteProfile) setProfileState(remoteProfile);
        setSyncState("synced");
      })
      .catch(() => {
        if (active) setSyncState("error");
      })
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, [localReview, userId]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(userId), JSON.stringify(profile));
    if (!userId || localReview) {
      setSyncState("local");
      return;
    }

    setSyncState("loading");
    const timer = window.setTimeout(() => {
      void saveFounderProfile(profile)
        .then(() => setSyncState("synced"))
        .catch(() => setSyncState("error"));
    }, 650);

    return () => window.clearTimeout(timer);
  }, [hydrated, localReview, profile, userId]);

  const setProfile = useCallback((next: FounderProfile) => {
    setProfileState(next);
  }, []);

  const resetProfile = useCallback(() => {
    setProfileState(emptyProfile);
  }, []);

  return { profile, setProfile, resetProfile, syncState, hydrated };
}
