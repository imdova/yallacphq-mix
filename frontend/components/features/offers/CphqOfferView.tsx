import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Headphones,
  Lock,
  Medal,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PRODUCT } from "@/components/features/checkout/checkoutData";

const HIGHLIGHTS = [
  { icon: BadgeCheck, title: "Exam‑aligned curriculum", desc: "Focused on high‑frequency CPHQ domains and modern QI tools." },
  { icon: BookOpen, title: "1,200+ practice questions", desc: "Train with realistic questions and targeted review sessions." },
  { icon: Headphones, title: "Live Q&A mentorship", desc: "Get clarity fast and avoid common exam traps." },
  { icon: ShieldCheck, title: "1‑year full access", desc: "Learn at your pace with lifetime notes and downloadable materials." },
] as const;

const INCLUDED = [
  "45+ hours of lectures across all CPHQ domains",
  "Exam simulator + practice sets",
  "Study guide + downloadable materials",
  "Mentorship sessions + support",
] as const;

const CURRICULUM_SECTIONS: Array<{
  title: string;
  lecturesLabel: string;
  items: string[];
}> = [
  {
    title: "Introduction to Healthcare Quality",
    lecturesLabel: "2 lectures",
    items: ["Quality foundations & key definitions", "QI tools overview for the CPHQ exam"],
  },
  {
    title: "Patient Safety & Risk Management",
    lecturesLabel: "6 lectures",
    items: ["Event reporting & near‑miss analysis", "RCA (5 Whys, Fishbone) + action planning", "High‑reliability principles"],
  },
  {
    title: "Performance & Process Improvement",
    lecturesLabel: "8 lectures",
    items: ["Lean basics + waste elimination", "Six Sigma DMAIC explained", "PDSA cycles and rapid testing"],
  },
  {
    title: "Leadership, Strategy & Change",
    lecturesLabel: "5 lectures",
    items: ["Governance, KPIs and dashboards", "Stakeholder alignment + change management", "Sustaining improvements"],
  },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Is this suitable if I’m starting from zero?",
    a: "Yes. The program starts with clear foundations, then builds into exam strategy and real‑world application step‑by‑step.",
  },
  {
    q: "How long do I have access?",
    a: "You get 1‑year full platform access so you can study at your own pace and revisit materials anytime.",
  },
  {
    q: "Do I get downloadable materials?",
    a: "Yes. Each lecture includes resources you can download and use offline while studying.",
  },
  {
    q: "How do I claim the discount?",
    a: "Use code CPHQ25 during checkout to apply the limited‑time offer.",
  },
];

