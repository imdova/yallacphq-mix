import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  Wrench,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebinarPageHeader } from "@/components/features/webinars/WebinarPageHeader";
import { HeroVideoPlayer } from "@/components/features/webinars/HeroVideoPlayer";
import { Webinar1SpotForm } from "@/components/features/webinars/Webinar1SpotForm";

const learnBlocks = [
  {
    icon: Briefcase,
    title: "Exam Blueprints",
    description:
      "Deep dive into the 4 key content domains: Organizational Leadership, Health Data Analytics, Performance Improvement, and Patient Safety.",
  },
  {
    icon: Wrench,
    title: "Quality Tools Mastery",
    description:
      "Master the essential tools: SPC Charts, Root Cause Analysis, and FMEA techniques used in everyday high-reliability organizations.",
  },
  {
    icon: MessageCircle,
    title: "Live Q&A Session",
    description:
      "Get your specific questions answered by Dr. Jane Smith. We'll tackle common exam myths and tricky scenarios.",
  },
];

const trustedBy = ["HealthCorp", "MediCare+", "Global Clinic", "UnityHealth"];

const stats = [
  { value: "98%", label: "SATISFACTION" },
  { value: "12k+", label: "CERTIFIED" },
  { value: "24/7", label: "SUPPORT" },
  { value: "#1", label: "REVIEW" },
];

export default function CPHQWebinar1Page() {
  return (
    <div className="min-h-screen bg-white">
      <div className="hidden md:block">
        <WebinarPageHeader />
      </div>
      {/* Hero: on mobile = tag+headline → video → CTA; on lg = left (tag+headline+CTA) | video */}
      <section className="grid min-h-0 grid-cols-1 gap-0 lg:min-h-[580px] lg:grid-cols-2 lg:gap-0 xl:min-h-[640px]">
        {/* Left column: tag + headline; on lg also paragraph + CTA */}
        <div className="flex flex-col justify-center bg-zinc-900 px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20 xl:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            Live Webinar
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:mt-6 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            Master <span className="text-gold">CPHQ</span> in <span className="text-gold">60</span> Minutes
          </h1>
          {/* Desktop: paragraph + CTA below headline */}
          <div className="mt-5 hidden flex-col md:mt-6 lg:mt-8 lg:flex xl:mt-10">
            <p className="max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
              Join the elite group of Certified Professionals in Healthcare Quality. Learn the blueprints
              and tools to ace your exam with confidence.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5 md:mt-8">
              <Button
                asChild
                className="h-12 rounded-lg bg-gold px-6 text-gold-foreground hover:bg-gold/90 font-semibold uppercase tracking-wide"
              >
                <a href="#save-spot">
                  REGISTER FOR FREE
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-zinc-900 bg-zinc-600 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://i.pravatar.cc/96?img=${i + 10})`,
                    }}
                  />
                ))}
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-700 text-xs font-semibold text-gold">
                  +500
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video: on mobile between headline and CTA */}
        <div className="relative flex min-h-[260px] w-full items-center justify-center bg-zinc-900 sm:min-h-[320px] md:min-h-[380px] lg:min-h-full">
          <HeroVideoPlayer />
        </div>

        {/* Mobile only: paragraph + CTA below video */}
        <div className="flex flex-col bg-zinc-900 px-4 pb-12 pt-8 lg:hidden sm:px-6 sm:pb-14 md:px-10">
          <p className="max-w-lg text-base leading-relaxed text-white/80">
            Join the elite group of Certified Professionals in Healthcare Quality. Learn the blueprints
            and tools to ace your exam with confidence.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Button
              asChild
              className="h-12 w-full rounded-lg bg-gold px-6 text-gold-foreground hover:bg-gold/90 font-semibold uppercase tracking-wide sm:w-auto"
            >
              <a href="#save-spot">
                REGISTER FOR FREE
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-zinc-900 bg-zinc-600 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(https://i.pravatar.cc/96?img=${i + 10})`,
                  }}
                />
              ))}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-700 text-xs font-semibold text-gold">
                +500
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Webinar details bar */}
      <div className="border-b border-zinc-200 bg-zinc-100">
        <div className="container flex flex-wrap items-center gap-8 py-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-800">Saturday, Oct 25th</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-800">8:00 PM (GMT+3)</span>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-800">Dr. Jane Smith, CPHQ Expert</span>
          </div>
        </div>
      </div>

      {/* Main: What You Will Learn + Save My Spot */}
      <section className="border-b border-zinc-200 bg-zinc-50/50">
        <div className="container py-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
                What You Will Learn
              </h2>
              <p className="mt-2 max-w-xl text-zinc-600">
                Our comprehensive 60-minute session is designed to give you a strategic advantage in
                your CPHQ journey.
              </p>
              <div className="mt-8 space-y-6">
                {learnBlocks.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div id="save-spot" className="lg:sticky lg:top-24 lg:self-start">
              <Webinar1SpotForm />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-b border-zinc-200 bg-white py-12">
        <div className="container text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            TRUSTED BY PROVIDERS AT:
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {trustedBy.map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-zinc-500 md:text-xl"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats footer strip */}
      <section className="bg-zinc-900 py-10 text-white">
        <div className="container text-center">
          <p className="text-lg font-medium md:text-xl">
            Join <strong className="font-bold">500+ Healthcare Providers</strong> already registered for this session
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white md:text-3xl">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer legal */}
      <footer className="border-t border-zinc-800 bg-zinc-900 px-4 py-6 text-white">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-5 w-5 shrink-0 rounded bg-gold" aria-hidden />
            <span className="text-sm font-semibold">Yalla CPHQ</span>
          </Link>
          <p className="text-center text-xs text-zinc-400">
            © 2023 Yalla CPHQ Healthcare Quality Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-zinc-400">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
