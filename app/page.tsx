import CandidateFooter from "@/components/CandidateFooter";
import DiagnosticEngine from "@/components/DiagnosticEngine";
import Header from "@/components/Header";
import { llmConfigured } from "@/lib/llm";

// Static: prerendered at build time and served from Vercel's CDN edge (no
// serverless cold start per visit). OPENAI_API_KEY is read at build time, so
// redeploy after changing it — Vercel requires a redeploy for env changes anyway.

export default function Home() {
  const liveMode = llmConfigured();
  return (
    <div className="app-shell flex min-h-screen flex-col shell:min-h-0">
      <Header liveMode={liveMode} />
      <main className="relative flex-1 shell:min-h-0">
        <DiagnosticEngine liveMode={liveMode} footer={<CandidateFooter />} />
      </main>
    </div>
  );
}
