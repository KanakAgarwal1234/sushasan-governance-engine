import { BriefcaseBusiness, ChartColumn, Route, ShieldAlert, Target } from "lucide-react";

const DELIVERABLES = [
  { n: "01", label: "Bottleneck & Ground Reality", Icon: Target },
  { n: "02", label: "Systemic Failure Mode", Icon: ShieldAlert },
  { n: "03", label: "90-Day Intervention Plan", Icon: Route },
  { n: "04", label: "Statewide Benchmarks", Icon: ChartColumn },
];

export default function Header({ liveMode }: { liveMode: boolean }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -right-36 -top-36 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgb(201_154_46/0.13),transparent_65%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8 shell:pb-8 shell:pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-200">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            Samagra Transformation Programs · Proof of Work
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                liveMode
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  : "border-gold-400/30 bg-gold-400/10 text-gold-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${liveMode ? "bg-emerald-400" : "bg-gold-400"}`} />
              {liveMode ? "Live LLM synthesis" : "Offline Playbook mode"}
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-navy-100 md:inline-flex">
              <BriefcaseBusiness className="h-3.5 w-3.5 text-gold-400" />
              Kanak Agarwal · Ex-Morgan Stanley Operations
            </span>
          </div>
        </div>

        <div className="mt-8 max-w-3xl shell:mt-3">
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] shell:text-[2rem]">
            <span aria-hidden>🏛️</span> Sushasan Governance Diagnostic Engine
          </h1>
          <p className="mt-3 text-base leading-relaxed text-navy-100 sm:text-lg shell:mt-1 shell:text-base">
            Synthesizing ground-level administrative insights from{" "}
            <a
              href="https://www.youtube.com/@SushasanThePodcast"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gold-300 underline decoration-gold-400/40 underline-offset-4 hover:decoration-gold-300"
            >
              @SushasanThePodcast
            </a>{" "}
            into actionable state-scale roadmaps.
          </p>
        </div>

        <ol className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 shell:mt-4">
          {DELIVERABLES.map(({ n, label, Icon }) => (
            <li
              key={n}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 shell:py-2"
            >
              <span className="font-serif text-lg font-semibold text-gold-400">{n}</span>
              <Icon className="hidden h-4 w-4 shrink-0 text-navy-200 sm:block" />
              <span className="text-xs font-medium leading-snug text-navy-50 sm:text-sm">{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}
