"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  CircleCheck,
  CirclePlay,
  ClipboardPaste,
  ExternalLink,
  FileText,
  Link2,
  LoaderCircle,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { FEATURED_EPISODES, findEpisodeByVideoId, thumbnailUrl } from "@/lib/episodes";
import type { DiagnoseError, DiagnoseResponse } from "@/lib/types";
import { extractVideoId } from "@/lib/youtube";
import DiagnosticReport from "./DiagnosticReport";

type Mode = "featured" | "custom";

const PIPELINE = [
  "Retrieving episode transcript",
  "Mapping ground realities",
  "Diagnosing systemic failure mode",
  "Drafting 90-day intervention roadmap",
  "Setting statewide benchmarks",
];

export default function DiagnosticEngine({ liveMode }: { liveMode: boolean }) {
  const [mode, setMode] = useState<Mode>("featured");
  const [episodeId, setEpisodeId] = useState(FEATURED_EPISODES[0].id);
  const [url, setUrl] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const episode = FEATURED_EPISODES.find((e) => e.id === episodeId) ?? FEATURED_EPISODES[0];
  const customVideoId = useMemo(() => extractVideoId(url), [url]);
  const customMatch = findEpisodeByVideoId(customVideoId);
  const pasteReady = transcript.trim().length >= 200;

  const canRun =
    !loading && (mode === "featured" || Boolean(customVideoId) || (showPaste && pasteReady));

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, PIPELINE.length - 1)), liveMode ? 2200 : 450);
    return () => clearInterval(t);
  }, [loading, liveMode]);

  async function run() {
    if (!canRun) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const body =
      mode === "featured"
        ? { episodeId }
        : { url: url.trim() || undefined, transcript: showPaste && transcript.trim() ? transcript : undefined };

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as DiagnoseResponse | DiagnoseError;
      if (!data.ok) throw new Error(data.error);
      setResult(data);
      // Only bring the report into view when it is off-screen, so we never fight an in-progress trackpad scroll.
      requestAnimationFrame(() => {
        const top = resultRef.current?.getBoundingClientRect().top;
        if (top !== undefined && (top < 0 || top > window.innerHeight * 0.6)) {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto -mt-4 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
      {/* ── Input panel ───────────────────────────────── */}
      {/* Desktop: sticky, viewport-bounded and independently scrollable (see .sidebar-scroll). Mobile: normal flow. */}
      <aside className="sidebar-scroll no-print lg:sticky lg:top-6 lg:self-start lg:overflow-y-auto lg:overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <div className="card relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-navy-700 via-gold-500 to-navy-700" />
          <h2 className="font-serif text-xl font-semibold text-navy-900">Select an episode</h2>
          <p className="mt-1 text-sm text-slate-500">Pick a featured conversation or bring any link from the channel.</p>

          <div role="tablist" className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-medium">
            {(
              [
                ["featured", "Featured episodes"],
                ["custom", "Custom link"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={mode === key}
                onClick={() => setMode(key)}
                className={`rounded-lg px-3 py-2 transition ${
                  mode === key ? "bg-white text-navy-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-navy-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "featured" ? (
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  @SushasanThePodcast
                </span>
                <div className="relative mt-1.5">
                  <select
                    value={episodeId}
                    onChange={(e) => setEpisodeId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-sm font-medium text-navy-900 shadow-sm outline-none transition focus:border-navy-500 focus:ring-4 focus:ring-navy-100"
                  >
                    {FEATURED_EPISODES.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.guest.replace(/,.*$/, "")} — {e.sector}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </label>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <a href={episode.url} target="_blank" rel="noreferrer" className="group relative block aspect-video bg-navy-900">
                  <img
                    key={episode.videoId}
                    src={thumbnailUrl(episode.videoId)}
                    alt={`Thumbnail: ${episode.title}`}
                    className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-navy-950/20 transition group-hover:bg-navy-950/10">
                    <CirclePlay className="h-12 w-12 text-white drop-shadow-lg" strokeWidth={1.5} />
                  </span>
                </a>
                <div className="space-y-2 p-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gold-600">{episode.season}</div>
                  <div className="text-sm font-semibold text-navy-900">{episode.guest}</div>
                  <div className="text-xs leading-relaxed text-slate-500">{episode.guestRole}</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {episode.topics.map((t) => (
                      <span key={t} className="rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-medium text-navy-700">
                        {t}
                      </span>
                    ))}
                  </div>
                  <a
                    href={episode.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-navy-600 hover:text-navy-900"
                  >
                    Watch on YouTube <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">YouTube URL</span>
                <div className="relative mt-1.5">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    inputMode="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && run()}
                    placeholder="https://www.youtube.com/watch?v=…"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-navy-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-navy-500 focus:ring-4 focus:ring-navy-100"
                  />
                </div>
                <span className="mt-1.5 block min-h-[1.25rem] text-xs">
                  {url && customVideoId ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CircleCheck className="h-3.5 w-3.5" />
                      {customMatch ? `Matched featured episode: ${customMatch.guest}` : `Video ID ${customVideoId}`}
                    </span>
                  ) : url ? (
                    <span className="text-rose-600">That doesn&apos;t look like a YouTube link yet.</span>
                  ) : (
                    <span className="text-slate-400">youtube.com/watch, youtu.be, /shorts and /live links supported.</span>
                  )}
                </span>
              </label>

              {customVideoId && (
                <img
                  key={customVideoId}
                  src={thumbnailUrl(customVideoId)}
                  alt="Video thumbnail"
                  className="aspect-video w-full rounded-xl border border-slate-200 bg-navy-900 object-cover"
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                />
              )}

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60">
                <button
                  type="button"
                  onClick={() => setShowPaste((v) => !v)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-navy-800"
                >
                  <span className="inline-flex items-center gap-2">
                    <ClipboardPaste className="h-4 w-4 text-slate-500" />
                    Paste transcript or notes <span className="font-normal text-slate-400">(optional)</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition ${showPaste ? "rotate-180" : ""}`} />
                </button>
                {showPaste && (
                  <div className="px-3 pb-3">
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      rows={7}
                      placeholder="Paste the episode transcript or your notes. Overrides auto-captions for the highest-fidelity diagnostic."
                      className="w-full resize-y rounded-lg border border-slate-300 bg-white p-2.5 text-xs leading-relaxed text-navy-900 outline-none focus:border-navy-500 focus:ring-4 focus:ring-navy-100"
                    />
                    <div className="mt-1 text-right text-[11px] text-slate-400">
                      {transcript.trim().split(/\s+/).filter(Boolean).length.toLocaleString("en-IN")} words
                      {transcript && !pasteReady && " · min 200 characters"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={run}
            disabled={!canRun}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800 focus:outline-none focus:ring-4 focus:ring-navy-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-gold-300" />}
            {loading ? "Running diagnostic…" : "Run Governance Diagnostic"}
          </button>
          <p className="mt-2.5 text-center text-[11px] leading-relaxed text-slate-400">
            {liveMode
              ? "Live LLM synthesis · falls back to curated briefs if captions are unavailable"
              : "Offline Playbook mode · add OPENAI_API_KEY for live synthesis"}
          </p>
        </div>
      </aside>

      {/* ── Output ────────────────────────────────────── */}
      <section ref={resultRef} className="min-w-0 scroll-mt-6">
        {loading ? (
          <LoadingPipeline step={step} />
        ) : error ? (
          <div className="card flex items-start gap-3 border-rose-200 p-5">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <div className="font-semibold text-rose-900">Diagnostic could not run</div>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
              <button onClick={run} className="mt-3 text-sm font-medium text-navy-700 underline underline-offset-4">
                Try again
              </button>
            </div>
          </div>
        ) : result ? (
          <DiagnosticReport diagnostic={result.diagnostic} meta={result.meta} />
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  );
}

function LoadingPipeline({ step }: { step: number }) {
  return (
    <div className="card p-6 sm:p-8" aria-live="polite">
      <div className="flex items-center gap-3">
        <LoaderCircle className="h-5 w-5 animate-spin text-navy-600" />
        <h3 className="font-serif text-xl font-semibold text-navy-900">Synthesising governance diagnostic</h3>
      </div>
      <ol className="mt-6 space-y-3">
        {PIPELINE.map((label, i) => (
          <li key={label} className="flex items-center gap-3 text-sm">
            {i < step ? (
              <CircleCheck className="h-5 w-5 text-emerald-600" />
            ) : i === step ? (
              <LoaderCircle className="h-5 w-5 animate-spin text-gold-500" />
            ) : (
              <span className="mx-1 h-3 w-3 rounded-full border-2 border-slate-300" />
            )}
            <span className={i <= step ? "font-medium text-navy-900" : "text-slate-400"}>{label}</span>
          </li>
        ))}
      </ol>
      <div className="mt-8 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  const parts = [
    ["01", "Core Administrative Bottleneck & Ground Reality", "What is actually breaking on the ground, with evidence from the conversation."],
    ["02", "Systemic Bureaucratic Failure Mode", "Data silos, compliance burden, last-mile friction — and why they persist."],
    ["03", "Actionable Intervention Plan", "A 3-tier roadmap: Days 1–30, 31–60, 61–90, with owners and deliverables."],
    ["04", "Measurable Statewide Benchmarks", "Leakage reduced, operational hours liberated, outcomes moved."],
  ];
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-600">
        <FileText className="h-4 w-4" /> Samagra 4-part consulting deliverable
      </div>
      <h3 className="mt-2 font-serif text-2xl font-semibold text-navy-900">From podcast conversation to state-scale roadmap</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
        Select an episode and run the diagnostic. The engine extracts the transcript (or uses a curated brief when captions
        are unavailable) and produces an executive-ready memo you can download as Markdown.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {parts.map(([n, title, desc]) => (
          <div key={n} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="font-serif text-2xl font-semibold text-gold-500">{n}</div>
            <div className="mt-1 text-sm font-semibold text-navy-900">{title}</div>
            <div className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
