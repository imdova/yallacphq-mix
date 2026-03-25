"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/error";
import { getPublicWebinars } from "@/lib/dal/webinars";
import type { StoredWebinar } from "@/types/webinar";

function formatDate(value: string, timezoneLabel: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return timezoneLabel;
  return `${new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)} ${timezoneLabel}`;
}

export function WebinarsIndexView() {
  const [items, setItems] = React.useState<StoredWebinar[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const webinars = await getPublicWebinars();
        if (!cancelled) setItems(webinars);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load webinars."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white">
        <div className="container py-12 md:py-16">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">Webinars</h1>
          <p className="mt-2 max-w-2xl text-zinc-600">
            Join our live and recorded sessions to sharpen your CPHQ preparation with practical guidance
            from healthcare quality experts.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {loading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading webinars...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-zinc-900">No webinars published yet</p>
            <p className="mt-2 text-sm text-zinc-600">Publish a webinar from the admin dashboard to show it here.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((webinar) => (
              <Card key={webinar.id} className="overflow-hidden border-zinc-200 transition-shadow hover:shadow-md">
                <div className="relative h-44 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
                  {webinar.coverImageUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-75"
                      style={{ backgroundImage: `url(${webinar.coverImageUrl})` }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative flex h-full flex-col justify-end p-5 text-white">
                    <span className="inline-flex w-fit rounded-full bg-gold px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-gold-foreground">
                      {webinar.registrationEnabled ? "Live webinar" : "Replay"}
                    </span>
                    <h2 className="mt-3 text-xl font-semibold">{webinar.title}</h2>
                  </div>
                </div>
                <CardHeader>
                  <CardDescription className="line-clamp-3 min-h-[60px]">
                    {webinar.excerpt || "Join this webinar for a focused CPHQ preparation session."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-zinc-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(webinar.startsAt, webinar.timezoneLabel)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4" />
                      <span>
                        {webinar.speakerName}
                        {webinar.speakerTitle ? `, ${webinar.speakerTitle}` : ""}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-1">
                    <Link href={`/webinars/${webinar.slug}`}>
                      View details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
