import Link from "next/link";
import { Play, CheckCircle2, Key, FileText, Download, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const keyTakeaways = [
  "Lean Methodology: Identify the 8 types of waste in a clinical environment to improve efficiency.",
  "Six Sigma Basics: Understand the DMAIC cycle and how it applies to reducing medication errors.",
  "Root Cause Analysis (RCA): Using the \"5 Whys\" and Ishikawa diagrams for patient safety incidents.",
  "PDSA Cycles: The iterative process for rapid testing of small changes in quality improvement projects.",
];

const resources = [
  { label: "Lecture Slides (PDF)", href: "#" },
  { label: "Quality Tools Cheat Sheet", href: "#" },
];

export default function CPHQFreeLecturePage() {
  return (
    <div className="container py-8 md:py-10">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-zinc-500" aria-label="Breadcrumb">
        <Link href="/offers" className="hover:text-zinc-700">
          Free Masterclass
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">Part 1: Healthcare Quality Tools</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl lg:text-4xl">
        Healthcare Quality Tools: Core Methodologies
      </h1>
      <p className="mt-2 max-w-3xl text-zinc-600">
        Master the essential tools required for the CPHQ exam, from Lean Six Sigma basics to root
        cause analysis.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left: Main content */}
        <div className="space-y-6">
          {/* Video player */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900 shadow-lg">
            <div className="relative aspect-video flex items-center justify-center bg-zinc-800">
              <button
                type="button"
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/95 text-gold-foreground shadow-xl transition hover:bg-gold"
                aria-label="Play video"
              >
                <Play className="h-10 w-10 fill-current pl-1" />
              </button>
            </div>
            <div className="flex items-center gap-2 border-t border-zinc-700 bg-zinc-900 px-4 py-2">
              <button type="button" className="text-white/80 hover:text-white" aria-label="Play/Pause">
                <Play className="h-5 w-5" />
              </button>
              <span className="text-sm text-white/80">14:22</span>
              <div className="flex-1 h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                <div className="h-full w-[32%] rounded-full bg-gold" />
              </div>
              <span className="text-sm text-white/80">45:00</span>
              <button type="button" className="text-white/80 hover:text-white" aria-label="Fullscreen">
                <span className="text-xs">⛶</span>
              </button>
            </div>
          </div>

          {/* Video progress & CTA */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Video Progress
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full w-[32%] rounded-full bg-gold" />
              </div>
              <span className="text-sm font-medium text-zinc-700">32% Completed</span>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              Finish this lecture to unlock your certificate and special offer.
            </p>
            <Button
              asChild
              className="mt-4 w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold uppercase tracking-wide py-6 gap-2"
            >
              <Link href="/offers/cphq-offer">
                <Target className="h-5 w-5" />
                Access Exclusive CPHQ Masterclass Offer
              </Link>
            </Button>
          </div>

          {/* About this lesson */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900">About this Lesson</h2>
            <p className="mt-3 text-zinc-600 leading-relaxed">
              In this module, we dive deep into the specific tools that appear most frequently on
              the CPHQ examination. We focus on practical application rather than just theory,
              ensuring you understand not just what the tools are, but when and why to use them in a
              real-world healthcare setting.
            </p>
          </div>
        </div>

        {/* Right: Dark sidebar */}
        <aside className="h-fit rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-lg lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5 text-gold" />
            <h2 className="font-bold uppercase tracking-wide">Key Takeaways</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {keyTakeaways.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/90">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <h2 className="font-bold uppercase tracking-wide text-white">Resources</h2>
            <ul className="mt-3 space-y-2">
              {resources.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm text-white/80 transition hover:text-gold"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{label}</span>
                    <Download className="ml-auto h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex items-center gap-4 border-t border-zinc-700 pt-6">
            <div className="h-14 w-14 shrink-0 rounded-full bg-zinc-600" />
            <div>
              <p className="font-semibold text-white">Dr. Sarah Ahmed, CPHQ</p>
              <p className="text-xs uppercase tracking-wide text-white/60">
                Chief Quality Officer, Yalla CPHQ
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
