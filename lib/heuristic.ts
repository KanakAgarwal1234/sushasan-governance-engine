import type { Benchmark, Diagnostic, FailureCategory, InterventionPhase, RootCause } from "./types";

/**
 * Deterministic, offline diagnostic builder for custom links when no LLM is
 * available. It scores the transcript against sector and failure-mode lexicons,
 * pulls the most governance-dense sentences as evidence, and fills a Samagra
 * 4-part template. Also used to back-fill any field an LLM omits.
 */

interface Domain {
  key: string;
  sector: string;
  department: string;
  frontline: string;
  keywords: string[];
  outcome: string;
  stakeholders: string[];
  outcomeMetric: Benchmark;
}

const DOMAINS: Domain[] = [
  {
    key: "education",
    sector: "School Education",
    department: "School Education Department",
    frontline: "teachers and cluster coordinators",
    keywords: ["school", "teacher", "student", "learning", "education", "classroom", "literacy", "numeracy", "nep", "exam", "curriculum"],
    outcome: "learning outcomes",
    stakeholders: ["Students", "Teachers & head teachers", "Block/cluster education officers", "State School Education Department"],
    outcomeMetric: { metric: "Students meeting grade-level learning benchmarks", baseline: "Sample-based baseline in Days 1–30", target: "+10 percentage points", timeframe: "12 months", measurementMethod: "Independent sample-based assessment" },
  },
  {
    key: "health",
    sector: "Public Health",
    department: "Health & Family Welfare Department",
    frontline: "ASHAs, ANMs and PHC staff",
    keywords: ["health", "hospital", "doctor", "patient", "vaccine", "vaccination", "covid", "disease", "asha", "anm", "phc", "medicine", "nutrition"],
    outcome: "health service coverage",
    stakeholders: ["Patients & families", "ASHAs, ANMs & CHOs", "PHC/CHC medical officers", "State Health Department"],
    outcomeMetric: { metric: "Coverage of priority health services in pilot districts", baseline: "HMIS baseline", target: "+15 percentage points", timeframe: "6 months", measurementMethod: "HMIS data with random facility verification" },
  },
  {
    key: "urban",
    sector: "Urban Governance & Sanitation",
    department: "Urban Development Department",
    frontline: "ward and ULB field staff",
    keywords: ["city", "urban", "municipal", "waste", "garbage", "sanitation", "swachh", "ward", "water", "drainage", "smart city"],
    outcome: "service-level benchmarks in wards",
    stakeholders: ["Urban residents", "Sanitation & ward staff", "Urban Local Bodies", "State Urban Development Department"],
    outcomeMetric: { metric: "Wards meeting service-level benchmarks", baseline: "Ward audit in Days 1–30", target: "≥80% of pilot wards", timeframe: "90 days", measurementMethod: "Geo-tagged third-party ward audits" },
  },
  {
    key: "law",
    sector: "Law & Order and Justice",
    department: "Home Department",
    frontline: "police stations and beat officers",
    keywords: ["police", "crime", "law and order", "court", "justice", "fir", "mafia", "security", "prison", "case", "investigation"],
    outcome: "case disposal and citizen safety",
    stakeholders: ["Citizens & victims", "Police station staff", "District police leadership", "Home Department"],
    outcomeMetric: { metric: "Median days from FIR to charge-sheet", baseline: "CCTNS baseline", target: "−30%", timeframe: "6 months", measurementMethod: "CCTNS case-level timestamps" },
  },
  {
    key: "agri",
    sector: "Agriculture & Rural Livelihoods",
    department: "Agriculture & Rural Development Departments",
    frontline: "block agriculture and rural development staff",
    keywords: ["farmer", "agriculture", "crop", "rural", "village", "panchayat", "irrigation", "mandi", "livelihood", "shg", "land"],
    outcome: "farmer and household incomes",
    stakeholders: ["Farmers & rural households", "Panchayat functionaries", "Block-level officers", "Agriculture & RD Departments"],
    outcomeMetric: { metric: "Eligible farmers/households receiving entitlements on time", baseline: "Scheme MIS baseline", target: "+20 percentage points", timeframe: "6 months", measurementMethod: "MIS reconciled with beneficiary phone survey" },
  },
  {
    key: "welfare",
    sector: "Welfare Delivery & DBT",
    department: "Social Welfare / Finance (DBT Cell)",
    frontline: "scheme verification and disbursement staff",
    keywords: ["scheme", "beneficiary", "dbt", "pension", "subsidy", "welfare", "ration", "aadhaar", "leakage", "entitlement", "benefit"],
    outcome: "on-time, leakage-free benefit delivery",
    stakeholders: ["Beneficiaries", "Village-level functionaries", "District scheme officers", "State DBT Cell"],
    outcomeMetric: { metric: "Leakage / ineligible payouts detected", baseline: "Reconciliation baseline", target: "−30% leakage", timeframe: "6 months", measurementMethod: "Database reconciliation + sample field verification" },
  },
  {
    key: "industry",
    sector: "Industry & Ease of Doing Business",
    department: "Industries / MSME Department",
    frontline: "district industries centres",
    keywords: ["industry", "investment", "msme", "business", "startup", "clearance", "license", "permission", "factory", "entrepreneur", "export"],
    outcome: "time and cost to start and run a business",
    stakeholders: ["Entrepreneurs & MSMEs", "District Industries Centres", "Regulatory departments", "Industries Department"],
    outcomeMetric: { metric: "Median days to grant key business approvals", baseline: "Single-window logs", target: "−50%", timeframe: "6 months", measurementMethod: "Single-window application timestamps" },
  },
];