export function CphqOfferView() {
  return (
    <div className="bg-zinc-50">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black bg-zinc-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-gold/15 blur-3xl" />

        <div className="container relative py-12 md:py-16">
          <Link
            href="/offers"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            Back to Offers
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-14">
            {/* Left copy */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold/90">
                <Medal className="h-4 w-4 text-gold" aria-hidden />
                Premium Enrollment
              </div>

              <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
                Get the Full <span className="text-gold">CPHQ</span> Preparation Bundle
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/75">
                Unlock 45+ hours of lectures, 1,200+ practice questions, and a complete study guide—built to help you pass
                with confidence on your first attempt.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {INCLUDED.map((t) => (
                  <div key={t} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                    <p className="text-sm text-white/85">{t}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  className="h-12 rounded-xl bg-[#F6D54A] px-6 font-bold uppercase tracking-wider text-zinc-900 hover:bg-[#F6D54A]/90"
                >
                  <Link href="/checkout">Enroll in full program</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Link href="/offers/cphq-free-lecture">
                    <Sparkles className="h-4 w-4" />
                    Watch free lecture
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gold" aria-hidden />
                  Secure checkout
                </span>
                <span className="inline-flex items-center gap-2">
                  <Timer className="h-4 w-4 text-gold" aria-hidden />
                  Limited time: code <span className="font-semibold text-gold">CPHQ25</span> for{" "}
                  <span className="font-semibold text-white">25% OFF</span>
                </span>
              </div>
            </div>

            {/* Right: Offer card */}
            <div className="lg:sticky lg:top-24">
              <Card className="overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
                <CardContent className="relative p-6">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.22),transparent_60%)]" />
                  <div className="relative space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold/90">Bundle</p>
                        <p className="mt-2 text-lg font-bold text-white">{PRODUCT.name}</p>
                        <p className="mt-1 text-sm text-white/70">{PRODUCT.subtitle}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                        25% OFF
                      </span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Starting at</p>
                          <p className="mt-1 text-3xl font-bold text-white">${PRODUCT.price}</p>
                        </div>
                        <div className="text-right text-xs text-white/60">
                          <p className="font-semibold text-white/80">Instant access</p>
                          <p>After payment</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-white/80">
                      {[
                        { icon: CalendarDays, label: "1‑year platform access" },
                        { icon: CreditCard, label: "Multiple payment methods" },
                        { icon: ShieldCheck, label: "Secure payments" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gold" aria-hidden />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      asChild
                      className="h-12 w-full rounded-xl bg-[#F6D54A] font-bold uppercase tracking-wider text-zinc-900 hover:bg-[#F6D54A]/90"
                    >
                      <Link href="/checkout">Enroll now</Link>
                    </Button>

                    <p className="text-center text-xs text-white/60">
                      Limited time: Use code <span className="font-semibold text-gold">CPHQ25</span> for{" "}
                      <span className="font-semibold text-white/80">25% OFF</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">Why this bundle</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
              A smarter way to prepare for CPHQ
            </h2>
            <p className="mt-3 text-zinc-600">
              Structured learning, practical tools, and the right practice—so your study time is efficient and your exam
              strategy is clear.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-zinc-900">{title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum (full course) */}
      <section className="border-t border-zinc-200 bg-white py-12 md:py-16">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">Course curriculum</p>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
                Know exactly what you’ll learn
              </h2>
              <p className="text-zinc-600">
                The curriculum is organized into short modules that map to real CPHQ exam domains and modern healthcare
                quality practice.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-sm font-semibold text-zinc-900">Tip</p>
              <p className="mt-1 text-sm text-zinc-600">
                Start with the free lecture, then upgrade to unlock the full course and question bank.
              </p>
              <Button asChild className="mt-4 h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90 font-semibold">
                <Link href="/offers/cphq-free-lecture">Watch free lecture</Link>
              </Button>
            </div>
          </div>

          <Card className="mt-8 rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Course Curriculum</h3>
                <p className="mt-1 text-sm text-zinc-500">4 Sections - 21 Lectures, 0 Quizzes</p>
              </div>

              <div className="mt-4 space-y-3">
                {CURRICULUM_SECTIONS.map((s, idx) => (
                  <details
                    key={s.title}
                    className="rounded-xl bg-zinc-50 p-4"
                    open={idx === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                      <span className="text-sm font-semibold text-zinc-900">{s.title}</span>
                      <span className="flex items-center gap-2 text-sm text-zinc-500">
                        <span className="font-medium">{s.lecturesLabel}</span>
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      </span>
                    </summary>
                    <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4">
                      {s.items.map((t) => (
                        <div key={t} className="flex items-start justify-between gap-3">
                          <p className="text-sm text-zinc-700">{t}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Instructor + feedback */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">Instructor</p>
                <div className="mt-4 flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                    <img
                      src="/instructors/dr-ahmed-habib.png"
                      alt="Dr. Ahmed Habib"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-zinc-900">Dr. Ahmed Habib</p>
                    <p className="mt-1 text-sm text-zinc-600">15 years Experience in Healthcare Quality Management</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        { icon: CalendarDays, label: "Structured study plan" },
                        { icon: ShieldCheck, label: "Real healthcare examples" },
                        { icon: Timer, label: "Fast review technique" },
                        { icon: Lock, label: "Secure access" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-sm text-zinc-700">
                          <Icon className="h-4 w-4 text-gold" aria-hidden />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">Students Feedback</p>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-zinc-900">What students say</h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Real comments and testimonials from learners who used the bundle to prepare faster and smarter.
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-semibold text-zinc-900">Images</p>
                    <p className="mt-1 text-xs text-zinc-500">A snapshot of real comments and success stories.</p>
                    <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                      <img
                        src="/reviews/reviews-collage.png"
                        alt="Student feedback collage"
                        className="h-auto w-full"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-semibold text-zinc-900">Videos</p>
                    <p className="mt-1 text-xs text-zinc-500">Short testimonials from students.</p>
                    <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                      <div className="relative aspect-[16/9] w-full bg-black">
                        <iframe
                          className="absolute inset-0 h-full w-full"
                          src="https://www.youtube.com/embed/9JJYT8ajOKg?rel=0&modestbranding=1&playsinline=1"
                          title="Student testimonial"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-zinc-200 bg-white py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">FAQ</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
              Quick answers before you enroll
            </h2>
          </div>

          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {FAQ.map((item, idx) => (
              <details key={item.q} className="rounded-2xl border border-zinc-200 bg-white p-5" open={idx === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <span className="text-sm font-semibold text-zinc-900">{item.q}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-500" aria-hidden />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-zinc-950 py-12 text-white md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.16),transparent_60%)]" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold/90">
              Limited time offer
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              Ready to get full access and start preparing today?
            </h2>
            <p className="mt-2 text-white/75">
              Use code <span className="font-semibold text-gold">CPHQ25</span> during checkout and secure your spot.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="h-12 rounded-xl bg-[#F6D54A] px-6 font-bold uppercase tracking-wider text-zinc-900 hover:bg-[#F6D54A]/90"
              >
                <Link href="/checkout">Enroll in full program</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10">
                <Link href="/offers/cphq-free-lecture">Watch the free lecture first</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/70">
              {[
                { icon: Lock, label: "Secure checkout" },
                { icon: ShieldCheck, label: "Trusted payments" },
                { icon: Timer, label: "Instant access after payment" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gold" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

