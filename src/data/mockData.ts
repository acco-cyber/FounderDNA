import type {
  AssessmentQuestion,
  FounderProfile,
  Opportunity,
  TraitKey,
} from "../types";

export const traitMeta: Record<
  TraitKey,
  { label: string; short: string; description: string; color: string }
> = {
  painPointProximity: {
    label: "Pain-point proximity",
    short: "Proximity",
    description: "How directly your lived experience connects to the problem.",
    color: "#00C9A7",
  },
  executionVelocity: {
    label: "Execution velocity",
    short: "Velocity",
    description: "How quickly you turn a decision into a real-world test.",
    color: "#19DCC0",
  },
  resourcefulness: {
    label: "Resourcefulness",
    short: "Resource",
    description: "How effectively you create momentum with limited inputs.",
    color: "#FF6B6B",
  },
  networkLeverage: {
    label: "Network leverage",
    short: "Network",
    description: "How intentionally you activate relevant relationships.",
    color: "#5A7DFF",
  },
  riskCalibration: {
    label: "Risk calibration",
    short: "Risk",
    description: "How well you size, sequence, and reverse uncertain bets.",
    color: "#C77DFF",
  },
  localMarketFluency: {
    label: "Local market fluency",
    short: "Fluency",
    description: "How clearly you read the people and systems around you.",
    color: "#7B72E9",
  },
};

