import CandidateFooter from "@/components/CandidateFooter";
import DiagnosticEngine from "@/components/DiagnosticEngine";
import Header from "@/components/Header";
import { llmConfigured } from "@/lib/llm";

export const dynamic = "force-dynamic";

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
