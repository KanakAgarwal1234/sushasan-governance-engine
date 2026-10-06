import type { Diagnostic, DiagnosticMeta } from "./types";

export const CANDIDATE_LINE =
  "Engineered by Kanak Agarwal | Ex-Morgan Stanley Operations | Built for Samagra Transformation Programs";
export const CANDIDATE_QUOTE = "Rashtra Nirman ke is yagya mein, hamari bhi ek aahuti honi chahiye.";

export const ENGINE_LABELS: Record<DiagnosticMeta["engine"], string> = {
  llm: "Live LLM synthesis",
  curated: "Samagra Playbook (offline)",
  heuristic: "Rule-based engine (offline)",
};

export const SOURCE_LABELS: Record<DiagnosticMeta["transcriptSource"], string> = {
  "youtube-captions": "YouTube captions",
  "user-pasted": "Pasted transcript",
  "curated-brief": "Curated episode brief",
  "composite-brief": "Sushasan composite brief",
};

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n+/g, " ");

export function buildMemoMarkdown(d: Diagnostic, meta: DiagnosticMeta): string {
  const date = new Date(meta.generatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const lines: string[] = [
    "# Executive Memo — Governance Diagnostic",
    "",
    `**Episode:** ${d.episode.title}  `,
    `**Guest:** ${d.episode.guest} — ${d.episode.guestRole}  `,
    `**Sector:** ${d.episode.sector}  `,
    `**Source:** ${d.episode.url}  `,
    `**Date:** ${date}  `,
    `**Engine:** ${ENGINE_LABELS[meta.engine]}${meta.model ? ` · ${meta.model}` : ""}  `,
    `**Input:** ${SOURCE_LABELS[meta.transcriptSource]} (${meta.transcriptWords.toLocaleString("en-IN")} words)`,
    "",
    "---",
    "",
    "## Executive Summary",
    "",
    d.executiveSummary,
    "",
    "## 1. Core Administrative Bottleneck & Ground Reality",
    "",
    `### ${d.bottleneck.headline}`,
    "",
    d.bottleneck.groundReality,
    "",
    "**Ground evidence**",
    "",
    ...d.bottleneck.evidence.map((e) => `- ${e}`),
    "",
    `**Stakeholders affected:** ${d.bottleneck.stakeholdersAffected.join(" · ")}`,
    "",
    "## 2. Systemic Bureaucratic Failure Mode",
    "",
    `**Primary failure mode:** ${d.failureMode.primaryMode}  `,
    `**Category:** ${d.failureMode.category}${
      d.failureMode.secondaryCategories.length ? ` (also: ${d.failureMode.secondaryCategories.join(", ")})` : ""
    }  `,
    `**Severity:** ${d.failureMode.severity}`,
    "",
    d.failureMode.description,
    "",
    "| # | Root cause | Why it persists |",
    "|---|---|---|",
    ...d.failureMode.rootCauses.map((rc, i) => `| ${i + 1} | ${cell(rc.cause)} | ${cell(rc.explanation)} |`),
    "",
    "## 3. Actionable Government Intervention Plan (90 Days)",
    "",
  ];

  for (const phase of d.interventionPlan) {
    lines.push(
      `### ${phase.window} — ${phase.theme}`,
      "",
      `*Objective:* ${phase.objective}`,
      "",
      ...phase.actions.map((a) => `- [ ] ${a}`),
      "",
      `**Owner:** ${phase.owner}  `,
      `**Deliverable:** ${phase.deliverable}`,
      "",
    );
  }

  lines.push(
    "## 4. Measurable Statewide Benchmarks",
    "",
    "| Metric | Baseline | Target | Timeframe | Measurement |",
    "|---|---|---|---|---|",
    ...d.benchmarks.map(
      (b) => `| ${cell(b.metric)} | ${cell(b.baseline)} | **${cell(b.target)}** | ${cell(b.timeframe)} | ${cell(b.measurementMethod)} |`,
    ),
    "",
  );

  if (d.risks.length) {
    lines.push(
      "## Implementation Risks & Mitigations",
      "",
      "| Risk | Mitigation |",
      "|---|---|",
      ...d.risks.map((r) => `| ${cell(r.risk)} | ${cell(r.mitigation)} |`),
      "",
    );
  }

  lines.push(
    "---",
    "",
    "*Method note: synthesised by the Sushasan Governance Diagnostic Engine. Where a baseline is not available in the source material it is marked \"Establish\" and measured in the first 30 days rather than assumed.*",
    "",
    `*${CANDIDATE_LINE}*`,
    "",
    `> "${CANDIDATE_QUOTE}"`,
    "",
  );

  return lines.join("\n");
}

export function memoFilename(d: Diagnostic): string {
  const slug = d.episode.guest
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "episode";
  return `sushasan-diagnostic-${slug}-${new Date().toISOString().slice(0, 10)}.md`;
}
