import { NextResponse, type NextRequest } from "next/server";
import { getCuratedDiagnostic } from "@/lib/curated-diagnostics";
import { findEpisodeById, findEpisodeByVideoId, type FeaturedEpisode } from "@/lib/episodes";
import { COMPOSITE_BRIEF, getFallbackTranscript } from "@/lib/fallback-transcripts";
import { buildHeuristicDiagnostic } from "@/lib/heuristic";
import { generateDiagnosticJson, llmConfigured, llmModel } from "@/lib/llm";
import { SOURCE_LABELS } from "@/lib/memo";
import { normalizeDiagnostic } from "@/lib/normalize";
import type { DiagnoseError, DiagnoseResponse, Diagnostic, DiagnosticMeta, TranscriptSource } from "@/lib/types";
import { extractVideoId, fetchOEmbed, fetchTranscript, fitTranscript } from "@/lib/youtube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PASTED_CHARS = 200_000;
const MIN_PASTED_CHARS = 200;

// Best-effort per-instance guards (serverless instances are short-lived; this
// protects the API key from casual abuse without external infrastructure).
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_LLM_CALLS = 15;
const rateBuckets = new Map<string, number[]>();

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; payload: DiagnoseResponse }>();

function allowLlmCall(ip: string): boolean {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX_LLM_CALLS) {
    rateBuckets.set(ip, hits);
    return false;
  }
  hits.push(now);
  rateBuckets.set(ip, hits);
  return true;
}

function cacheGet(key: string): DiagnoseResponse | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return hit.payload;
}

function cacheSet(key: string, payload: DiagnoseResponse) {
  if (cache.size > 100) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), payload });
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

function fail(status: number, error: string) {
  return NextResponse.json<DiagnoseError>({ ok: false, error }, { status });
}

interface DiagnoseInput {
  episodeId?: string;
  url?: string;
  transcript?: string;
}