const GENERAL: Domain = {
  key: "general",
  sector: "Public Administration",
  department: "General Administration Department",
  frontline: "district and block field functionaries",
  keywords: [],
  outcome: "citizen-facing service delivery",
  stakeholders: ["Citizens", "Frontline functionaries", "District administration", "State line departments"],
  outcomeMetric: { metric: "Citizen services delivered within notified timelines", baseline: "Public-service delivery logs", target: "≥90% within SLA", timeframe: "6 months", measurementMethod: "Service-delivery portal timestamps" },
};

interface CategoryProfile {
  keywords: string[];
  mode: string;
  description: string;
  rootCauses: RootCause[];
  burdenMetric: Benchmark;
}

const CATEGORIES: Record<FailureCategory, CategoryProfile> = {
  "Data Silos": {
    keywords: ["data", "portal", "mis", "dashboard", "database", "silo", "integration", "register", "app", "digital", "report"],
    mode: "Fragmented scheme-wise data systems with no shared identity or verification",
    description: "Each programme maintains its own portal and formats, forcing duplicate entry at the frontline and producing inconsistent numbers that reviews cannot act on.",
    rootCauses: [
      { cause: "Portal proliferation", explanation: "Schemes build separate MIS without shared IDs or data standards." },
      { cause: "Self-reported, unverified data", explanation: "No sample-based validation, so reported numbers drift from reality." },
      { cause: "Dashboards not used in review", explanation: "Data is collected for upward reporting, not for local decisions." },
    ],
    burdenMetric: { metric: "Duplicate data-entry hours at the frontline", baseline: "Time-use sample in Days 1–30", target: "−40%", timeframe: "90 days", measurementMethod: "Repeat time-use survey on same sample" },
  },
  "Compliance Burden": {
    keywords: ["approval", "file", "compliance", "paperwork", "permission", "procedure", "audit", "circular", "rules", "vigilance", "noc", "sanction"],
    mode: "Multi-layer approvals and audit fear slowing decisions",
    description: "Decisions travel through multiple desks and sign-offs, rules are interpreted conservatively for fear of audit and vigilance, and routine actions are escalated instead of delegated.",
    rootCauses: [
      { cause: "Excessive approval layers", explanation: "Routine files require sign-offs far above the level of risk involved." },
      { cause: "Risk-averse rule interpretation", explanation: "Fear of audit objections discourages officers from using delegated powers." },
      { cause: "Paper-first processes", explanation: "Digitised forms replicate paper steps instead of re-engineering them." },
    ],
    burdenMetric: { metric: "Median file disposal time for routine approvals", baseline: "e-Office logs in Days 1–30", target: "−50%", timeframe: "90 days", measurementMethod: "e-Office file movement timestamps" },
  },
  "Last-Mile Friction": {
    keywords: ["last mile", "beneficiary", "village", "door", "delivery", "access", "ground", "citizen", "visit", "queue", "grievance"],
    mode: "Entitlements designed at the top fail at the point of citizen contact",
    description: "Citizens face documentation hurdles, repeated office visits and opaque grievance redressal, so eligible people drop out before benefits or services reach them.",
    rootCauses: [
      { cause: "Document-heavy eligibility", explanation: "Citizens must repeatedly prove eligibility the State already knows." },
      { cause: "Opaque grievance channels", explanation: "Complaints are closed on paper without resolution or feedback." },
      { cause: "Thin frontline coverage", explanation: "Too few functionaries cover too many households." },
    ],
    burdenMetric: { metric: "Citizen visits required per service availed", baseline: "Exit-interview sample", target: "−50%", timeframe: "90 days", measurementMethod: "Citizen exit interviews and IVR feedback" },
  },
  "Capacity Deficit": {
    keywords: ["staff", "vacancy", "training", "capacity", "shortage", "skill", "manpower", "workload", "overburdened", "recruitment"],
    mode: "Under-staffed, under-trained middle and frontline layers",
    description: "Vacancies and multi-tasking leave the middle layer unable to supervise, coach or act on data, so policy intent does not translate into field practice.",
    rootCauses: [
      { cause: "Chronic vacancies", explanation: "Sanctioned posts remain unfilled for long periods." },
      { cause: "Role dilution", explanation: "Technical staff are pulled into administrative and reporting work." },
      { cause: "One-off training", explanation: "Training is event-based with no on-the-job coaching." },
    ],
    burdenMetric: { metric: "Critical-role vacancy rate", baseline: "HR audit in Days 1–30", target: "−40%", timeframe: "6 months", measurementMethod: "HR records reconciled with field verification" },
  },
  "Accountability Gap": {
    keywords: ["accountability", "review", "monitoring", "target", "outcome", "responsibility", "performance", "result", "measure", "goal"],
    mode: "Reviews track inputs and spend rather than outcomes owned by named officers",
    description: "Responsibility for outcomes is diffused across departments, reviews focus on fund utilisation and compliance, and there is no consequence or recognition tied to results.",
    rootCauses: [
      { cause: "Input-focused review agenda", explanation: "Meetings track spend and activities, not outcomes." },
      { cause: "Diffused ownership", explanation: "No single officer owns an outcome at district or block level." },
      { cause: "Weak recognition and consequence", explanation: "Performance does not affect postings, recognition or resources." },
    ],
    burdenMetric: { metric: "Reviews run on an outcome scorecard", baseline: "Audit of review minutes", target: "100% of pilot district reviews", timeframe: "90 days", measurementMethod: "Review minutes audited by state PMU" },
  },
  "Coordination Failure": {
    keywords: ["coordination", "convergence", "department", "centre", "state", "inter", "multiple departments", "together", "alignment", "ministry"],
    mode: "Line departments and levels of government working in parallel, not together",
    description: "Outcomes that depend on several departments fall between them; Centre–State and inter-departmental hand-offs lack shared targets, data and timelines.",
    rootCauses: [
      { cause: "Departmental silos", explanation: "Each department optimises its own scheme metrics." },
      { cause: "No convergence forum", explanation: "There is no regular decision forum with authority across departments." },
      { cause: "Misaligned fund flows", explanation: "Funds arrive at different times for interdependent activities." },
    ],
    burdenMetric: { metric: "Inter-departmental issues resolved within 14 days", baseline: "Issue log in Days 1–30", target: "≥80%", timeframe: "90 days", measurementMethod: "Convergence-committee issue tracker" },
  },
  "Incentive Misalignment": {
    keywords: ["incentive", "reward", "transfer", "posting", "political", "career", "motivation", "pressure", "credit", "blame"],
    mode: "Career incentives reward compliance and visibility over sustained outcomes",
    description: "Frequent transfers, credit for launches rather than results, and blame for failures push officers towards short-term, low-risk actions.",
    rootCauses: [
      { cause: "Short tenures", explanation: "Officers move before reforms mature." },
      { cause: "Launch over outcomes", explanation: "Recognition flows to announcements, not sustained results." },
      { cause: "Asymmetric risk", explanation: "Failure is punished; inaction rarely is." },
    ],
    burdenMetric: { metric: "Median tenure of key implementation officers", baseline: "HR data", target: "≥2 years for mission-critical posts", timeframe: "12 months", measurementMethod: "Posting records" },
  },
};

