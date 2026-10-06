import {
  FAILURE_CATEGORIES,
  type Benchmark,
  type Diagnostic,
  type FailureCategory,
  type InterventionPhase,
  type Risk,
  type RootCause,
  type Severity,
} from "./types";

/**
 * Coerces untrusted LLM JSON into a valid Diagnostic. Anything missing or
 * malformed is back-filled from `fallback`, so the UI always gets every field.
 */

type Loose = Record<string, unknown>;

const isObj = (v: unknown): v is Loose => typeof v === "object" && v !== null && !Array.isArray(v);

function str(v: unknown, fb: string, max = 1200): string {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fb;
}

function strList(v: unknown, fb: string[], min = 1, max = 6): string[] {
  if (!Array.isArray(v)) return fb;
  const out = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim().slice(0, 400));
  return out.length >= min ? out.slice(0, max) : fb;
}

function matchCategory(v: unknown): FailureCategory | undefined {
  if (typeof v !== "string") return undefined;
  return FAILURE_CATEGORIES.find((c) => c.toLowerCase() === v.trim().toLowerCase());
}

function severity(v: unknown, fb: Severity): Severity {
  return v === "Critical" || v === "High" || v === "Moderate" ? v : fb;
}

const WINDOWS = ["Days 1–30", "Days 31–60", "Days 61–90"];

export function normalizeDiagnostic(raw: unknown, fallback: Diagnostic): Diagnostic {
  const r = isObj(raw) ? raw : {};
  const ep = isObj(r.episode) ? r.episode : {};
  const bn = isObj(r.bottleneck) ? r.bottleneck : {};
  const fm = isObj(r.failureMode) ? r.failureMode : {};

  const rootCauses: RootCause[] = Array.isArray(fm.rootCauses)
    ? fm.rootCauses
        .filter(isObj)
        .map((rc) => ({ cause: str(rc.cause, ""), explanation: str(rc.explanation, "") }))
        .filter((rc) => rc.cause)
        .slice(0, 4)
    : [];

  const primaryCategory = matchCategory(fm.category) ?? fallback.failureMode.category;
  const secondary = Array.isArray(fm.secondaryCategories)
    ? fm.secondaryCategories
        .map(matchCategory)
        .filter((c): c is FailureCategory => c !== undefined && c !== primaryCategory)
    : fallback.failureMode.secondaryCategories.filter((c) => c !== primaryCategory);

  const phasesRaw = Array.isArray(r.interventionPlan) ? r.interventionPlan.filter(isObj) : [];
  const interventionPlan: InterventionPhase[] = WINDOWS.map((window, i) => {
    const p = phasesRaw[i] ?? {};
    const fb = fallback.interventionPlan[i];
    return {
      window,
      theme: str(p.theme, fb.theme, 80),
      objective: str(p.objective, fb.objective, 400),
      actions: strList(p.actions, fb.actions, 2, 6),
      owner: str(p.owner, fb.owner, 200),
      deliverable: str(p.deliverable, fb.deliverable, 300),
    };
  });

  const benchmarks: Benchmark[] = Array.isArray(r.benchmarks)
    ? r.benchmarks
        .filter(isObj)
        .map((b) => ({
          metric: str(b.metric, "", 200),
          baseline: str(b.baseline, "Establish in Days 1–30", 200),
          target: str(b.target, "", 200),
          timeframe: str(b.timeframe, "90 days", 80),
          measurementMethod: str(b.measurementMethod, "To be defined by state PMU", 240),
        }))
        .filter((b) => b.metric && b.target)
        .slice(0, 6)
    : [];

  const risks: Risk[] = Array.isArray(r.risks)
    ? r.risks
        .filter(isObj)
        .map((k) => ({ risk: str(k.risk, "", 240), mitigation: str(k.mitigation, "", 300) }))
        .filter((k) => k.risk && k.mitigation)
        .slice(0, 4)
    : [];

  return {
    episode: {
      title: str(ep.title, fallback.episode.title, 200),
      guest: str(ep.guest, fallback.episode.guest, 120),
      guestRole: str(ep.guestRole, fallback.episode.guestRole, 200),
      sector: str(ep.sector, fallback.episode.sector, 80),
      url: fallback.episode.url,
      videoId: fallback.episode.videoId,
    },
    executiveSummary: str(r.executiveSummary, fallback.executiveSummary, 1400),
    bottleneck: {
      headline: str(bn.headline, fallback.bottleneck.headline, 200),
      groundReality: str(bn.groundReality, fallback.bottleneck.groundReality, 1400),
      evidence: strList(bn.evidence, fallback.bottleneck.evidence, 1, 6),
      stakeholdersAffected: strList(bn.stakeholdersAffected, fallback.bottleneck.stakeholdersAffected, 1, 6),
    },
    failureMode: {
      primaryMode: str(fm.primaryMode, fallback.failureMode.primaryMode, 200),
      category: primaryCategory,
      secondaryCategories: [...new Set(secondary)].slice(0, 2),
      description: str(fm.description, fallback.failureMode.description, 1200),
      rootCauses: rootCauses.length >= 2 ? rootCauses : fallback.failureMode.rootCauses,
      severity: severity(fm.severity, fallback.failureMode.severity),
    },
    interventionPlan,
    benchmarks: benchmarks.length >= 3 ? benchmarks : fallback.benchmarks,
    risks: risks.length ? risks : fallback.risks,
  };
}