async function diagnose(input: DiagnoseInput, ip: string) {
  const started = Date.now();
  const warnings: string[] = [];

  // 1. Resolve the episode.
  const rawUrl = input.url?.trim() || "";
  const pasted = input.transcript?.trim().slice(0, MAX_PASTED_CHARS) || "";
  let videoId: string | null = null;
  let preset: FeaturedEpisode | undefined = findEpisodeById(input.episodeId);

  if (preset) {
    videoId = preset.videoId;
  } else if (rawUrl) {
    videoId = extractVideoId(rawUrl);
    if (!videoId) return fail(400, "Couldn't read a YouTube video ID from that link. Paste a youtube.com or youtu.be URL.");
    preset = findEpisodeByVideoId(videoId);
  } else if (pasted.length < MIN_PASTED_CHARS) {
    return fail(400, "Pick a featured episode, paste a YouTube link, or paste a transcript (200+ characters).");
  }

  const useLlm = llmConfigured();
  const cacheKey = `${preset?.id ?? videoId ?? "pasted"}:${pasted ? hash(pasted) : "-"}:${useLlm ? llmModel() : "offline"}`;
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  // 2. Episode metadata (custom links get their title from oEmbed when reachable).
  let title = preset?.title ?? "Sushasan episode";
  let guest = preset?.guest ?? "Guest (custom link)";
  const guestRole = preset?.guestRole ?? "Sushasan podcast guest";
  const sector = preset?.sector ?? "Public Administration";
  const url = preset?.url ?? (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "Pasted transcript");

  if (!preset && videoId) {
    const oembed = await fetchOEmbed(videoId);
    if (oembed) {
      title = oembed.title;
      const m = oembed.title.match(/^(.+?)\s+in conversation with/i);
      if (m) guest = m[1].trim();
    }
  }

  // 3. Transcript: pasted > live captions > curated brief > composite brief.
  let transcript = "";
  let transcriptSource: TranscriptSource;
  let captionLanguage: string | null = null;

  if (pasted.length >= MIN_PASTED_CHARS) {
    transcript = pasted;
    transcriptSource = "user-pasted";
  } else {
    if (pasted) warnings.push("Pasted text was too short to use (under 200 characters); ignored.");
    // Skip the network round-trip when offline mode will serve a curated diagnostic anyway.
    const live = videoId && (useLlm || !preset) ? await fetchTranscript(videoId) : null;
    if (live) {
      transcript = live.text;
      transcriptSource = "youtube-captions";
      captionLanguage = live.language;
    } else if (preset) {
      transcript = getFallbackTranscript(preset.id) ?? COMPOSITE_BRIEF;
      transcriptSource = "curated-brief";
      if (useLlm) warnings.push("Live captions unavailable from this region — used the curated episode brief.");
    } else {
      transcript = `Video title: ${title}\n\n${COMPOSITE_BRIEF}`;
      transcriptSource = "composite-brief";
      warnings.push(
        "Captions for this video couldn't be retrieved — synthesised from the video title and the Sushasan composite brief. Paste the transcript for a higher-fidelity diagnostic.",
      );
    }
  }

  const fitted = fitTranscript(transcript);
  if (fitted.length < transcript.length) warnings.push("Long transcript condensed (head, middle and tail sampled) to fit the model budget.");

  // 4. Offline baseline: curated playbook for featured episodes, rule-based engine otherwise.
  const heuristicArgs = {
    transcript,
    title,
    guest,
    guestRole,
    url,
    videoId,
    domainHint: transcriptSource === "composite-brief" ? title : undefined,
  };
  const curated = preset ? getCuratedDiagnostic(preset.id) : undefined;
  const baseline: Diagnostic = curated ?? buildHeuristicDiagnostic(heuristicArgs);
  let diagnostic: Diagnostic = baseline;
  let engine: DiagnosticMeta["engine"] = curated ? "curated" : "heuristic";
  let model: string | null = null;

  // 5. Live LLM synthesis, falling back silently to the baseline.
  if (useLlm) {
    if (!allowLlmCall(ip)) {
      warnings.push("Rate limit reached for live synthesis — served the offline diagnostic. Try again in a few minutes.");
    } else {
      try {
        const raw = await generateDiagnosticJson({
          title,
          guest,
          guestRole,
          sector: baseline.episode.sector,
          sourceLabel: SOURCE_LABELS[transcriptSource],
          transcript: fitted,
        });
        diagnostic = normalizeDiagnostic(raw, baseline);
        engine = "llm";
        model = llmModel();
      } catch (err) {
        console.error("[diagnose] LLM synthesis failed:", err);
        warnings.push("Live LLM synthesis was unavailable — served the offline diagnostic instead.");
      }
    }
  }

  // Featured episodes keep their verified metadata regardless of what the model returns.
  if (preset) {
    diagnostic.episode = { ...diagnostic.episode, title: preset.title, guest: preset.guest, guestRole: preset.guestRole, url: preset.url, videoId: preset.videoId };
  }

  const payload: DiagnoseResponse = {
    ok: true,
    diagnostic,
    meta: {
      engine,
      model,
      transcriptSource,
      transcriptWords: wordCount(transcript),
      captionLanguage,
      generatedAt: new Date().toISOString(),
      latencyMs: Date.now() - started,
      warnings,
    },
  };

  if (engine === "llm") cacheSet(cacheKey, payload);
  return NextResponse.json(payload);
}

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export async function POST(req: NextRequest) {
  let body: DiagnoseInput;
  try {
    body = (await req.json()) as DiagnoseInput;
  } catch {
    return fail(400, "Request body must be JSON: { episodeId?, url?, transcript? }");
  }
  try {
    return await diagnose(
      {
        episodeId: typeof body.episodeId === "string" ? body.episodeId : undefined,
        url: typeof body.url === "string" ? body.url : undefined,
        transcript: typeof body.transcript === "string" ? body.transcript : undefined,
      },
      clientIp(req),
    );
  } catch (err) {
    console.error("[diagnose] unexpected error:", err);
    return fail(500, "The diagnostic engine hit an unexpected error. Please try again.");
  }
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  try {
    return await diagnose(
      { episodeId: params.get("episode") ?? undefined, url: params.get("url") ?? undefined },
      clientIp(req),
    );
  } catch (err) {
    console.error("[diagnose] unexpected error:", err);
    return fail(500, "The diagnostic engine hit an unexpected error. Please try again.");
  }
}
