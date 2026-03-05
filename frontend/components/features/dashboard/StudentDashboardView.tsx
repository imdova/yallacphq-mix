"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  BarChart3,
  Flame,
  MessageCircle,
  Download,
  Play,
  Sparkles,
  Video,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getMyCourses } from "@/lib/dal/courses";
import type { Course } from "@/types/course";

const stats = [
  { label: "Hours Studied", value: "42.5h", icon: Clock },
  { label: "Quiz Avg. Score", value: "88%", icon: BarChart3 },
  { label: "Streak Days", value: "12 Days", icon: Flame },
  { label: "Live Sessions", value: "3 Sessions", icon: Video },
];

export function StudentDashboardView() {
  const { user } = useAuth();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    getMyCourses()
      .then((list) => {
        if (!cancelled) setCourses(list);
      })
      .catch(() => {
        if (!cancelled) setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setCoursesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayName = user?.name ?? "there";
  const firstCourse = courses[0];
  const coursesPreview = React.useMemo(
    () =>
      courses.slice(0, 3).map((c) => ({
        id: c.id,
        title: c.title,
        nextLesson: "Continue learning",
        progress: 0,
      })),
    [courses]
  );

  const tasks = React.useMemo(
    () => [
      { id: "lesson", label: "Watch the next lesson", meta: "18 min" },
      { id: "quiz", label: "Take a quick quiz", meta: "10 questions" },
      { id: "notes", label: "Review your notes", meta: "5 min" },
    ],
    []
  );

  const [taskDone, setTaskDone] = React.useState<Record<string, boolean>>({
    lesson: true,
    quiz: false,
    notes: false,
  });

  const doneCount = React.useMemo(
    () => tasks.reduce((acc, t) => acc + (taskDone[t.id] ? 1 : 0), 0),
    [taskDone, tasks]
  );
  const donePct = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            {greeting}, {displayName}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Your plan today: <span className="font-semibold text-zinc-900">{doneCount}</span> of{" "}
            <span className="font-semibold text-zinc-900">{tasks.length}</span> tasks.
          </p>
        </div>
        <Button asChild className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
          <Link href="/dashboard/courses/lesson" className="inline-flex items-center gap-2">
            <Play className="h-4 w-4" />
            Continue learning
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                  This week
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold text-zinc-900">{value}</div>
              <div className="text-sm text-zinc-600">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-10">
        <div className="min-w-0 space-y-6">
          <Card className="overflow-hidden rounded-2xl border-zinc-200 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    Continue
                  </div>
                  <div className="mt-2 truncate text-xl font-bold">
                    {firstCourse ? firstCourse.title : "My courses"}
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    {firstCourse
                      ? "Next: Continue learning"
                      : coursesLoading
                        ? "Loading…"
                        : "Enroll in a course to get started."}
                  </div>
                  {firstCourse && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gold" style={{ width: "0%" }} />
                      </div>
                      <div className="text-sm font-semibold text-gold">0%</div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:items-end">
                  <Button
                    asChild
                    className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                  >
                    <Link
                      href={firstCourse ? `/dashboard/courses/lesson?course=${firstCourse.id}` : "/dashboard/courses"}
                      className="inline-flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {firstCourse ? "Resume" : "View courses"}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    <Link href="/dashboard/courses" className="inline-flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      My courses
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">My courses</CardTitle>
              <CardDescription>Your most active courses right now</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {coursesLoading ? (
                  <p className="text-sm text-zinc-500">Loading your courses…</p>
                ) : coursesPreview.length === 0 ? (
                  <p className="text-sm text-zinc-500">You are not enrolled in any course yet.</p>
                ) : (
                  coursesPreview.map((c) => (
                    <Link
                      key={c.id}
                      href="/dashboard/courses"
                      className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-zinc-900">{c.title}</div>
                          <div className="truncate text-xs text-zinc-500">Next: {c.nextLesson}</div>
                        </div>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                          {c.progress}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${c.progress}%` }} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button asChild variant="outline" className="rounded-xl border-zinc-200">
                  <Link href="/dashboard/courses" className="inline-flex items-center gap-2">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today</CardTitle>
              <CardDescription>Small wins that keep you progressing</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <div className="text-sm font-medium text-zinc-900">Progress</div>
                <div className="text-sm font-semibold text-zinc-900">{donePct}%</div>
              </div>
              <div className="mt-4 space-y-3">
                {tasks.map((t) => (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={!!taskDone[t.id]}
                        onCheckedChange={(checked) =>
                          setTaskDone((prev) => ({ ...prev, [t.id]: Boolean(checked) }))
                        }
                        className="mt-0.5"
                        aria-label={t.label}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-900">{t.label}</div>
                        <div className="text-xs text-zinc-500">{t.meta}</div>
                      </div>
                    </div>
                    {taskDone[t.id] ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Done
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                        Pending
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-gold" />
                Quick actions
              </CardTitle>
              <CardDescription>Jump back in, instantly</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button
                asChild
                className="w-full justify-between rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
              >
                <Link href="/dashboard/quizzes">
                  Practice quizzes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-xl border-zinc-200">
                <Link href="/dashboard/community">
                  Community
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-xl border-zinc-200">
                <Link href="/dashboard/support">
                  Get support
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-xl border-zinc-200">
                <Link href="#">
                  Exam blueprint
                  <Download className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-xl border-zinc-200">
                <Link href="#">
                  Join WhatsApp group
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upcoming live session</CardTitle>
              <CardDescription>Don’t miss the Q&A</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-zinc-900">Biostatistics & Analysis Q&A</div>
                  <div className="mt-0.5 text-xs text-zinc-500">Oct 24 · 7:00 PM GMT</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full rounded-xl border-zinc-200 bg-white"
                  >
                    Set reminder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
