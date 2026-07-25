import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Code2,
  Filter,
  Grid2X2,
  Handshake,
  Linkedin,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRoundCheck,
  Video,
  X,
  Zap,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useAuth } from "../context/AuthProvider";
import {
  discoverMatchProfiles,
  getMatchProfile,
  requestMatchIntro,
  saveMatchProfile,
  type MatchProfile,
} from "../lib/api";
import { useLocation, useNavigate } from "../lib/router";
import type { FounderProfile } from "../types";

type FounderTrack = "Technical" | "Business" | "Hybrid";
type DiscoveryMode = "card" | "grid";
type NetworkView = "discover" | "profile" | "messages";

type Candidate = {
  id: string;
  name: string;
  initials: string;
  track: FounderTrack;
  headline: string;
  bio: string;
  location: string;
  workMode: string;
  hours: number;
  stage: string;
  equity: string;
  match: number;
  verified: string[];
  gives: string[];
  needs: string[];
  vision: string;
  evidence: string[];
  availability: string;
  skills: Record<string, number>;
  live?: boolean;
};

const MATCH_PROFILE_STORAGE_KEY = "founder-dna-match-profile-v1";

function defaultMatchProfile(
  founderProfile: FounderProfile,
  displayName: string,
): MatchProfile {
  return {
    displayName: founderProfile.name || displayName || "Founder",
    track: "Business",
    headline: founderProfile.industry
      ? `Founder exploring ${founderProfile.industry}`
      : "Evidence-first founder looking for a complementary builder",
    bio: founderProfile.reflection || "",
    location: [founderProfile.city, founderProfile.region]
      .filter(Boolean)
      .join(", "),
    workMode: "Flexible",
    industry: founderProfile.industry || "Open to the evidence",
    ambition: "Still exploring",
    stage: "Exploring",
    equityExpectation: "Discuss openly",
    weeklyHours: 20,
    skills: ["Operations", "Customer discovery"],
    seekingSkills: [],
    vision: "",
    published: false,
  };
}

function readStoredMatchProfile(fallback: MatchProfile): MatchProfile {
  try {
    const stored = localStorage.getItem(MATCH_PROFILE_STORAGE_KEY);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<MatchProfile> & {
      selectedSkills?: string[];
      hours?: string;
    };
    return {
      ...fallback,
      ...parsed,
      skills: parsed.skills ?? parsed.selectedSkills ?? fallback.skills,
      weeklyHours:
        parsed.weeklyHours ?? Number(parsed.hours ?? fallback.weeklyHours),
    };
  } catch {
    return fallback;
  }
}

function candidateFromProfile(profile: MatchProfile): Candidate {
  const verified = [
    profile.identityVerified ? "Identity" : "",
    profile.phoneVerified ? "Phone" : "",
    profile.linkedinVerified ? "LinkedIn" : "",
  ].filter(Boolean);
  const name = profile.displayName || "Founder";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const skillStrength = (label: string) =>
    profile.skills.some((skill) =>
      skill.toLowerCase().includes(label.toLowerCase()),
    )
      ? 88
      : 58;

  return {
    id: profile.userId ?? crypto.randomUUID(),
    name,
    initials: initials || "FD",
    track: profile.track,
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location || "Location shared after consent",
    workMode: profile.workMode,
    hours: profile.weeklyHours,
    stage: profile.stage,
    equity: profile.equityExpectation,
    match: profile.track === "Technical" ? 91 : profile.track === "Hybrid" ? 87 : 84,
    verified,
    gives: profile.skills,
    needs: profile.seekingSkills,
    vision: profile.vision,
    evidence: [],
    availability: `${profile.weeklyHours} hours weekly · ${profile.workMode}`,
    skills: {
      Product: skillStrength("Product"),
      Technical: skillStrength("Engineering"),
      Sales: skillStrength("Sales"),
      Operations: skillStrength("Operations"),
      Market: skillStrength("Customer"),
    },
    live: true,
  };
}

