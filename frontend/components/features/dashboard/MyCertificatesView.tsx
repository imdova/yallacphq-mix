import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Award,
  BadgeCheck,
  Clock,
  FileText,
  Filter,
  Flame,
  GraduationCap,
  Link2,
  Medal,
  Trophy,
  Users,
} from "lucide-react";

function ProgressRing({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - p / 100);

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg className="h-full w-full" viewBox="0 0 120 120" role="img" aria-label={`${p}%`}>
        <circle cx="60" cy="60" r={r} fill="transparent" stroke="rgba(255,255,255,0.14)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="transparent"
          stroke="rgb(215 175 62)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-semibold tracking-tight text-white">{p}%</div>
        {label ? (
          <div className="text-[10px] font-semibold tracking-[0.2em] text-white/60">
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MilestoneCard({
  icon: Icon,
  label,
  active,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-zinc-50 p-4 text-center shadow-sm transition",
        disabled ? "border-zinc-200 opacity-55" : "border-zinc-200",
        active && "bg-gold/10 border-gold/30"
      )}
    >
      <div className={cn("mx-auto flex h-10 w-10 items-center justify-center rounded-2xl", active ? "bg-gold/15 text-gold" : "bg-white text-zinc-700")}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className={cn("mt-3 text-xs font-semibold tracking-wide", active ? "text-zinc-900" : "text-zinc-700")}>
        {label}
      </p>
    </div>
  );
}

type CertificateItem = {
  title: string;
  earnedOn: string;
};

const CERTIFICATES: CertificateItem[] = [
  { title: "Quality Improvement Masterclass", earnedOn: "Oct 12, 2023" },
  { title: "Patient Safety Fundamentals", earnedOn: "Sep 05, 2023" },
  { title: "Health Data Analytics Basics", earnedOn: "Aug 20, 2023" },
];

export function MyCertificatesView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Academic Portfolio</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.25)] ring-1 ring-white/10">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing percent={85} label="READY" />
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Certification Readiness
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                You're just{" "}
                <span className="font-semibold text-white">15%</span> away from being exam-ready!
                Complete the{" "}
                <span className="font-semibold text-white">Patient Safety</span>{" "}
                module to reach 100% confidence.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                    <Clock className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">128h</p>
                    <p className="text-xs text-white/60">Learning Time</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                    <Award className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">4</p>
                    <p className="text-xs text-white/60">Certifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" aria-hidden />
            <h3 className="text-sm font-semibold text-zinc-900">Academic Milestones</h3>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MilestoneCard icon={Flame} label="7-Day Streak" active />
            <MilestoneCard icon={BadgeCheck} label="90% Quiz Avg" active />
            <MilestoneCard icon={Medal} label="Exam Master" disabled />
            <MilestoneCard icon={Users} label="Contributor" active />
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Earned Certificates</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-center rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 sm:w-auto"
        >
          <Filter className="h-4 w-4" aria-hidden />
          Filter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CERTIFICATES.map((c) => (
          <div
            key={c.title}
            className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="rounded-2xl bg-gradient-to-b from-gold/15 to-transparent p-3">
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gold/20">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                    <Award className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-zinc-400">
                    OFFICIAL CERTIFICATION
                  </p>
                  <p className="text-sm font-bold uppercase tracking-tight text-zinc-900">
                    {c.title}
                  </p>
                  <p className="text-xs text-zinc-500">Awarded to you</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-zinc-900">{c.title}</h3>
              <p className="mt-1 text-xs text-zinc-500">Earned on {c.earnedOn}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                <FileText className="h-4 w-4" aria-hidden />
                PDF
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 rounded-xl bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90"
              >
                <Link2 className="h-4 w-4" aria-hidden />
                LinkedIn
              </Button>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-900">
                Upcoming: CPHQ Elite Certification
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Master the final modules and complete the capstone exam to unlock your ultimate credential.
              </p>
            </div>
          </div>

          <Button className="w-full rounded-2xl bg-gold px-6 py-6 text-sm font-semibold text-gold-foreground hover:bg-gold/90 sm:w-auto">
            Continue Learning
          </Button>
        </div>
      </section>
    </div>
  );
}

