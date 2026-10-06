import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif-display", display: "swap" });

export const metadata: Metadata = {
  title: "Sushasan Governance Diagnostic Engine",
  description:
    "Synthesizing ground-level administrative insights from @SushasanThePodcast into actionable state-scale roadmaps.",
  openGraph: {
    title: "Sushasan Governance Diagnostic Engine",
    description:
      "Turn any Sushasan episode into a 4-part Samagra-style governance diagnostic: bottleneck, failure mode, 90-day roadmap and statewide benchmarks.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1b33",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
