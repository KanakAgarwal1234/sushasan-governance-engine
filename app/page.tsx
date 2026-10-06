import CandidateFooter from "@/components/CandidateFooter";
import DiagnosticEngine from "@/components/DiagnosticEngine";
import Header from "@/components/Header";
import { llmConfigured } from "@/lib/llm";

export const dynamic = "force-dynamic";

export default function Home() {
  const liveMode = llmConfigured();
  return (
    <>
      <Header liveMode={liveMode} />
      <main className="relative">
        <DiagnosticEngine liveMode={liveMode} />
      </main>
      <CandidateFooter />
    </>
  );
}