function score(text: string, words: string[]): number {
  let total = 0;
  for (const w of words) {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gi");
    total += text.match(re)?.length ?? 0;
  }
  return total;
}

export function detectDomain(text: string): Domain {
  const ranked = DOMAINS.map((d) => ({ d, s: score(text, d.keywords) })).sort((a, b) => b.s - a.s);
  return ranked[0] && ranked[0].s >= 3 ? ranked[0].d : GENERAL;
}

export function rankCategories(text: string): FailureCategory[] {
  return (Object.keys(CATEGORIES) as FailureCategory[])
    .map((c) => ({ c, s: score(text, CATEGORIES[c].keywords) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
}

const EVIDENCE_TERMS = [
  "data", "district", "collector", "scheme", "delivery", "review", "village", "citizen", "approval", "department",
  "staff", "budget", "target", "monitor", "crore", "lakh", "percent", "%", "system", "implementation", "field",
];

export function extractEvidence(text: string, max = 4): string[] {
  const sentences = text
    .replace(/\[[^\]]*\]/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 60 && s.length <= 240);

  const scored = sentences
    .map((s, idx) => ({ s, idx, score: score(s, EVIDENCE_TERMS) + (/\d/.test(s) ? 1 : 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .sort((a, b) => a.idx - b.idx);

  return scored.map((x) => x.s);
}

export interface HeuristicInput {
  transcript: string;
  title: string;
  guest: string;
  guestRole: string;
  url: string;
  videoId: string | null;
  /** Text used for sector detection when the transcript is generic (e.g. the composite brief). */
  domainHint?: string;
}

export function buildHeuristicDiagnostic(input: HeuristicInput): Diagnostic {
  const corpus = `${input.title} ${input.transcript}`;
  const domain = detectDomain(input.domainHint ?? corpus);
  const [primary, ...rest] = rankCategories(corpus);
  const profile = CATEGORIES[primary];
  const evidence = extractEvidence(input.transcript);

  const phases: InterventionPhase[] = [
    {
      window: "Days 1–30",
      theme: "Diagnose & Mandate",
      objective: `Secure a leadership mandate and baseline the ${domain.outcome} problem in 2 pilot districts.`,
      actions: [
        `Issue a Chief Secretary order naming 3–5 outcome KPIs for ${domain.sector.toLowerCase()} and a single accountable Mission Director.`,
        `Map every process step, portal and approval that ${domain.frontline} touch; quantify time spent on each.`,
        `Run a third-party baseline of ${domain.outcome} in 2 pilot districts.`,
        "Stand up a 3–4 person state PMU to own the 90-day plan and weekly reporting.",
      ],
      owner: `Principal Secretary, ${domain.department}`,
      deliverable: "Process & data-burden map, KPI notification and pilot baseline",
    },
    {
      window: "Days 31–60",
      theme: "Re-engineer & Pilot",
      objective: `Remove the primary ${primary.toLowerCase()} constraint in pilot districts.`,
      actions: [
        "Eliminate or merge the 3 highest-burden duplicate formats or approval layers identified in the map.",
        "Launch a single pilot dashboard on the KPIs with district- and block-level drill-downs.",
        `Delegate routine decisions to district level with clear SOPs and timelines for ${domain.frontline}.`,
        "Begin weekly Collector-chaired 45-minute reviews using only the KPI dashboard.",
      ],
      owner: "District Collectors (pilot districts) with state PMU",
      deliverable: "Re-engineered process live in pilot districts; KPI dashboard operational",
    },
    {
      window: "Days 61–90",
      theme: "Institutionalise & Scale",
      objective: "Codify what worked and secure budget for statewide rollout.",
      actions: [
        "Publish a monthly district league table on the KPIs and recognise top improvers.",
        "Commission 5% random third-party verification of reported data.",
        "Codify SOPs, delegation and review cadence in a government order.",
        "Approve a costed statewide rollout plan in the next budget cycle.",
      ],
      owner: "Chief Secretary's office + Finance Department",
      deliverable: "Statewide rollout plan with government order, verification protocol and budget",
    },
  ];

  const benchmarks: Benchmark[] = [
    domain.outcomeMetric,
    profile.burdenMetric,
    { metric: "Operational hours liberated for field supervision", baseline: "Time-use sample in Days 1–30", target: "−30% reporting time, redeployed to field", timeframe: "90 days", measurementMethod: "Repeat time-use survey" },
    { metric: "Variance between reported and verified data", baseline: "First verification round", target: "Below 10%", timeframe: "6 months", measurementMethod: "5% random third-party verification" },
    { metric: "Districts running KPI-based monthly reviews", baseline: "Audit of review minutes", target: "100% pilot; 75% statewide", timeframe: "90 days / 6 months", measurementMethod: "Review minutes audited by PMU" },
  ];

  return {
    episode: {
      title: input.title,
      guest: input.guest,
      guestRole: input.guestRole,
      sector: domain.sector,
      url: input.url,
      videoId: input.videoId,
    },
    executiveSummary: `The discussion points to a ${domain.sector.toLowerCase()} system where ${profile.mode.charAt(0).toLowerCase()}${profile.mode.slice(1)}. The binding constraint is not policy intent but the operating system that turns intent into ${domain.outcome}. A 90-day programme that baselines the problem honestly, removes the primary ${primary.toLowerCase()} constraint in pilot districts, and institutionalises an outcome-focused review rhythm can create a statewide template.`,
    bottleneck: {
      headline: `${domain.sector}: ${domain.outcome} constrained by ${primary.toLowerCase()}`,
      groundReality: `On the ground, ${domain.frontline} operate within processes and reporting systems that were designed for upward compliance rather than local problem-solving. ${profile.description}`,
      evidence: evidence.length ? evidence : ["Ground-level evidence to be validated through the Days 1–30 baseline."],
      stakeholdersAffected: domain.stakeholders,
    },
    failureMode: {
      primaryMode: profile.mode,
      category: primary,
      secondaryCategories: rest.slice(0, 2),
      description: profile.description,
      rootCauses: profile.rootCauses,
      severity: "High",
    },
    interventionPlan: phases,
    benchmarks,
    risks: [
      { risk: "Departmental resistance to process change", mitigation: "Chief Secretary-level mandate with fixed timelines and a visible PMU." },
      { risk: "Metrics gamed once reviewed", mitigation: "Third-party sample verification and published variance." },
      { risk: "Momentum lost after officer transfers", mitigation: "Codify the operating rhythm in a government order." },
    ],
  };
}
