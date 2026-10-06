import CandidateFooter from "@/components/CandidateFooter";
import DiagnosticEngine from "@/components/DiagnosticEngine";
import Header from "@/components/Header";
import { llmConfigured } from "@/lib/llm";

export const dynamic = "force-dynamic";

export default function Home() {
  const liveMode = llmConfigured();
  return (
    <div className="flex min-h-screen flex-col">
      <Header liveMode={liveMode} />
      <main className="relative flex-1">
        <DiagnosticEngine liveMode={liveMode} />
      </main>
      <CandidateFooter />
    </div>
  );
}