export const emptyProfile: FounderProfile = {
  name: "",
  initials: "",
  city: "",
  region: "",
  industry: "",
  commitment: "Exploring",
  assessmentComplete: false,
  reflection: "",
  answers: {},
  scores: {
    painPointProximity: 0,
    executionVelocity: 0,
    resourcefulness: 0,
    networkLeverage: 0,
    riskCalibration: 0,
    localMarketFluency: 0,
  },
};

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "origin-1",
    section: "origin",
    eyebrow: "Lived experience",
    prompt: "A frustrating problem keeps showing up in your week. What happens next?",
    context: "Choose the response closest to what you would actually do—not the ideal answer.",
    options: [
      {
        id: "a",
        label: "Write it down and watch for the pattern over the next month.",
        insight: "Patient observer",
        scores: { painPointProximity: 3, riskCalibration: 2 },
      },
      {
        id: "b",
        label: "Ask five other people when it last happened to them.",
        insight: "Customer-led investigator",
        scores: { painPointProximity: 4, localMarketFluency: 3, networkLeverage: 2 },
      },
      {
        id: "c",
        label: "Make a rough workaround tonight and hand it to one person tomorrow.",
        insight: "Prototype-first builder",
        scores: { executionVelocity: 4, resourcefulness: 4, painPointProximity: 2 },
      },
    ],
  },
  {
    id: "origin-2",
    section: "origin",
    eyebrow: "Signal quality",
    prompt: "Three friends say your idea is great, but no one has paid. How do you read that?",
    context: "We are looking at how you separate encouragement from evidence.",
    options: [
      {
        id: "a",
        label: "The idea is promising; I need a larger survey before changing it.",
        insight: "Evidence accumulator",
        scores: { riskCalibration: 2, localMarketFluency: 1 },
      },
      {
        id: "b",
        label: "It is unvalidated. I ask for a deposit or a concrete commitment next.",
        insight: "Commitment seeker",
        scores: { executionVelocity: 4, riskCalibration: 4, painPointProximity: 2 },
      },
      {
        id: "c",
        label: "I ask what they use today and what would make switching worth it.",
        insight: "Behavior reader",
        scores: { painPointProximity: 4, localMarketFluency: 3, riskCalibration: 3 },
      },
    ],
  },
  {
    id: "origin-3",
    section: "origin",
    eyebrow: "Founder advantage",
    prompt: "You discover a better-funded team pursuing the same customer. Your move?",
    context: "Competition can be a warning, proof, or a wedge.",
    options: [
      {
        id: "a",
        label: "Narrow to the customer group I understand better than they do.",
        insight: "Insight wedge",
        scores: { painPointProximity: 4, localMarketFluency: 4, riskCalibration: 3 },
      },
      {
        id: "b",
        label: "Move faster on the smallest useful version and learn from live users.",
        insight: "Speed wedge",
        scores: { executionVelocity: 4, resourcefulness: 3, riskCalibration: 2 },
      },
      {
        id: "c",
        label: "Contact them and explore a supplier, referral, or partnership angle.",
        insight: "Network wedge",
        scores: { networkLeverage: 4, resourcefulness: 4, localMarketFluency: 2 },
      },
    ],
  },
  {
    id: "execution-1",
    section: "execution",
    eyebrow: "Constraint test",
    prompt: "You have $500 and 14 days to validate a service business. What gets funded?",
    context: "The budget is fixed. Pick the plan you would defend.",
    options: [
      {
        id: "a",
        label: "$300 landing page, $200 social ads, then review sign-ups.",
        insight: "Demand test",
        scores: { executionVelocity: 3, riskCalibration: 2, resourcefulness: 2 },
      },
      {
        id: "b",
        label: "$80 transport, $40 printouts, and 30 in-person customer conversations.",
        insight: "Field operator",
        scores: { resourcefulness: 4, localMarketFluency: 4, painPointProximity: 3 },
      },
      {
        id: "c",
        label: "Keep $450. Use no-code tools and pre-sell the first three slots.",
        insight: "Capital-efficient seller",
        scores: { resourcefulness: 4, executionVelocity: 4, riskCalibration: 4 },
      },
    ],
  },
  {
    id: "execution-2",
    section: "execution",
    eyebrow: "Decision speed",
    prompt: "A pilot customer requests a feature that delays launch by two weeks.",
    context: "The request could unlock a deal, or pull the product off course.",
    options: [
      {
        id: "a",
        label: "Build it if they sign a paid pilot agreement first.",
        insight: "Conditional builder",
        scores: { riskCalibration: 4, executionVelocity: 3, resourcefulness: 2 },
      },
      {
        id: "b",
        label: "Offer a manual concierge workaround and launch on time.",
        insight: "Manual-first operator",
        scores: { resourcefulness: 4, executionVelocity: 4, painPointProximity: 2 },
      },
      {
        id: "c",
        label: "Interview three similar customers before deciding.",
        insight: "Market triangulator",
        scores: { localMarketFluency: 4, riskCalibration: 3, painPointProximity: 3 },
      },
    ],
  },
  {
    id: "execution-3",
    section: "execution",
    eyebrow: "Recovery pattern",
    prompt: "Your first launch gets almost no response. What do you do within 48 hours?",
    context: "Momentum after disappointment is one of the clearest founder signals.",
    options: [
      {
        id: "a",
        label: "Call the people who ignored it and ask them to narrate why.",
        insight: "Direct learner",
        scores: { executionVelocity: 4, networkLeverage: 3, painPointProximity: 3 },
      },
      {
        id: "b",
        label: "Rewrite the offer around the sharpest customer pain and relaunch.",
        insight: "Rapid reframer",
        scores: { executionVelocity: 4, resourcefulness: 4, painPointProximity: 2 },
      },
      {
        id: "c",
        label: "Check channel, audience, offer, and timing before changing one variable.",
        insight: "Disciplined debugger",
        scores: { riskCalibration: 4, localMarketFluency: 3, resourcefulness: 2 },
      },
    ],
  },
  {
    id: "market-1",
    section: "market",
    eyebrow: "Local intelligence",
    prompt: "A neighborhood is changing quickly. Which signal do you trust first?",
    context: "Local opportunity hides in behavior, not just reports.",
    options: [
      {
        id: "a",
        label: "Repeated complaints from residents and frontline workers.",
        insight: "Ground-truth listener",
        scores: { localMarketFluency: 4, painPointProximity: 4, networkLeverage: 2 },
      },
      {
        id: "b",
        label: "Permit, demographic, search, and spending data moving together.",
        insight: "Signal synthesizer",
        scores: { localMarketFluency: 4, riskCalibration: 4, resourcefulness: 1 },
      },
      {
        id: "c",
        label: "Where established operators are quietly adding capacity.",
        insight: "Operator watcher",
        scores: { localMarketFluency: 3, networkLeverage: 3, riskCalibration: 3 },
      },
    ],
  },
  {
    id: "market-2",
    section: "market",
    eyebrow: "Relationship capital",
    prompt: "You need ten customer introductions in a sector where you know two people.",
    context: "This tests how you turn a small network into a relevant one.",
    options: [
      {
        id: "a",
        label: "Ask each contact for two specific introductions and explain the learning goal.",
        insight: "Warm-path mapper",
        scores: { networkLeverage: 4, executionVelocity: 3, localMarketFluency: 2 },
      },
      {
        id: "b",
        label: "Volunteer at the next industry event and interview attendees.",
        insight: "Community embedder",
        scores: { networkLeverage: 4, resourcefulness: 4, localMarketFluency: 3 },
      },
      {
        id: "c",
        label: "Publish a useful teardown and invite operators to correct it.",
        insight: "Value-first connector",
        scores: { networkLeverage: 3, resourcefulness: 4, painPointProximity: 2 },
      },
    ],
  },
  {
    id: "market-3",
    section: "market",
    eyebrow: "Risk design",
    prompt: "The opportunity is strong, but you need six months before reliable income.",
    context: "The goal is not maximum risk—it is survivable risk.",
    options: [
      {
        id: "a",
        label: "Secure two paid design partners before leaving current income.",
        insight: "Milestone de-risker",
        scores: { riskCalibration: 4, networkLeverage: 3, executionVelocity: 2 },
      },
      {
        id: "b",
        label: "Reduce personal burn, set a runway floor, and commit full-time.",
        insight: "Runway architect",
        scores: { riskCalibration: 4, resourcefulness: 4, executionVelocity: 3 },
      },
      {
        id: "c",
        label: "Start with the cash-generating service layer, then fund the larger product.",
        insight: "Revenue sequencer",
        scores: { riskCalibration: 4, resourcefulness: 4, localMarketFluency: 2 },
      },
    ],
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "care-circle",
    title: "CareCircle Local",
    category: "Aging-in-place services",
    thesis:
      "A trusted coordination layer for families managing home care, transport, meals, and provider handoffs.",
    signal:
      "Families coordinating care across several providers may experience costly, trust-breaking handoffs.",
    requiredTraits: {
      painPointProximity: 85,
      resourcefulness: 78,
      localMarketFluency: 80,
      riskCalibration: 68,
    },
    fitBoost: ["painPointProximity", "localMarketFluency", "resourcefulness"],
    tags: ["Service-first", "Recurring revenue", "Local trust"],
  },
  {
    id: "permit-pilot",
    title: "PermitPilot",
    category: "Trades operations",
    thesis:
      "A concierge permit and inspection workflow for small residential contractors losing days to administration.",
    signal:
      "Small contractors may lose billable time navigating permits, inspections, and status follow-up.",
    requiredTraits: {
      executionVelocity: 82,
      resourcefulness: 84,
      networkLeverage: 70,
      localMarketFluency: 75,
    },
    fitBoost: ["executionVelocity", "resourcefulness", "networkLeverage"],
    tags: ["B2B", "Concierge MVP", "Workflow"],
  },
  {
    id: "shift-table",
    title: "ShiftTable",
    category: "Hospitality workforce",
    thesis:
      "A vetted last-minute staffing pool shared by independent restaurants and event operators.",
    signal:
      "Independent hospitality operators may lack a trusted way to fill urgent shifts without agency overhead.",
    requiredTraits: {
      executionVelocity: 78,
      networkLeverage: 85,
      riskCalibration: 76,
      localMarketFluency: 80,
    },
    fitBoost: ["networkLeverage", "localMarketFluency", "riskCalibration"],
    tags: ["Marketplace", "Operations", "High frequency"],
  },
  {
    id: "heatwise",
    title: "HeatWise Homes",
    category: "Climate resilience",
    thesis:
      "Home heat-risk audits with prioritized retrofit plans and a trusted installer network.",
    signal:
      "Homeowners facing hotter seasons may need a simpler way to prioritize affordable resilience work.",
    requiredTraits: {
      painPointProximity: 70,
      executionVelocity: 74,
      networkLeverage: 76,
      riskCalibration: 82,
    },
    fitBoost: ["riskCalibration", "networkLeverage", "executionVelocity"],
    tags: ["Home services", "Climate", "Partner network"],
  },
];