const candidates: Candidate[] = [
  {
    id: "amara",
    name: "Amara Okafor",
    initials: "AO",
    track: "Technical",
    headline: "Applied AI engineer building practical tools for local service businesses",
    bio: "I turn messy workflows into small, dependable products. I want a co-founder who understands a real customer community and enjoys selling before scaling.",
    location: "Chicago, IL",
    workMode: "Hybrid",
    hours: 30,
    stage: "Validating",
    equity: "Equal split",
    match: 94,
    verified: ["Identity", "Phone", "LinkedIn"],
    gives: ["AI engineering", "Product systems", "Rapid prototypes"],
    needs: ["Customer access", "Sales ownership", "Local operations"],
    vision: "Build durable, human-centered software for overlooked small-business operators.",
    evidence: [
      "Shipped three internal workflow products",
      "Led a five-person engineering pod",
      "Completed 12 customer discovery calls",
    ],
    availability: "Weekday evenings + Friday build day",
    skills: { Product: 91, Technical: 96, Sales: 54, Operations: 68, Market: 62 },
  },
  {
    id: "jonah",
    name: "Jonah Lee",
    initials: "JL",
    track: "Business",
    headline: "Healthcare partnerships operator with deep community-provider access",
    bio: "I know how care organizations buy, where implementation stalls, and who feels the pain. I am looking for a product-minded technical partner who values evidence over hype.",
    location: "Denver, CO",
    workMode: "Remote",
    hours: 20,
    stage: "Idea",
    equity: "Discuss openly",
    match: 89,
    verified: ["Identity", "LinkedIn"],
    gives: ["Partnerships", "Healthcare fluency", "Enterprise sales"],
    needs: ["Technical architecture", "Product delivery", "Data systems"],
    vision: "Reduce the administrative burden that keeps community care teams from patients.",
    evidence: [
      "Managed a regional provider network",
      "Closed six institutional partnerships",
      "Mapped a recurring referral handoff problem",
    ],
    availability: "20 hours weekly · full-time after pilot",
    skills: { Product: 62, Technical: 31, Sales: 94, Operations: 82, Market: 91 },
  },
  {
    id: "sofia",
    name: "Sofia Ramirez",
    initials: "SR",
    track: "Hybrid",
    headline: "Marketplace product lead focused on childcare and hourly-work resilience",
    bio: "My best work sits between product, field operations, and partnerships. I am seeking someone strong in finance and repeatable customer acquisition.",
    location: "Austin, TX",
    workMode: "Flexible",
    hours: 40,
    stage: "MVP",
    equity: "45–50%",
    match: 86,
    verified: ["Identity", "Phone"],
    gives: ["Product strategy", "Marketplace ops", "User research"],
    needs: ["Growth systems", "Financial modeling", "B2B sales"],
    vision: "Make essential services more reliable for families working unpredictable shifts.",
    evidence: [
      "Launched a two-sided marketplace",
      "Ran 26 parent and provider interviews",
      "Built a concierge pilot workflow",
    ],
    availability: "Full-time · available now",
    skills: { Product: 92, Technical: 67, Sales: 71, Operations: 88, Market: 84 },
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    initials: "MC",
    track: "Business",
    headline: "B2B growth operator for climate and industrial service companies",
    bio: "I build focused outbound systems and partnerships. I want a technical co-founder who is comfortable working close to physical operations.",
    location: "Cleveland, OH",
    workMode: "In person",
    hours: 30,
    stage: "Pre-seed",
    equity: "40–50%",
    match: 82,
    verified: ["Identity", "Phone", "LinkedIn"],
    gives: ["B2B growth", "Channel sales", "Fundraising"],
    needs: ["Industrial product", "Data engineering", "Technical leadership"],
    vision: "Help local industrial operators reduce waste without replacing their workforce.",
    evidence: [
      "Built a $1.2M qualified pipeline",
      "Managed two channel programs",
      "Interviewed eight plant operators",
    ],
    availability: "Four days weekly · Cleveland preferred",
    skills: { Product: 58, Technical: 36, Sales: 96, Operations: 77, Market: 85 },
  },
];

const setupSteps = [
  { title: "Identity", caption: "Who you are", icon: CircleUserRound },
  { title: "Skills", caption: "What you bring", icon: Zap },
  { title: "Vision", caption: "What you believe", icon: Sparkles },
  { title: "Availability", caption: "How you commit", icon: Clock3 },
];

const conversations = [
  { id: "amara", preview: "The customer-access angle is exactly…", time: "9:42", unread: 2 },
  { id: "jonah", preview: "Would Tuesday afternoon work?", time: "Tue", unread: 0 },
  { id: "sofia", preview: "I added the pilot questions.", time: "Mon", unread: 0 },
];

const initialMessages: Record<string, { from: "me" | "them" | "system"; text: string; time: string }[]> = {
  amara: [
    { from: "them", text: "Your field-operations background looks unusually close to the problem I want to explore.", time: "9:34" },
    { from: "me", text: "The product gap on my side is real. I would rather test how we work than over-index on a score.", time: "9:38" },
    { from: "them", text: "Agreed. Could we scope one customer interview workflow together?", time: "9:42" },
  ],
  jonah: [
    { from: "them", text: "I liked your evidence-first approach. Would a short intro next week make sense?", time: "Tue" },
  ],
  sofia: [
    { from: "them", text: "I added the pilot questions we discussed. The schedule assumptions still need work.", time: "Mon" },
  ],
};

function scoreTone(score: number) {
  if (score >= 92) return "is-exceptional";
  if (score >= 86) return "is-strong";
  return "is-promising";
}

function VerificationBadges({ items }: { items: string[] }) {
  const icon = (item: string) => {
    if (item === "LinkedIn") return <Linkedin size={11} />;
    if (item === "Phone") return <Phone size={11} />;
    return <UserRoundCheck size={11} />;
  };
  if (items.length === 0) {
    return (
      <div className="match-verifications">
        <span><ShieldCheck size={11} /> Verification pending</span>
      </div>
    );
  }
  return (
    <div className="match-verifications" aria-label="Verification states">
      {items.map((item) => (
        <span key={item}>{icon(item)} {item}</span>
      ))}
    </div>
  );
}

function MatchScore({ value, compact = false }: { value: number; compact?: boolean }) {
  return (
    <div className={`cofounder-match-score ${scoreTone(value)} ${compact ? "is-compact" : ""}`}>
      <strong>{value}%</strong>
      <span>Match</span>
    </div>
  );
}

