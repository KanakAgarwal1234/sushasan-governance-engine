export type Severity = "Critical" | "High" | "Moderate";

export type FailureCategory =
  | "Data Silos"
  | "Compliance Burden"
  | "Last-Mile Friction"
  | "Capacity Deficit"
  | "Accountability Gap"
  | "Coordination Failure"
  | "Incentive Misalignment";

export const FAILURE_CATEGORIES: FailureCategory[] = [
  "Data Silos",
  "Compliance Burden",
  "Last-Mile Friction",
  "Capacity Deficit",
  "Accountability Gap",
  "Coordination Failure",
  "Incentive Misalignment",
];

export interface EpisodeMeta {
  id: string;
  videoId: string;
  url: string;
  title: string;
  guest: string;
  guestRole: string;
  sector: string;
  season: string;
  topics: string[];
}

export interface Bottleneck {
  headline: string;
  groundReality: string;
  evidence: string[];
  stakeholdersAffected: string[];
}

export interface RootCause {
  cause: string;
  explanation: string;
}

export interface FailureMode {
  primaryMode: string;
  category: FailureCategory;
  secondaryCategories: FailureCategory[];
  description: string;
  rootCauses: RootCause[];
  severity: Severity;
}

export interface InterventionPhase {
  window: string;
  theme: string;
  objective: string;
  actions: string[];
  owner: string;
  deliverable: string;
}

export interface Benchmark {
  metric: string;
  baseline: string;
  target: string;
  timeframe: string;
  measurementMethod: string;
}

export interface Risk {
  risk: string;
  mitigation: string;
}

export interface Diagnostic {
  episode: {
    title: string;
    guest: string;
    guestRole: string;
    sector: string;
    url: string;
    videoId: string | null;
  };
  executiveSummary: string;
  bottleneck: Bottleneck;
  failureMode: FailureMode;
  interventionPlan: InterventionPhase[];
  benchmarks: Benchmark[];
  risks: Risk[];
}

export type TranscriptSource =
  | "youtube-captions"
  | "user-pasted"
  | "curated-brief"
  | "composite-brief";

export type EngineMode = "llm" | "curated" | "heuristic";

export interface DiagnosticMeta {
  engine: EngineMode;
  model: string | null;
  transcriptSource: TranscriptSource;
  transcriptWords: number;
  captionLanguage: string | null;
  generatedAt: string;
  latencyMs: number;
  warnings: string[];
}

export interface DiagnoseResponse {
  ok: true;
  diagnostic: Diagnostic;
  meta: DiagnosticMeta;
}

export interface DiagnoseError {
  ok: false;
  error: string;
}
