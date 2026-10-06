import { Landmark } from "lucide-react";

export default function CandidateFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200">
      <div className="flex flex-col items-center gap-4 pb-4 pt-8 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-navy-100 bg-navy-50 px-4 py-2 text-xs font-medium text-navy-800 sm:text-sm">
          <Landmark className="h-4 w-4 text-gold-600" />
          <span>Engineered by Kanak Agarwal</span>
          <span className="text-navy-300">|</span>
          <span>Ex-Morgan Stanley Operations</span>
          <span className="text-navy-300">|</span>
          <span>Built for Samagra Transformation Programs</span>
        </div>
        <blockquote className="max-w-2xl font-serif text-lg italic text-navy-700">
          &lsquo;Rashtra Nirman ke is yagya mein, hamari bhi ek aahuti honi chahiye.&rsquo;
        </blockquote>
        <p className="max-w-2xl text-xs leading-relaxed text-slate-500">
          Independent proof-of-work. Not affiliated with or endorsed by Samagra or the Sushasan podcast. Episode content
          belongs to its creators; offline briefs are paraphrased syntheses, not verbatim transcripts.
        </p>
      </div>
    </footer>
  );
}
