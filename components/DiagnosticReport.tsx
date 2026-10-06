"use client";

import { useState } from "react";
import {
  CalendarRange,
  ChartColumn,
  Check,
  Clock,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileDown,
  Flag,
  Info,
  ListChecks,
  Quote,
  Route,
  ShieldAlert,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { ENGINE_LABELS, SOURCE_LABELS, buildMemoMarkdown, memoFilename } from "@/lib/memo";
import type { Diagnostic, DiagnosticMeta, Severity } from "@/lib/types";

const SEVERITY_STYLES: Record<Severity, string> = {
  Critical: "bg-rose-50 text-rose-700 ring-rose-200",
  High: "bg-amber-50 text-amber-800 ring-amber-200",
  Moderate: "bg-slate-100 text-slate-700 ring-slate-200",
};

const PHASE_ACCENTS = ["from-navy-700 to-navy-500", "from-navy-600 to-gold-500", "from-gold-500 to-gold-300"];

export default function DiagnosticReport({ diagnostic: d, meta }: { diagnostic: Diagnostic; meta: DiagnosticMeta }) {
  const [copied, setCopied] = useState(false);

  function download() {
    const blob = new Blob([buildMemoMarkdown(d, meta)], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = memoFilename(d);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildMemoMarkdown(d, meta));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="space-y-5">
      {/* ── Memo header ─────────────────────────────── */}
      <div className="card animate-rise overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
              Executive Memo · {d.episode.sector}
            </div>
            <h2 className="mt-1.5 font-serif text-2xl font-semibold leading-snug text-navy-900">{d.episode.title}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
              <UserRound className="h-4 w-4" />
              <span className="font-medium text-navy-800">{d.episode.guest}</span>
              <span className="hidden text-slate-300 sm:inline">·</span>
              <span>{d.episode.guestRole}</span>
            </div>
          </div>
          <div className="no-print flex shrink-0 gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-navy-800 transition hover:bg-slate-50"
              aria-label="Copy memo as Markdown"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={download}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-navy-900/20 transition hover:bg-navy-800"
            >
              <FileDown className="h-4 w-4 text-gold-300" />
              Download Executive Memo (.md)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-slate-50/70 px-5 py-3 text-xs sm:px-6">
          <MetaPill Icon={Cpu} label={meta.model ? `${ENGINE_LABELS[meta.engine]} · ${meta.model}` : ENGINE_LABELS[meta.engine]} />
          <MetaPill
            Icon={Database}
            label={`${SOURCE_LABELS[meta.transcriptSource]}${meta.captionLanguage ? ` (${meta.captionLanguage})` : ""} · ${meta.transcriptWords.toLocaleString("en-IN")} words`}
          />
          <MetaPill Icon={Clock} label={meta.latencyMs < 1000 ? `${meta.latencyMs} ms` : `${(meta.latencyMs / 1000).toFixed(1)} s`} />
          {d.episode.videoId && (
            <a
              href={d.episode.url}
              target="_blank"
              rel="noreferrer"
              className="no-print inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-navy-700 hover:border-navy-300"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Source episode
            </a>
          )}
        </div>

        {meta.warnings.length > 0 && (
          <div className="flex gap-2 border-t border-amber-100 bg-amber-50/70 px-5 py-3 text-xs text-amber-900 sm:px-6">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <ul className="space-y-0.5">
              {meta.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-l-4 border-gold-500 bg-gradient-to-r from-navy-50/80 to-white px-5 py-5 sm:px-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-500">Executive Summary</div>
          <p className="mt-2 font-serif text-[1.05rem] leading-relaxed text-navy-900">{d.executiveSummary}</p>
        </div>
      </div>

      {/* ── 01 Bottleneck ───────────────────────────── */}
      <Section n="01" title="Core Administrative Bottleneck & Ground Reality" Icon={Target} delay={60}>
        <h3 className="font-serif text-xl font-semibold leading-snug text-navy-900">{d.bottleneck.headline}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{d.bottleneck.groundReality}</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <SubLabel>Ground evidence</SubLabel>
            <ul className="mt-2 space-y-2">
              {d.bottleneck.evidence.map((e, i) => (
                <li key={i} className="flex gap-2.5 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                  <Quote className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SubLabel>
              <Users className="h-3.5 w-3.5" /> Stakeholders affected
            </SubLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.bottleneck.stakeholdersAffected.map((s) => (
                <span key={s} className="rounded-lg border border-navy-100 bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-800">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 02 Failure mode ─────────────────────────── */}
      <Section n="02" title="Systemic Bureaucratic Failure Mode" Icon={ShieldAlert} delay={120}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white">{d.failureMode.category}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${SEVERITY_STYLES[d.failureMode.severity]}`}>
            Severity: {d.failureMode.severity}
          </span>
          {d.failureMode.secondaryCategories.map((c) => (
            <span key={c} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
              + {c}
            </span>
          ))}
        </div>
        <h3 className="mt-4 font-serif text-xl font-semibold leading-snug text-navy-900">{d.failureMode.primaryMode}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{d.failureMode.description}</p>

        <SubLabel className="mt-5">Root causes — why it persists</SubLabel>
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          {d.failureMode.rootCauses.map((rc, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/15 text-xs font-bold text-gold-600">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-navy-900">{rc.cause}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{rc.explanation}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 03 Intervention plan ────────────────────── */}
      <Section n="03" title="Actionable Government Intervention Plan" Icon={Route} delay={180}>
        <div className="grid gap-4 xl:grid-cols-3">
          {d.interventionPlan.map((p, i) => (
            <div key={p.window} className="flex flex-col overflow-hidden rounded-xl border border-slate-200">
              <div className={`h-1.5 bg-gradient-to-r ${PHASE_ACCENTS[i] ?? PHASE_ACCENTS[0]}`} />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-navy-900 px-2 py-1 text-[11px] font-semibold text-white">
                    <CalendarRange className="h-3.5 w-3.5 text-gold-300" />
                    {p.window}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Phase {i + 1}</span>
                </div>
                <h4 className="mt-3 font-serif text-lg font-semibold text-navy-900">{p.theme}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{p.objective}</p>
                <ul className="mt-3 flex-1 space-y-2">
                  {p.actions.map((a, j) => (
                    <li key={j} className="flex gap-2 text-[13px] leading-relaxed text-slate-700">
                      <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-3 text-xs">
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-slate-400">Owner</dt>
                    <dd className="mt-0.5 font-medium text-navy-800">{p.owner}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-400">
                      <Flag className="h-3 w-3" /> Deliverable
                    </dt>
                    <dd className="mt-0.5 text-slate-700">{p.deliverable}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 04 Benchmarks ───────────────────────────── */}
      <Section n="04" title="Measurable Statewide Benchmarks" Icon={ChartColumn} delay={240}>
        <div className="grid gap-3 md:grid-cols-2">
          {d.benchmarks.map((b, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
              <div className="text-sm font-semibold leading-snug text-navy-900">{b.metric}</div>
              <div className="mt-3 font-serif text-2xl font-semibold leading-tight text-gold-600">{b.target}</div>
              <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
                <dt className="text-slate-400">Baseline</dt>
                <dd className="text-slate-700">{b.baseline}</dd>
                <dt className="text-slate-400">Timeframe</dt>
                <dd className="text-slate-700">{b.timeframe}</dd>
                <dt className="text-slate-400">Measured by</dt>
                <dd className="text-slate-700">{b.measurementMethod}</dd>
              </dl>
            </div>
          ))}
        </div>
      </Section>

      {d.risks.length > 0 && (
        <div className="card animate-rise p-5 sm:p-6" style={{ animationDelay: "300ms" }}>
          <SubLabel>Implementation risks & mitigations</SubLabel>
          <div className="mt-3 divide-y divide-slate-100">
            {d.risks.map((r, i) => (
              <div key={i} className="grid gap-1 py-3 text-sm sm:grid-cols-2 sm:gap-6">
                <div className="font-medium text-navy-900">{r.risk}</div>
                <div className="text-slate-600">{r.mitigation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="no-print flex justify-center pt-2">
        <button
          onClick={download}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-navy-50"
        >
          <FileDown className="h-4 w-4 text-gold-600" />
          Download Executive Memo (.md)
        </button>
      </div>
    </article>
  );
}

function Section({
  n,
  title,
  Icon,
  delay,
  children,
}: {
  n: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section className="card animate-rise p-5 sm:p-6" style={{ animationDelay: `${delay}ms` }}>
      <header className="mb-4 flex items-center gap-3">
        <span className="font-serif text-3xl font-semibold leading-none text-gold-500">{n}</span>
        <span className="h-8 w-px bg-slate-200" />
        <Icon className="h-5 w-5 text-navy-500" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-navy-700">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function SubLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 ${className}`}>
      {children}
    </div>
  );
}

function MetaPill({ Icon, label }: { Icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600">
      <Icon className="h-3.5 w-3.5 text-navy-400" />
      {label}
    </span>
  );
}
