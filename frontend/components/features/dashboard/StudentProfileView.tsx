"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/dal/user";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/types/user";
import {
  Building2,
  Calendar,
  Clock3,
  GraduationCap,
  MapPin,
  Medal,
  Pencil,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

const stats = [
  {
    label: "CPHQ Readiness",
    value: "82%",
    sub: "+5% this month",
    icon: TrendingUp,
    progress: 82,
  },
  {
    label: "Courses Completed",
    value: "5",
    sub: "2 in progress",
    icon: GraduationCap,
  },
  {
    label: "Total Study Hours",
    value: "124h",
    sub: "Avg 12h / week",
    icon: Clock3,
  },
  {
    label: "Community Rank",
    value: "#12",
    sub: "Global leaderboard",
    icon: Medal,
  },
] as const;

const credentials = [
  {
    title: "MSc in Healthcare Administration",
    org: "London School of Hygiene",
    icon: GraduationCap,
  },
  {
    title: "Registered Nurse (RN)",
    org: "Board of Nursing, Ohio",
    icon: Users,
  },
  {
    title: "Certified Professional in Healthcare Quality (CPHQ)",
    org: "NAHQ Global Certification",
    icon: Medal,
  },
] as const;

export function StudentProfileView() {
  const [copied, setCopied] = React.useState(false);
  const [me, setMe] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const { user: authUser, status } = useAuth();

  // Prefer auth context user (stays in sync after Settings save); fallback to fetched me
  const displayUser: User | null = authUser ?? me;

  React.useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      if (status === "unauthenticated") setLoadError("Please sign in to view your profile.");
      return;
    }
    if (authUser) {
      setMe(authUser);
      setLoading(false);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const user = await getCurrentUser();
        if (!cancelled) {
          setMe(user);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, authUser]);

  const displayName = displayUser?.name?.trim() || "—";
  const { firstName, lastName } = splitName(displayUser?.name ?? "");
  const fullName = displayName;
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "U";
  const title = displayUser?.speciality?.trim() || "Student";
  const org = displayUser?.course?.trim() || "Yalla CPHQ";
  const location = displayUser?.country?.trim() || "—";

  const share = async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "https://example.com/dashboard/profile";
    try {
      const maybeNavigator = navigator as Navigator & { share?: (data: { title?: string; url?: string }) => Promise<void> };
      if (maybeNavigator.share) {
        await maybeNavigator.share({ title: fullName, url });
        return;
      }
    } catch {
      // fall back to copy
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      {loadError ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-rose-800">Couldn’t load profile</div>
            <div className="mt-1 text-sm text-rose-700">{loadError}</div>
          </CardContent>
        </Card>
      ) : null}
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-5">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 text-2xl font-bold text-zinc-700 ring-4 ring-gold/40">
                  {initials}
                </div>
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-white" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-2xl font-bold tracking-tight text-zinc-900">
                  {loading ? "Loading…" : fullName}
                </div>
                <div className="mt-1 text-sm font-semibold text-gold">{title}</div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-600">
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    {org}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    {location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <Button asChild className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
                <Link href="/dashboard/settings?section=personal" className="inline-flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-zinc-200"
                onClick={() => void share()}
              >
                <Share2 className="h-4 w-4" />
                {copied ? "Copied" : "Share Profile"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="rounded-2xl border-zinc-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  {s.sub ? (
                    <span className="text-xs font-semibold text-emerald-600">{s.sub}</span>
                  ) : null}
                </div>
                <div className="mt-3 text-2xl font-bold text-zinc-900">{s.value}</div>
                <div className="text-sm text-zinc-600">{s.label}</div>
                {"progress" in s ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${(s as { progress: number }).progress}%` }}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:gap-10">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Professional Biography</CardTitle>
            <CardDescription>About your background and experience.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4 text-sm leading-6 text-zinc-700">
              <p>
                Dedicated healthcare quality assurance professional with over 8 years of experience in clinical
                operations and patient safety. Currently leading the quality department at City Medical Center,
                focused on implementing evidence‑based protocols and streamlining reporting processes.
              </p>
              <p>
                Committed to achieving excellence in healthcare delivery through continuous learning and
                mentorship. Actively pursuing ongoing education and contributing to regional healthcare quality
                forums.
              </p>
            </div>

            <Separator className="my-6 bg-zinc-200" />

            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Hospital affiliation
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">City Medical Center</div>
                    <div className="mt-0.5 text-xs text-zinc-500">Dubai Health Authority (DHA)</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200">
                        <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        Quality Assurance
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200">
                        <Users className="h-3.5 w-3.5 text-zinc-400" />
                        Team lead
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        Since 2019
                      </span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Credentials &amp; Education</CardTitle>
            <CardDescription>Verified achievements and learning.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {credentials.map(({ title, org, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">{title}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">{org}</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Languages</div>
              <div className="mt-2 text-sm font-medium text-zinc-800">English, Arabic, French</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