function SkillComparison({
  candidate,
  profile,
}: {
  candidate: Candidate;
  profile: FounderProfile;
}) {
  const founderScores: Record<string, number> = {
    Product: profile.assessmentComplete ? profile.scores.executionVelocity : 72,
    Technical: profile.industry.toLowerCase().includes("tech") ? 82 : 45,
    Sales: profile.assessmentComplete ? profile.scores.networkLeverage : 68,
    Operations: profile.assessmentComplete ? profile.scores.resourcefulness : 78,
    Market: profile.assessmentComplete ? profile.scores.localMarketFluency : 75,
  };

  return (
    <div className="skill-comparison" aria-label={`Skill comparison with ${candidate.name}`}>
      <div className="skill-comparison-legend">
        <span><i className="is-you" /> You bring</span>
        <span><i className="is-them" /> {candidate.name.split(" ")[0]} brings</span>
      </div>
      {Object.entries(candidate.skills).map(([skill, value]) => (
        <div className="skill-compare-row" key={skill}>
          <span>{skill}</span>
          <div>
            <i className="is-you" style={{ "--skill-width": `${founderScores[skill]}%` } as CSSProperties} />
            <i className="is-them" style={{ "--skill-width": `${value}%` } as CSSProperties} />
          </div>
          <em>{Math.abs(value - founderScores[skill]) >= 25 ? "Complement" : "Aligned"}</em>
        </div>
      ))}
    </div>
  );
}

