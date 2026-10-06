import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";

export const DEFAULT_MODEL = "gpt-4o-mini";

export function llmConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function llmModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
}

export interface LlmArgs {
  title: string;
  guest: string;
  guestRole: string;
  sector: string;
  sourceLabel: string;
  transcript: string;
}

/** Calls OpenAI Chat Completions in JSON mode. Throws on any failure; caller falls back. */
export async function generateDiagnosticJson(args: LlmArgs, timeoutMs = 50000): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/+$/, "");
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: llmModel(),
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(args) },
        ],
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 200);
      throw new Error(`LLM request failed (${res.status}) ${detail}`);
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("LLM returned an empty response");
    return JSON.parse(content);
  } finally {
    clearTimeout(timer);
  }
}
