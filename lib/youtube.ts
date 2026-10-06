/**
 * Best-effort YouTube transcript extraction with no third-party dependencies.
 * Every network call is time-boxed and every failure returns null — callers fall
 * back to curated briefs, so this module must never throw.
 */

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function extractVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (VIDEO_ID_RE.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\.|^music\./, "");
  let candidate: string | null = null;

  if (host === "youtu.be") {
    candidate = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    candidate = url.searchParams.get("v");
    if (!candidate) {
      const m = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
      candidate = m?.[1] ?? null;
    }
  }

  return candidate && VIDEO_ID_RE.test(candidate) ? candidate : null;
}

async function fetchWithTimeout(input: string, init: RequestInit = {}, ms = 6000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

export interface OEmbedInfo {
  title: string;
  author: string;
}

export async function fetchOEmbed(videoId: string): Promise<OEmbedInfo | null> {
  try {
    const res = await fetchWithTimeout(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`,
      {},
      4000,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; author_name?: string };
    if (!data.title) return null;
    return { title: data.title, author: data.author_name ?? "" };
  } catch {
    return null;
  }
}

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

const ANDROID_CLIENT = { clientName: "ANDROID", clientVersion: "20.10.38", androidSdkVersion: 34 };

async function tracksViaInnertube(videoId: string): Promise<CaptionTrack[] | null> {
  const res = await fetchWithTimeout("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": `com.google.android.youtube/${ANDROID_CLIENT.clientVersion} (Linux; U; Android 14) gzip`,
    },
    body: JSON.stringify({ context: { client: { ...ANDROID_CLIENT, hl: "en", gl: "IN" } }, videoId }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } };
  };
  return data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? null;
}

async function tracksViaWatchPage(videoId: string): Promise<CaptionTrack[] | null> {
  const res = await fetchWithTimeout(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const marker = '"captionTracks":';
  const start = html.indexOf(marker);
  if (start === -1) return null;

  // Walk brackets to slice the JSON array safely.
  let i = start + marker.length;
  let depth = 0;
  let inString = false;
  for (let j = i; j < html.length; j++) {
    const ch = html[j];
    if (inString) {
      if (ch === "\\") j++;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(i, j + 1)) as CaptionTrack[];
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function pickTrack(tracks: CaptionTrack[]): CaptionTrack | undefined {
  const isEn = (t: CaptionTrack) => t.languageCode?.toLowerCase().startsWith("en");
  const isHi = (t: CaptionTrack) => t.languageCode?.toLowerCase().startsWith("hi");
  return (
    tracks.find((t) => isEn(t) && t.kind !== "asr") ??
    tracks.find(isEn) ??
    tracks.find((t) => isHi(t) && t.kind !== "asr") ??
    tracks.find(isHi) ??
    tracks[0]
  );
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** Parses both legacy `<text>` timedtext XML and srv3 `<p><s>` formats. */
export function parseCaptionXml(xml: string): string {
  const blocks = xml.match(/<text\b[^>]*>[\s\S]*?<\/text>/g) ?? xml.match(/<p\b[^>]*>[\s\S]*?<\/p>/g) ?? [];
  return blocks
    .map((b) => decodeEntities(decodeEntities(b.replace(/<[^>]+>/g, ""))))
    .map((t) => t.replace(/\s+/g, " ").trim())
    .filter((t) => t && !/^\[(music|applause|laughter)\]$/i.test(t))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface TranscriptResult {
  text: string;
  language: string;
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResult | null> {
  try {
    let tracks: CaptionTrack[] | null = null;
    try {
      tracks = await tracksViaInnertube(videoId);
    } catch {
      tracks = null;
    }
    if (!tracks?.length) {
      try {
        tracks = await tracksViaWatchPage(videoId);
      } catch {
        tracks = null;
      }
    }
    if (!tracks?.length) return null;

    const track = pickTrack(tracks);
    if (!track?.baseUrl) return null;

    const url = new URL(track.baseUrl.replace(/\\u0026/g, "&"));
    url.searchParams.delete("fmt");
    const res = await fetchWithTimeout(url.toString(), {}, 6000);
    if (!res.ok) return null;

    const text = parseCaptionXml(await res.text());
    if (text.split(/\s+/).length < 80) return null;
    return { text, language: track.languageCode };
  } catch {
    return null;
  }
}

/** Keeps long transcripts within the LLM budget by sampling head, middle and tail. */
export function fitTranscript(text: string, maxChars = 45000): string {
  if (text.length <= maxChars) return text;
  const head = Math.floor(maxChars * 0.45);
  const mid = Math.floor(maxChars * 0.3);
  const tail = maxChars - head - mid;
  const midStart = Math.floor(text.length / 2 - mid / 2);
  return [
    text.slice(0, head),
    "[… transcript condensed …]",
    text.slice(midStart, midStart + mid),
    "[… transcript condensed …]",
    text.slice(text.length - tail),
  ].join("\n");
}