function SetupWizard({
  onClose,
  onComplete,
  initialProfile,
}: {
  onClose: () => void;
  onComplete: (profile: MatchProfile) => Promise<void>;
  initialProfile: MatchProfile;
}) {
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<FounderTrack>(initialProfile.track);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initialProfile.skills,
  );
  const [neededSkill, setNeededSkill] = useState(
    initialProfile.seekingSkills[0] ?? "",
  );
  const [linkedinNotice, setLinkedinNotice] = useState(false);
  const [vision, setVision] = useState(initialProfile.vision);
  const [industry, setIndustry] = useState(initialProfile.industry);
  const [ambition, setAmbition] = useState(initialProfile.ambition);
  const [hours, setHours] = useState(String(initialProfile.weeklyHours));
  const [workMode, setWorkMode] = useState(initialProfile.workMode);
  const [stage, setStage] = useState(initialProfile.stage);
  const [equity, setEquity] = useState(initialProfile.equityExpectation);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const skillOptions = ["Product", "Engineering", "Operations", "Sales", "Finance", "Customer discovery"];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
  };

  const finish = async () => {
    const completedProfile: MatchProfile = {
      ...initialProfile,
      track,
      skills: selectedSkills,
      seekingSkills: neededSkill.trim() ? [neededSkill.trim()] : [],
      vision,
      industry,
      ambition,
      weeklyHours: Number(hours),
      workMode,
      stage,
      equityExpectation: equity,
    };
    setSaving(true);
    setSaveError("");
    try {
      localStorage.setItem(
        MATCH_PROFILE_STORAGE_KEY,
        JSON.stringify(completedProfile),
      );
      await onComplete(completedProfile);
    } catch {
      setSaveError(
        "The profile stayed on this device, but cloud sync needs attention.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="match-setup-backdrop" role="presentation">
      <section className="match-setup-modal" role="dialog" aria-modal="true" aria-labelledby="setup-title">
        <button className="match-setup-close" type="button" onClick={onClose} aria-label="Close profile setup">
          <X size={18} />
        </button>
        <aside className="match-setup-track">
          <span className="match-setup-brand"><Handshake size={19} /> Match profile</span>
          <h2 id="setup-title">Find the person who makes the team more complete.</h2>
          <p>Four focused steps. Your profile remains private until you choose to publish it.</p>
          <div className="match-setup-steps">
            {setupSteps.map(({ title, caption, icon: Icon }, index) => (
              <button
                key={title}
                type="button"
                className={`${index === step ? "is-active" : ""} ${index < step ? "is-complete" : ""}`}
                onClick={() => index <= step && setStep(index)}
              >
                <span>{index < step ? <Check size={14} /> : <Icon size={14} />}</span>
                <div><strong>{title}</strong><small>{caption}</small></div>
              </button>
            ))}
          </div>
          <div className="match-setup-progress">
            <span style={{ width: `${((step + 1) / setupSteps.length) * 100}%` }} />
          </div>
          <small>Step {step + 1} of {setupSteps.length}</small>
        </aside>

        <div className="match-setup-content">
          {step === 0 && (
            <div className="setup-panel">
              <span className="setup-kicker">01 · Identity</span>
              <h3>How do you create value?</h3>
              <p>Choose the closest track. This shapes which complementary profiles appear first.</p>
              <div className="founder-track-options">
                {(["Technical", "Business", "Hybrid"] as FounderTrack[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${track === item ? "is-selected" : ""} is-${item.toLowerCase()}`}
                    onClick={() => setTrack(item)}
                  >
                    <span>{item === "Technical" ? <Code2 size={20} /> : item === "Business" ? <BriefcaseBusiness size={20} /> : <Handshake size={20} />}</span>
                    <strong>{item}</strong>
                    <small>{item === "Technical" ? "Product, engineering, and data" : item === "Business" ? "Market, sales, and operations" : "Cross-functional builder"}</small>
                  </button>
                ))}
              </div>
              <button className="linkedin-connect" type="button" onClick={() => setLinkedinNotice(true)}>
                <Linkedin size={17} /> Import professional profile
                <span>LinkedIn OAuth</span>
              </button>
              {linkedinNotice && (
                <div className="setup-integration-note" role="status">
                  <ShieldCheck size={15} />
                  LinkedIn import activates after a production OAuth app is configured. No demo data was imported.
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="setup-panel">
              <span className="setup-kicker">02 · Skills</span>
              <h3>What can a teammate rely on you to own?</h3>
              <p>Choose demonstrated capability, not skills you hope to learn later.</p>
              <div className="setup-skill-options">
                {skillOptions.map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    className={selectedSkills.includes(skill) ? "is-selected" : ""}
                    onClick={() => toggleSkill(skill)}
                  >
                    {selectedSkills.includes(skill) && <Check size={14} />}
                    {skill}
                  </button>
                ))}
              </div>
              <label className="setup-field">
                <span>Capability you need from a co-founder</span>
                <input
                  value={neededSkill}
                  onChange={(event) => setNeededSkill(event.target.value)}
                  placeholder="Example: full-stack product delivery"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="setup-panel">
              <span className="setup-kicker">03 · Vision</span>
              <h3>What future are you willing to work toward?</h3>
              <p>Specific beliefs create better matches than broad industry labels.</p>
              <label className="setup-field">
                <span>Your founder thesis</span>
                <textarea
                  rows={5}
                  value={vision}
                  onChange={(event) => setVision(event.target.value)}
                  placeholder="I believe overlooked local operators can..."
                />
              </label>
              <div className="setup-choice-row">
                <label><span>Industry focus</span><select value={industry} onChange={(event) => setIndustry(event.target.value)}><option>Local services</option><option>AI / software</option><option>Healthcare</option><option>Climate</option><option>Open to the evidence</option></select></label>
                <label><span>Company ambition</span><select value={ambition} onChange={(event) => setAmbition(event.target.value)}><option>Durable small business</option><option>Venture scale</option><option>Still exploring</option></select></label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="setup-panel">
              <span className="setup-kicker">04 · Availability</span>
              <h3>Make the working agreement visible early.</h3>
              <p>Time, location, and equity expectations are common deal-breakers. Put them on the table.</p>
              <div className="setup-choice-row">
                <label><span>Hours each week</span><select value={hours} onChange={(event) => setHours(event.target.value)}><option value="10">10 hours</option><option value="20">20 hours</option><option value="30">30 hours</option><option value="40">Full-time</option></select></label>
                <label><span>Work preference</span><select value={workMode} onChange={(event) => setWorkMode(event.target.value as MatchProfile["workMode"])}><option>Flexible</option><option>Remote</option><option>Hybrid</option><option>In person</option></select></label>
                <label><span>Current stage</span><select value={stage} onChange={(event) => setStage(event.target.value as MatchProfile["stage"])}><option>Exploring</option><option>Idea</option><option>Validating</option><option>MVP</option><option>Pre-seed</option></select></label>
                <label><span>Equity expectation</span><select value={equity} onChange={(event) => setEquity(event.target.value)}><option>Discuss openly</option><option>Equal split</option><option>40–50%</option><option>Less than 40%</option></select></label>
              </div>
              <div className="setup-readiness-note">
                <BadgeCheck size={18} />
                <span><strong>Your profile is ready for private preview.</strong>Publishing and identity verification remain separate choices.</span>
              </div>
            </div>
          )}

          <div className="match-setup-actions">
            <button type="button" className="button button-secondary" onClick={() => step === 0 ? onClose() : setStep(step - 1)}>
              {step === 0 ? "Finish later" : <><ArrowLeft size={15} /> Back</>}
            </button>
            {saveError && <span className="auth-message is-error">{saveError}</span>}
            <button type="button" className="button button-primary" disabled={saving} onClick={() => step === 3 ? void finish() : setStep(step + 1)}>
              {step === 3 ? (saving ? "Saving…" : "Preview my profile") : <>Continue <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CandidateCard({
  candidate,
  onProfile,
  onIntro,
  compact = false,
}: {
  candidate: Candidate;
  onProfile: () => void;
  onIntro: () => void;
  compact?: boolean;
}) {
  return (
    <article className={`candidate-card ${compact ? "is-compact" : ""}`}>
      <div className="candidate-card-head">
        <span className={`candidate-avatar is-${candidate.track.toLowerCase()}`}>{candidate.initials}</span>
        <div>
          <span className={`founder-track-tag is-${candidate.track.toLowerCase()}`}>{candidate.track}</span>
          <h3>
            {candidate.name}{" "}
            {candidate.verified.includes("Identity") && (
              <BadgeCheck size={14} aria-label="Identity verified" />
            )}
          </h3>
          <p><MapPin size={12} /> {candidate.location} · {candidate.workMode}</p>
        </div>
        <MatchScore value={candidate.match} compact={compact} />
      </div>
      <VerificationBadges items={candidate.verified} />
      <h4>{candidate.headline}</h4>
      {!compact && <p className="candidate-bio">{candidate.bio}</p>}
      <div className="candidate-complement">
        <div><small>Brings</small><span>{candidate.gives.slice(0, compact ? 2 : 3).map((item) => <em key={item}>{item}</em>)}</span></div>
        <ArrowRight size={15} />
        <div><small>Seeking</small><span>{candidate.needs.slice(0, compact ? 2 : 3).map((item) => <em key={item}>{item}</em>)}</span></div>
      </div>
      <div className="candidate-meta">
        <span><Clock3 size={13} /> {candidate.hours} hrs/week</span>
        <span><Zap size={13} /> {candidate.stage}</span>
        <span><Handshake size={13} /> {candidate.equity}</span>
      </div>
      <div className="candidate-card-actions">
        <button type="button" className="button button-secondary" onClick={onProfile}>View profile</button>
        <button type="button" className="button button-primary" onClick={onIntro}><MessageCircle size={15} /> Request intro</button>
      </div>
    </article>
  );
}

export function CofounderNetwork({ profile }: { profile: FounderProfile }) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const requestedView = params.get("view");
  const view: NetworkView =
    requestedView === "profile" || requestedView === "messages" ? requestedView : "discover";
  const requestedCandidate = params.get("person") ?? "amara";
  const initialMatchProfile = useMemo(
    () =>
      readStoredMatchProfile(
        defaultMatchProfile(
          profile,
          auth.user?.displayName ?? "Founder",
        ),
      ),
    [auth.user?.displayName, profile],
  );

  const [mode, setMode] = useState<DiscoveryMode>("card");
  const [setupOpen, setSetupOpen] = useState(params.get("setup") === "1");
  const [setupComplete, setSetupComplete] = useState(
    () => localStorage.getItem(MATCH_PROFILE_STORAGE_KEY) !== null,
  );
  const [matchProfile, setMatchProfile] =
    useState<MatchProfile>(initialMatchProfile);
  const [networkCandidates, setNetworkCandidates] = useState<Candidate[]>([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [hoursFilter, setHoursFilter] = useState("Any");
  const [stageFilter, setStageFilter] = useState("Any");
  const [locationFilter, setLocationFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [activeConversation, setActiveConversation] = useState(requestedCandidate);
  const [messageMap, setMessageMap] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [selectedDay, setSelectedDay] = useState("Tue 29");
  const [selectedTime, setSelectedTime] = useState("");
  const allCandidates = useMemo(
    () => [...networkCandidates, ...candidates],
    [networkCandidates],
  );
  const selectedCandidate =
    allCandidates.find((candidate) => candidate.id === requestedCandidate) ??
    allCandidates[0];

  useEffect(() => {
    if (!auth.user || auth.user.isLocalReview) return;
    let active = true;

    void Promise.all([getMatchProfile(), discoverMatchProfiles()])
      .then(([own, discovery]) => {
        if (!active) return;
        if (own.profile?.track) {
          setMatchProfile(own.profile);
          setSetupComplete(Boolean(own.profile.vision || own.profile.skills.length));
          localStorage.setItem(
            MATCH_PROFILE_STORAGE_KEY,
            JSON.stringify(own.profile),
          );
        }
        setNetworkCandidates(discovery.profiles.map(candidateFromProfile));
      })
      .catch(() => {
        if (!active) return;
        setNotice(
          "Cloud matching is waiting for the Supabase schema; this review stays local.",
        );
      });

    return () => {
      active = false;
    };
  }, [auth.user]);

  const filteredCandidates = useMemo(
    () =>
      allCandidates.filter((candidate) => {
        if (roleFilter !== "All" && candidate.track !== roleFilter) return false;
        if (hoursFilter !== "Any" && candidate.hours < Number(hoursFilter)) return false;
        if (stageFilter !== "Any" && candidate.stage !== stageFilter) return false;
        if (
          locationFilter &&
          !candidate.location.toLowerCase().includes(locationFilter.toLowerCase()) &&
          !candidate.workMode.toLowerCase().includes(locationFilter.toLowerCase())
        ) return false;
        if (verifiedOnly && candidate.verified.length < 3) return false;
        return true;
      }),
    [
      allCandidates,
      hoursFilter,
      locationFilter,
      roleFilter,
      stageFilter,
      verifiedOnly,
    ],
  );

  const activeCard =
    filteredCandidates.length > 0
      ? filteredCandidates[cardIndex % filteredCandidates.length]
      : null;
  const chatCandidate =
    allCandidates.find((candidate) => candidate.id === activeConversation) ??
    candidates[0];
  const messages = messageMap[activeConversation] ?? [];

  const go = (nextView: NetworkView, candidateId?: string) => {
    const query = new URLSearchParams({ view: nextView });
    if (candidateId) query.set("person", candidateId);
    navigate(`/app/matches?${query.toString()}`);
  };

  const nextCard = () => {
    if (filteredCandidates.length) setCardIndex((index) => (index + 1) % filteredCandidates.length);
  };

  const requestIntro = async (candidate: Candidate) => {
    if (candidate.live) {
      try {
        await requestMatchIntro(
          candidate.id,
          "I would like to explore a short founder working trial.",
        );
        setNotice(`Intro request sent to ${candidate.name}.`);
      } catch {
        setNotice("The intro request could not sync. Please try again.");
      }
    } else {
      setNotice(
        `Intro request prepared for ${candidate.name}. Review profiles do not receive messages.`,
      );
    }
    window.setTimeout(() => setNotice(""), 3200);
  };

  const completeMatchSetup = async (nextProfile: MatchProfile) => {
    const saved = auth.user?.isLocalReview
      ? nextProfile
      : (await saveMatchProfile(nextProfile)).profile;
    setMatchProfile(saved);
    setSetupComplete(true);
    setSetupOpen(false);
    localStorage.setItem(MATCH_PROFILE_STORAGE_KEY, JSON.stringify(saved));
    setNotice(
      auth.user?.isLocalReview
        ? "Matching profile saved on this device."
        : "Private matching profile synced securely.",
    );
  };

  const toggleProfileVisibility = async () => {
    const nextProfile = {
      ...matchProfile,
      published: !matchProfile.published,
    };
    try {
      const saved = auth.user?.isLocalReview
        ? nextProfile
        : (await saveMatchProfile(nextProfile)).profile;
      setMatchProfile(saved);
      localStorage.setItem(MATCH_PROFILE_STORAGE_KEY, JSON.stringify(saved));
      setNotice(
        saved.published
          ? "Profile published to signed-in founder discovery."
          : "Profile returned to private preview.",
      );
    } catch {
      setNotice("Profile visibility could not be updated. Please try again.");
    }
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessageMap((current) => ({
      ...current,
      [activeConversation]: [
        ...(current[activeConversation] ?? []),
        { from: "me", text, time: "Now" },
      ],
    }));
    setDraft("");
  };

  const scheduleIntro = () => {
    if (!selectedTime) return;
    setMessageMap((current) => ({
      ...current,
      [activeConversation]: [
        ...(current[activeConversation] ?? []),
        { from: "system", text: `Intro hold created for ${selectedDay} at ${selectedTime}. Calendar write requires production integration.`, time: "Now" },
      ],
    }));
    setSelectedTime("");
  };

  return (
    <div className="cofounder-network-page">
      {setupOpen && (
        <SetupWizard
          initialProfile={matchProfile}
          onClose={() => setSetupOpen(false)}
          onComplete={completeMatchSetup}
        />
      )}

      <section className="cofounder-network-hero">
        <div>
          <span className="eyebrow"><Handshake size={14} /> Complementary DNA network</span>
          <h2>Find the founder who strengthens the team—not your mirror image.</h2>
          <p>
            Compare demonstrated skills, vision, availability, and working
            expectations before spending weeks in unstructured calls.
          </p>
        </div>
        <div className="matching-profile-progress">
          <div>
            <span><UserRoundCheck size={18} /></span>
            <div><small>Your match profile</small><strong>{setupComplete ? "Ready to preview" : "3 of 4 steps complete"}</strong></div>
            <em>{setupComplete ? "100%" : "75%"}</em>
          </div>
          <i><b style={{ width: setupComplete ? "100%" : "75%" }} /></i>
          <button type="button" onClick={() => setSetupOpen(true)}>
            {setupComplete ? "Edit matching profile" : "Complete profile"} <ArrowRight size={14} />
          </button>
          {setupComplete && (
            <button type="button" onClick={() => void toggleProfileVisibility()}>
              {matchProfile.published ? "Make profile private" : "Publish to network"}
              <ShieldCheck size={14} />
            </button>
          )}
        </div>
      </section>

      <div className="matching-demo-disclosure">
        <ShieldCheck size={16} />
        <span><strong>Consent-based discovery</strong>Review profiles are illustrative and never receive messages. Signed-in published profiles load from Supabase and intro requests are stored with both participants protected by RLS.</span>
      </div>

      <nav className="cofounder-subnav" aria-label="Co-founder network">
        <button type="button" className={view === "discover" ? "is-active" : ""} onClick={() => go("discover")}>
          <Search size={16} /> Discover
        </button>
        <button type="button" className={view === "profile" ? "is-active" : ""} onClick={() => go("profile", selectedCandidate.id)}>
          <CircleUserRound size={16} /> Profile preview
        </button>
        <button type="button" className={view === "messages" ? "is-active" : ""} onClick={() => go("messages", activeConversation)}>
          <MessageCircle size={16} /> Messages <span>2</span>
        </button>
      </nav>

      {notice && <div className="matching-toast" role="status"><Check size={15} />{notice}</div>}

      {view === "discover" && (
        <section className="discovery-workspace">
          <aside className="match-filter-sidebar">
            <div className="match-filter-title"><Filter size={16} /><strong>Discovery filters</strong></div>
            <label>
              <span>Founder track</span>
              <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setCardIndex(0); }}>
                <option>All</option><option>Technical</option><option>Business</option><option>Hybrid</option>
              </select>
            </label>
            <label>
              <span>Minimum availability</span>
              <select value={hoursFilter} onChange={(event) => { setHoursFilter(event.target.value); setCardIndex(0); }}>
                <option value="Any">Any hours</option><option value="20">20+ hours</option><option value="30">30+ hours</option><option value="40">Full-time</option>
              </select>
            </label>
            <label>
              <span>Funding / build stage</span>
              <select value={stageFilter} onChange={(event) => { setStageFilter(event.target.value); setCardIndex(0); }}>
                <option>Any</option><option>Idea</option><option>Validating</option><option>MVP</option><option>Pre-seed</option>
              </select>
            </label>
            <label>
              <span>Location or mode</span>
              <div className="match-location-input"><MapPin size={14} /><input value={locationFilter} onChange={(event) => { setLocationFilter(event.target.value); setCardIndex(0); }} placeholder="City or remote" /></div>
            </label>
            <label className="verified-filter">
              <input type="checkbox" checked={verifiedOnly} onChange={(event) => { setVerifiedOnly(event.target.checked); setCardIndex(0); }} />
              <span><BadgeCheck size={14} /> All three checks</span>
            </label>
            <button
              type="button"
              className="clear-match-filters"
              onClick={() => {
                setRoleFilter("All"); setHoursFilter("Any"); setStageFilter("Any");
                setLocationFilter(""); setVerifiedOnly(false); setCardIndex(0);
              }}
            >
              Clear all filters
            </button>
            <div className="filter-trust-note"><ShieldCheck size={15} /><span><strong>Trust before contact</strong>Verification is shown by source—not one vague badge.</span></div>
          </aside>

          <div className="discovery-results">
            <div className="discovery-toolbar">
              <div><span>{filteredCandidates.length} compatible profiles</span><small>Sorted by complementary fit</small></div>
              <div className="discovery-view-toggle" aria-label="Discovery view">
                <button type="button" className={mode === "card" ? "is-active" : ""} onClick={() => setMode("card")}><Sparkles size={14} /> Card</button>
                <button type="button" className={mode === "grid" ? "is-active" : ""} onClick={() => setMode("grid")}><Grid2X2 size={14} /> Grid</button>
              </div>
            </div>

            {filteredCandidates.length === 0 && (
              <div className="empty-match-results">
                <SlidersHorizontal size={24} />
                <h3>No profiles meet every filter.</h3>
                <p>Widen availability, stage, or verification requirements.</p>
              </div>
            )}

            {mode === "card" && activeCard && (
              <div className="swipe-discovery">
                <div className="swipe-card-stage">
                  <CandidateCard
                    candidate={activeCard}
                    onProfile={() => go("profile", activeCard.id)}
                    onIntro={() => requestIntro(activeCard)}
                  />
                  <div className="swipe-actions" aria-label="Profile actions">
                    <button type="button" className="is-pass" onClick={nextCard} aria-label="Pass on profile"><X size={20} /><span>Pass</span></button>
                    <button
                      type="button"
                      className={`is-save ${saved.includes(activeCard.id) ? "is-active" : ""}`}
                      onClick={() => setSaved((items) => items.includes(activeCard.id) ? items.filter((id) => id !== activeCard.id) : [...items, activeCard.id])}
                      aria-label="Save profile"
                    >
                      <Star size={20} /><span>{saved.includes(activeCard.id) ? "Saved" : "Save"}</span>
                    </button>
                    <button type="button" className="is-connect" onClick={() => requestIntro(activeCard)} aria-label="Request an introduction"><Handshake size={20} /><span>Intro</span></button>
                  </div>
                  <div className="swipe-pagination">
                    <button type="button" onClick={() => setCardIndex((index) => (index - 1 + filteredCandidates.length) % filteredCandidates.length)} aria-label="Previous profile"><ChevronLeft size={17} /></button>
                    <span>{(cardIndex % filteredCandidates.length) + 1} / {filteredCandidates.length}</span>
                    <button type="button" onClick={nextCard} aria-label="Next profile"><ChevronRight size={17} /></button>
                  </div>
                </div>
                <aside className="compatibility-inspector">
                  <div><span className="compatibility-icon"><Zap size={17} /></span><div><small>Why this match</small><strong>Strength where your profile has a gap</strong></div></div>
                  <SkillComparison candidate={activeCard} profile={profile} />
                  <div className="compatibility-signals">
                    <span><Check size={13} /> Vision language aligns</span>
                    <span><Check size={13} /> Commitment overlap is workable</span>
                    <span><Check size={13} /> Skill mix is complementary</span>
                  </div>
                  <p>Match scores are prototype decision aids, not validated compatibility predictions.</p>
                </aside>
              </div>
            )}

            {mode === "grid" && (
              <div className="candidate-grid">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    compact
                    onProfile={() => go("profile", candidate.id)}
                    onIntro={() => requestIntro(candidate)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {view === "profile" && (
        <section className="match-profile-view">
          <button className="back-to-discovery" type="button" onClick={() => go("discover")}><ArrowLeft size={15} /> Back to discovery</button>
          <div className="profile-identity-card">
            <div className="profile-identity-main">
              <span className={`candidate-avatar is-${selectedCandidate.track.toLowerCase()}`}>{selectedCandidate.initials}</span>
              <div>
                <span className={`founder-track-tag is-${selectedCandidate.track.toLowerCase()}`}>{selectedCandidate.track} founder</span>
                <h2>
                  {selectedCandidate.name}{" "}
                  {selectedCandidate.verified.includes("Identity") && (
                    <BadgeCheck size={19} aria-label="Identity verified" />
                  )}
                </h2>
                <p>{selectedCandidate.headline}</p>
                <div><MapPin size={13} /> {selectedCandidate.location} · {selectedCandidate.workMode}</div>
              </div>
            </div>
            <div className="profile-identity-score">
              <MatchScore value={selectedCandidate.match} />
              <button className="button button-primary" type="button" onClick={() => requestIntro(selectedCandidate)}><Handshake size={15} /> Request intro</button>
            </div>
            <VerificationBadges items={selectedCandidate.verified} />
          </div>

          <div className="profile-detail-grid">
            <div className="profile-detail-main">
              <article className="profile-story-card">
                <span className="profile-section-label">Founder story</span>
                <h3>What I am building toward</h3>
                <p>{selectedCandidate.bio}</p>
                <blockquote>{selectedCandidate.vision}</blockquote>
              </article>

              <article className="pitch-video-card">
                <div className="pitch-video-placeholder">
                  <span><Play size={23} /></span>
                  <div><small>60-second founder pitch</small><strong>Video not included in the illustrative profile</strong></div>
                </div>
                <div className="pitch-video-copy">
                  <Video size={18} />
                  <span><strong>Pitch verification slot</strong><small>Production uploads require consent, moderation, storage, and deletion controls.</small></span>
                </div>
              </article>

              <article className="profile-skill-card">
                <span className="profile-section-label">Complementarity map</span>
                <h3>Where the team becomes stronger</h3>
                <SkillComparison candidate={selectedCandidate} profile={profile} />
              </article>

              <article className="profile-evidence-card">
                <span className="profile-section-label">Work evidence</span>
                <h3>Claims worth discussing in the first call</h3>
                <div>
                  {selectedCandidate.evidence.map((item, index) => (
                    <span key={item}><i>{String(index + 1).padStart(2, "0")}</i><strong>{item}</strong><BadgeCheck size={15} /></span>
                  ))}
                </div>
              </article>
            </div>

            <aside className="profile-detail-side">
              <article>
                <span className="profile-section-label">Working agreement</span>
                <dl>
                  <div><dt>Availability</dt><dd>{selectedCandidate.availability}</dd></div>
                  <div><dt>Stage</dt><dd>{selectedCandidate.stage}</dd></div>
                  <div><dt>Equity</dt><dd>{selectedCandidate.equity}</dd></div>
                  <div><dt>Work mode</dt><dd>{selectedCandidate.workMode}</dd></div>
                </dl>
              </article>
              <article>
                <span className="profile-section-label">What they bring</span>
                <div className="profile-pill-list">{selectedCandidate.gives.map((item) => <span key={item}>{item}</span>)}</div>
              </article>
              <article>
                <span className="profile-section-label">What they need</span>
                <div className="profile-pill-list is-needs">{selectedCandidate.needs.map((item) => <span key={item}>{item}</span>)}</div>
              </article>
              <article className="profile-safety-card">
                <ShieldCheck size={19} />
                <div><strong>Start with a working trial</strong><p>Use a scoped two-week project before discussing permanent roles or equity.</p></div>
              </article>
            </aside>
          </div>
        </section>
      )}

      {view === "messages" && (
        <section className="communication-hub">
          <aside className="conversation-list">
            <div className="conversation-list-head"><div><span>Messages</span><strong>Founder conversations</strong></div><button type="button" aria-label="Start new conversation"><MessageCircle size={16} /></button></div>
            <label className="conversation-search"><Search size={14} /><input placeholder="Search conversations" /></label>
            <div>
              {conversations.map((conversation) => {
                const candidate = allCandidates.find((item) => item.id === conversation.id) ?? candidates[0];
                return (
                  <button
                    type="button"
                    key={conversation.id}
                    className={activeConversation === conversation.id ? "is-active" : ""}
                    onClick={() => {
                      setActiveConversation(conversation.id);
                      navigate(`/app/matches?view=messages&person=${conversation.id}`, { replace: true });
                    }}
                  >
                    <span className={`conversation-avatar is-${candidate.track.toLowerCase()}`}>{candidate.initials}</span>
                    <div><strong>{candidate.name}<BadgeCheck size={11} /></strong><small>{conversation.preview}</small></div>
                    <em>{conversation.time}</em>
                    {conversation.unread > 0 && <i>{conversation.unread}</i>}
                  </button>
                );
              })}
            </div>
            <p><ShieldCheck size={13} /> Illustrative local conversation data</p>
          </aside>

          <div className="chat-pane">
            <header className="chat-profile-pin">
              <span className={`conversation-avatar is-${chatCandidate.track.toLowerCase()}`}>{chatCandidate.initials}</span>
              <div><strong>{chatCandidate.name}<BadgeCheck size={12} /></strong><small>{chatCandidate.match}% match · {chatCandidate.track} · {chatCandidate.location}</small></div>
              <button type="button" onClick={() => go("profile", chatCandidate.id)}>View profile</button>
            </header>
            <div className="chat-icebreakers">
              <span>Quick starts</span>
              {["Compare founder gaps", "Share a customer problem", "Schedule a 15-min intro"].map((prompt) => (
                <button type="button" key={prompt} onClick={() => setDraft(prompt)}>{prompt}</button>
              ))}
            </div>
            <div className="chat-messages" aria-live="polite">
              <div className="chat-day"><span>Today</span></div>
              {messages.map((message, index) => (
                <div className={`chat-message is-${message.from}`} key={`${message.time}-${index}`}>
                  {message.from === "them" && <span className={`conversation-avatar is-${chatCandidate.track.toLowerCase()}`}>{chatCandidate.initials}</span>}
                  <div><p>{message.text}</p><small>{message.time}</small></div>
                </div>
              ))}
            </div>
            <form className="chat-composer" onSubmit={sendMessage}>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Message" placeholder={`Message ${chatCandidate.name.split(" ")[0]}…`} />
              <button type="submit" aria-label="Send message"><Send size={17} /></button>
            </form>
          </div>

          <aside className="intro-scheduler">
            <div className="intro-scheduler-head"><span><CalendarDays size={17} /></span><div><small>Intro scheduler</small><strong>Book 15 minutes</strong></div></div>
            <p>Choose a shared opening. Calendar writes activate after a provider is connected.</p>
            <div className="scheduler-days">
              {["Mon 28", "Tue 29", "Wed 30"].map((day) => (
                <button type="button" key={day} className={selectedDay === day ? "is-active" : ""} onClick={() => { setSelectedDay(day); setSelectedTime(""); }}>
                  <span>{day.split(" ")[0]}</span><strong>{day.split(" ")[1]}</strong>
                </button>
              ))}
            </div>
            <div className="scheduler-times">
              {["10:30 AM", "1:00 PM", "4:30 PM"].map((time) => (
                <button type="button" key={time} className={selectedTime === time ? "is-active" : ""} onClick={() => setSelectedTime(time)}>{time}</button>
              ))}
            </div>
            <button type="button" className="button button-primary" disabled={!selectedTime} onClick={scheduleIntro}>
              <CalendarDays size={15} /> Hold this time
            </button>
            <div className="calendar-integration-state"><CalendarDays size={14} /><span><strong>Calendar integration ready</strong>Connect Google or Outlook credentials in production.</span></div>
          </aside>
        </section>
      )}
    </div>
  );
}
