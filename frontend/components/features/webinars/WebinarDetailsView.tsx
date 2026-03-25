"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Loader2, MessageCircle, User, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVideoPlayer } from "@/components/features/webinars/HeroVideoPlayer";
import { Webinar1SpotForm } from "@/components/features/webinars/Webinar1SpotForm";
import { WebinarPageHeader } from "@/components/features/webinars/WebinarPageHeader";
import { getErrorMessage } from "@/lib/api/error";
import { getPublicWebinarBySlug } from "@/lib/dal/webinars";
import type { StoredWebinar } from "@/types/webinar";

function formatDateParts(startsAt: string) {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) {
    return {
      dateLabel: "Date not set",
      timeLabel: "",
    };
  }

  return {
    dateLabel: new Intl.DateTimeFormat("en", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
    timeLabel: new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}

function DetailShell({ webinar }: { webinar: StoredWebinar }) {
  const { dateLabel, timeLabel } = formatDateParts(webinar.startsAt);

  return (
    <div className="min-h-screen bg-white">
      <div className="hidden md:block">
        <WebinarPageHeader
          registerHref={webinar.registrationEnabled ? "#save-spot" : "/webinars"}
          registerLabel={webinar.registrationEnabled ? "Register Now" : "Back to Webinars"}
        />
      </div>

      <section className="grid grid-cols-1 lg:min-h-[580px] lg:grid-cols-2 xl:min-h-[640px]">
        <div className="flex flex-col justify-center bg-zinc-900 px-4 py-10 sm:px-6 sm:py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20 xl:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            {webinar.registrationEnabled ? "Live Webinar" : "Recorded Webinar"}
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:mt-6 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            {webinar.title}
          </h1>
          <div className="mt-5 hidden flex-col lg:flex">
            <p className="max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
              {webinar.excerpt || webinar.description || "Join our expert-led webinar session."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <Button
                asChild
                className="h-12 rounded-lg bg-gold px-6 font-semibold uppercase tracking-wide text-gold-foreground hover:bg-gold/90"
              >
                <a href={webinar.registrationEnabled ? "#save-spot" : "/webinars"}>
                  {webinar.registrationEnabled ? "Register for Free" : "View all webinars"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[260px] w-full items-center justify-center bg-zinc-900 sm:min-h-[320px] md:min-h-[380px] lg:min-h-full">
          <HeroVideoPlayer videoUrl={webinar.videoUrl} title={webinar.title} />
        </div>

        <div className="flex flex-col bg-zinc-900 px-4 pb-12 pt-8 lg:hidden sm:px-6 sm:pb-14 md:px-10">
          <p className="max-w-lg text-base leading-relaxed text-white/80">
            {webinar.excerpt || webinar.description || "Join our expert-led webinar session."}
          </p>
          <div className="mt-6">
            <Button
              asChild
              className="h-12 rounded-lg bg-gold px-6 font-semibold uppercase tracking-wide text-gold-foreground hover:bg-gold/90"
            >
              <a href={webinar.registrationEnabled ? "#save-spot" : "/webinars"}>
                {webinar.registrationEnabled ? "Register for Free" : "View all webinars"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="border-b border-zinc-200 bg-zinc-100">
        <div className="container flex flex-wrap items-center gap-8 py-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-800">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-800">
              {timeLabel} {webinar.timezoneLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-800">
              {webinar.speakerName}
              {webinar.speakerTitle ? `, ${webinar.speakerTitle}` : ""}
            </span>
          </div>
        </div>
      </div>

      <section className="border-b border-zinc-200 bg-zinc-50/50">
        <div className="container py-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">About this webinar</h2>
              <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-zinc-600">
                {webinar.description || webinar.excerpt || "Details will be shared soon."}
              </p>

              {webinar.learnPoints.length > 0 ? (
                <div className="mt-8 space-y-6">
                  {webinar.learnPoints.map((point) => (
                    <div
                      key={point.id}
                      className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900">{point.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-600">{point.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div id="save-spot" className="lg:sticky lg:top-24 lg:self-start">
              <Webinar1SpotForm webinar={webinar} />
            </div>
          </div>
        </div>
      </section>

      {webinar.trustedBy.length > 0 ? (
        <section className="border-b border-zinc-200 bg-white py-12">
          <div className="container text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              TRUSTED BY PROVIDERS AT:
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-10 md:gap-16">
              {webinar.trustedBy.map((name) => (
                <span key={name} className="text-lg font-semibold text-zinc-500 md:text-xl">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {webinar.stats.length > 0 ? (
        <section className="bg-zinc-900 py-10 text-white">
          <div className="container text-center">
            <p className="text-lg font-medium md:text-xl">
              Join our learners with focused webinar sessions and practical CPHQ preparation support
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-12 md:gap-16">
              {webinar.stats.map((stat) => (
                <div key={stat.id}>
                  <p className="text-2xl font-bold text-white md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="border-t border-zinc-800 bg-zinc-900 px-4 py-6 text-white">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-5 w-5 shrink-0 rounded bg-gold" aria-hidden />
            <span className="text-sm font-semibold">Yalla CPHQ</span>
          </Link>
          <p className="text-center text-xs text-zinc-400">Learn, practice, and join our upcoming sessions.</p>
          <div className="flex gap-6 text-xs text-zinc-400">
            <Link href="/webinars" className="hover:text-white">
              All webinars
            </Link>
            <Link href="/courses" className="hover:text-white">
              Courses
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function WebinarDetailsView({ slug }: { slug: string }) {
  const [webinar, setWebinar] = React.useState<StoredWebinar | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const item = await getPublicWebinarBySlug(slug);
        if (!cancelled) setWebinar(item);
      } catch (err) {
        if (!cancelled) {
          setWebinar(null);
          setError(getErrorMessage(err, "Failed to load webinar."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-zinc-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading webinar...
      </div>
    );
  }

  if (!webinar) {
    return (
      <div className="container py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <Video className="mx-auto h-8 w-8 text-zinc-400" />
          <h1 className="mt-4 text-2xl font-semibold text-zinc-900">Webinar not found</h1>
          <p className="mt-2 text-sm text-zinc-600">{error || "The webinar may still be in draft mode."}</p>
          <Button asChild className="mt-6">
            <Link href="/webinars">Back to webinars</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <DetailShell webinar={webinar} />;
}
