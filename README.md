# 🏛️ Sushasan Governance Diagnostic Engine

> Synthesizing ground-level administrative insights from [@SushasanThePodcast](https://www.youtube.com/@SushasanThePodcast) into actionable state-scale roadmaps.

Pick a featured Sushasan episode (or paste any YouTube link from the channel) and the engine turns the conversation into Samagra's **4-part consulting deliverable**:

| # | Section | What you get |
|---|---|---|
| 01 | **Core Administrative Bottleneck & Ground Reality** | Headline bottleneck, how it plays out on the ground, evidence, stakeholders affected |
| 02 | **Systemic Bureaucratic Failure Mode** | Category (data silos, compliance burden, last-mile friction…), severity, 3 root causes |
| 03 | **Actionable Government Intervention Plan** | 3-tier roadmap — Days 1–30, 31–60, 61–90 — with actions, owners and deliverables |
| 04 | **Measurable Statewide Benchmarks** | Metric, baseline, target, timeframe and how it is measured |

Every diagnostic downloads as an **Executive Memo (.md)**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKanakAgarwal1234%2Fsushasan-governance-engine&env=OPENAI_API_KEY&envDescription=OpenAI%20key%20for%20live%20LLM%20synthesis%20(the%20app%20still%20works%20offline%20without%20it)&project-name=sushasan-governance-engine&repository-name=sushasan-governance-engine)

---

## Never breaks during a demo

The pipeline degrades gracefully at every step:

```
Transcript:  pasted transcript ─► live YouTube captions ─► curated episode brief ─► Sushasan composite brief
Synthesis:   live LLM (OpenAI, JSON mode) ─► Samagra Playbook (curated, offline) ─► rule-based engine (offline)
```

- **No `OPENAI_API_KEY`?** Featured episodes are served from hand-authored "Samagra Playbook" diagnostics; custom links use a deterministic rule-based engine.
- **Captions disabled or YouTube blocking the server region?** Featured episodes fall back to curated briefs; custom links fall back to the video title + a Sushasan composite brief — or paste a transcript.
- **LLM down, slow or malformed JSON?** Output is validated and back-filled field-by-field, or swapped for the offline diagnostic.
- Each response says which engine and input were used, so nothing is passed off as something it isn't.

> Curated briefs are **paraphrased syntheses** of each episode's publicly described themes and the guest's public record — not verbatim transcripts, and they contain no invented quotes.

## Featured episodes

| Guest | Role | Link |
|---|---|---|
| Anita Karwal | Former Secretary, School Education & Literacy, GoI | [youtu.be/zidabJy7ous](https://youtu.be/zidabJy7ous) |
| Rajesh Bhushan | Former Union Health Secretary | [youtu.be/efnoXmLrCLo](https://youtu.be/efnoXmLrCLo) |
| P. Narahari | Secretary MSME, MP; ex-Collector Indore (Sushasan on Campus, Ep. 1) | [youtu.be/YxxNbtiHmD0](https://youtu.be/YxxNbtiHmD0) |
| Ashish Dhawan | Founder & CEO, Central Square Foundation (S1 Ep. 5) | [youtu.be/xTiOH-ixAYs](https://youtu.be/xTiOH-ixAYs) |

Add more in [`lib/episodes.ts`](lib/episodes.ts) (plus an optional brief in `lib/fallback-transcripts.ts` and playbook in `lib/curated-diagnostics.ts`).

## Run locally

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY for live synthesis (optional)
npm run dev                  # http://localhost:3000
```

| Variable | Required | Default |
|---|---|---|
| `OPENAI_API_KEY` | No — enables live LLM synthesis | — |
| `OPENAI_MODEL` | No | `gpt-4o-mini` |
| `OPENAI_BASE_URL` | No — any OpenAI-compatible endpoint | `https://api.openai.com/v1` |

## API

`POST /api/diagnose`

```json
{ "episodeId": "rajesh-bhushan" }
{ "url": "https://www.youtube.com/watch?v=efnoXmLrCLo" }
{ "url": "https://youtu.be/…", "transcript": "optional pasted transcript (200+ chars)" }
```

Quick test: `GET /api/diagnose?episode=p-narahari` or `GET /api/diagnose?url=<youtube-url>`.

Response: `{ ok: true, diagnostic: { episode, executiveSummary, bottleneck, failureMode, interventionPlan[3], benchmarks[], risks[] }, meta: { engine, model, transcriptSource, transcriptWords, warnings, … } }`

Built-in guards: per-IP rate limit on LLM calls (falls back to offline instead of erroring), 6-hour response cache, 60 s function budget.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Lucide icons · TypeScript. No database, no other runtime dependencies.

```
app/api/diagnose/route.ts   orchestration: resolve → transcript → synthesise → validate
lib/youtube.ts              caption extraction (Innertube + watch-page), URL parsing
lib/prompt.ts, lib/llm.ts   governance prompt + OpenAI JSON-mode call
lib/normalize.ts            schema validation & back-fill of LLM output
lib/curated-diagnostics.ts  offline Samagra Playbook diagnostics
lib/heuristic.ts            offline rule-based engine for custom links
lib/memo.ts                 Executive Memo (.md) builder
components/                 dashboard UI
```

---

**Engineered by Kanak Agarwal | Ex-Morgan Stanley Operations | Built for Samagra Transformation Programs**

*"Rashtra Nirman ke is yagya mein, hamari bhi ek aahuti honi chahiye."*

<sub>Independent proof-of-work. Not affiliated with or endorsed by Samagra or the Sushasan podcast. Episode content belongs to its creators.</sub>
