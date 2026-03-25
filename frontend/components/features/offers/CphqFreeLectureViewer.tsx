"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ListVideo,
  Medal,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MediaVideoPlayer } from "@/components/shared/MediaVideoPlayer";

type LessonResource = { label: string; href: string };

type FreeLesson = {
  id: string;
  partLabel: string;
  title: string;
  durationLabel: string;
  youtubeId: string;
  description: string;
  takeaways: string[];
  resources: LessonResource[];
};

const STORAGE_ACTIVE_LESSON_KEY = "yalla_free_lecture_active_lesson";
const STORAGE_COMPLETED_KEY = "yalla_free_lecture_completed";
const LECTURE_PREFIX = "Lecture One";

function formatLecturePart(partLabel: string) {
  return `${LECTURE_PREFIX} ( ${partLabel})`;
}

const FREE_LESSONS: FreeLesson[] = [
  {
    id: "part-1",
    partLabel: "Part 1",
    title: "Healthcare Quality Tools: Core Methodologies",
    durationLabel: "45 min",
    youtubeId: "NS3oBUx_CBQ",
    description:
      "Master the essential tools most frequently tested on CPHQ—Lean basics, DMAIC, Root Cause Analysis, and rapid PDSA cycles—through real-world healthcare examples.",
    takeaways: [
      "Lean Methodology: Identify the 8 types of waste in clinical workflows to improve efficiency.",
      "Six Sigma Basics: Understand DMAIC and how it reduces defects (e.g., medication errors).",
      "Root Cause Analysis (RCA): Apply 5 Whys and Ishikawa diagrams for patient safety incidents.",
      "PDSA Cycles: Run fast experiments to validate improvements without risking large rollouts.",
    ],
    resources: [
      { label: "Lecture Slides (PDF)", href: "#" },
      { label: "Quality Tools Cheat Sheet", href: "#" },
    ],
  },
  {
    id: "part-2",
    partLabel: "Part 2",
    title: "Patient Safety: From Incidents to Improvement",
    durationLabel: "32 min",
    youtubeId: "ojMOtv1a0Zs",
    description:
      "Learn how to translate incidents into measurable improvements using safety culture, reporting systems, and high-reliability principles.",
    takeaways: [
      "Safety culture: Why reporting improves outcomes when leaders respond consistently.",
      "Near-miss analysis: How small signals prevent large events.",
      "Standardization: Checklists and bundles that reduce variation.",
    ],
    resources: [{ label: "Safety Tools Worksheet", href: "#" }],
  },
  {
    id: "part-3",
    partLabel: "Part 3",
    title: "Performance Improvement: Choosing the Right Metric",
    durationLabel: "28 min",
    youtubeId: "HkvR77Un6Rg",
    description:
      "A practical walkthrough of selecting process vs outcome measures, building dashboards, and interpreting variation with confidence.",
    takeaways: [
      "Pick measures that drive behavior (not vanity metrics).",
      "Use leading indicators to predict outcomes early.",
      "Understand common-cause vs special-cause variation.",
    ],
    resources: [{ label: "Metrics & Dashboards Template", href: "#" }],
  },
  {
    id: "part-4",
    partLabel: "Part 4",
    title: "Leadership & Strategy: Turning Plans Into Results",
    durationLabel: "30 min",
    youtubeId: "6GVmLb942Sc",
    description:
      "Learn how quality leaders set priorities, align teams, and measure execution—so improvement work actually sticks.",
    takeaways: [
      "Strategy alignment: connect goals, KPIs, and frontline initiatives.",
      "Governance: define roles, escalation paths, and decision cadence.",
      "Change management: reduce resistance with clear communication and quick wins.",
    ],
    resources: [{ label: "Leadership & Strategy Worksheet", href: "#" }],
  },
];

type CourseCurriculumLecture = {
  id: string;
  title: string;
  durationLabel?: string;
};

type CourseCurriculumSection = {
  id: string;
  title: string;
  lectureCount: number;
  quizCount: number;
  lectures: CourseCurriculumLecture[];
};

const FULL_COURSE_CURRICULUM: CourseCurriculumSection[] = [
  {
    id: "intro-quality",
    title: "Introduction to Healthcare Quality",
    lectureCount: 2,
    quizCount: 0,
    lectures: [
      {
        id: "intro-1",
        title: "Lecture 1: Quality foundations & key definitions",
        durationLabel: "25 min",
      },
      {
        id: "intro-2",
        title: "Lecture 2: Quality tools overview for the CPHQ exam",
        durationLabel: "32 min",
      },
    ],
  },
];

const FULL_COURSE_TOTALS = {
  sections: FULL_COURSE_CURRICULUM.length,
  lectures: FULL_COURSE_CURRICULUM.reduce((sum, s) => sum + s.lectureCount, 0),
  quizzes: FULL_COURSE_CURRICULUM.reduce((sum, s) => sum + s.quizCount, 0),
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function CphqFreeLectureViewer() {
  const [mobileLessonsOpen, setMobileLessonsOpen] = React.useState(false);
  const [activeLessonId, setActiveLessonId] = React.useState(FREE_LESSONS[0]?.id ?? "");
  const [completed, setCompleted] = React.useState<string[]>([]);
  const [courseCurriculumOpenId, setCourseCurriculumOpenId] = React.useState<string | null>(null);
  const [resourcesOpen, setResourcesOpen] = React.useState(false);

  React.useEffect(() => {
    const storedActive = safeJsonParse<string>(localStorage.getItem(STORAGE_ACTIVE_LESSON_KEY));
    const storedCompleted = safeJsonParse<string[]>(localStorage.getItem(STORAGE_COMPLETED_KEY));
    if (storedActive && FREE_LESSONS.some((l) => l.id === storedActive))
      setActiveLessonId(storedActive);
    if (Array.isArray(storedCompleted))
      setCompleted(storedCompleted.filter((id) => FREE_LESSONS.some((l) => l.id === id)));
  }, []);

  React.useEffect(() => {
    if (!activeLessonId) return;
    localStorage.setItem(STORAGE_ACTIVE_LESSON_KEY, JSON.stringify(activeLessonId));
  }, [activeLessonId]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(completed));
  }, [completed]);

  const activeIndex = React.useMemo(
    () => FREE_LESSONS.findIndex((l) => l.id === activeLessonId),
    [activeLessonId]
  );
  const activeLesson = FREE_LESSONS[activeIndex] ?? FREE_LESSONS[0];

  const completedSet = React.useMemo(() => new Set(completed), [completed]);
  const totalCount = FREE_LESSONS.length;
  const completedCount = completed.length;
  const progressPct = totalCount
    ? Math.min(100, Math.round((completedCount / totalCount) * 100))
    : 0;

  const prevLesson = activeIndex > 0 ? FREE_LESSONS[activeIndex - 1] : null;
  const nextLesson =
    activeIndex >= 0 && activeIndex < totalCount - 1 ? FREE_LESSONS[activeIndex + 1] : null;

  const openLesson = (id: string) => {
    setActiveLessonId(id);
    setMobileLessonsOpen(false);
    // Smoothly bring the video into view on mobile
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextRecommended = React.useMemo(() => {
    const firstIncomplete = FREE_LESSONS.find((l) => !completedSet.has(l.id));
    return firstIncomplete ?? null;
  }, [completedSet]);

  const PremiumEnrollmentSection = (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-5 shadow-lg ring-1 ring-amber-500/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">
            <Medal className="h-4 w-4 text-amber-400" aria-hidden />
            Premium Enrollment
          </div>

          <p className="mt-3 text-xl font-bold tracking-tight text-white">
            Get the Full CPHQ Preparation Bundle
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Unlock 45+ hours of lectures, 1,200+ practice questions, and the complete study guide.
          </p>

          <ul className="mt-4 space-y-2.5 text-sm text-zinc-200">
            <li className="flex items-start gap-2.5">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
              <span>Comprehensive Exam Coverage</span>
            </li>
            <li className="flex items-start gap-2.5">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
              <span>Live Q&amp;A Mentorship Sessions</span>
            </li>
            <li className="flex items-start gap-2.5">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
              <span>1-Year Full Platform Access</span>
            </li>
          </ul>

          <Button
            asChild
            className="mt-5 h-12 w-full rounded-xl bg-gold font-bold text-zinc-900 shadow-md transition hover:bg-gold/90 hover:shadow-lg"
          >
            <Link href="/offers/cphq-offer">Enroll in full program</Link>
          </Button>

          <p className="mt-3 text-center text-xs text-zinc-400">
            Limited time: Use code <span className="font-semibold text-amber-300">CPHQ25</span> for{" "}
            <span className="font-semibold text-white">25% OFF</span>
          </p>
        </div>
      </div>
    </div>
  );

  const CompleteCourseCurriculumSection = (
    <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-200/50">
      <CardContent className="p-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Course Curriculum</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {FULL_COURSE_TOTALS.sections} Sections · {FULL_COURSE_TOTALS.lectures} Lectures ·{" "}
            {FULL_COURSE_TOTALS.quizzes} Quizzes
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {FULL_COURSE_CURRICULUM.map((section) => {
            const open = courseCurriculumOpenId === section.id;
            return (
              <div
                key={section.id}
                className="overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50/80 transition"
              >
                <button
                  type="button"
                  onClick={() => setCourseCurriculumOpenId(open ? null : section.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400"
                  aria-expanded={open}
                >
                  <span className="text-sm font-semibold text-zinc-900">{section.title}</span>
                  <span className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="font-medium">
                      {section.lectureCount} {section.lectureCount === 1 ? "lecture" : "lectures"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        open ? "rotate-180" : "rotate-0"
                      )}
                      aria-hidden
                    />
                  </span>
                </button>

                {open ? (
                  <div className="space-y-2 border-t border-zinc-200/80 bg-white/60 px-4 py-3">
                    {section.lectures.map((lecture) => (
                      <div
                        key={lecture.id}
                        className="flex items-start justify-between gap-3 rounded-lg py-2"
                      >
                        <p className="text-sm text-zinc-700">{lecture.title}</p>
                        {lecture.durationLabel ? (
                          <span className="shrink-0 text-xs font-medium text-zinc-500">
                            {lecture.durationLabel}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const StudentFeedbackSection = (
    <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-200/50">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Students Feedback
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-900">
              Proof that the program delivers results
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600">
              Real student comments and video testimonials from the learning experience.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-10 shrink-0 rounded-xl border-zinc-200 bg-white shadow-sm hover:bg-zinc-50"
          >
            <Link href="/offers/cphq-offer">See full program</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900">Images</p>
                <p className="mt-1 text-xs text-zinc-500">Real comments and success stories.</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Real reviews
              </span>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <Image
                src="/reviews/reviews-collage.png"
                alt="Student feedback collage"
                width={1200}
                height={675}
                className="h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900">Videos</p>
                <p className="mt-1 text-xs text-zinc-500">What changed after joining.</p>
              </div>
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-white">
                Testimonials
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {[
                {
                  id: "sf-1",
                  title: "Student story: confidence + exam strategy",
                  youtubeId: "9JJYT8ajOKg",
                },
                {
                  id: "sf-2",
                  title: "How the content helped in real hospital work",
                  youtubeId: "9JJYT8ajOKg",
                },
              ].map((v) => (
                <div
                  key={v.id}
                  className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-video w-full bg-zinc-900">
                    <MediaVideoPlayer
                      source={v.youtubeId}
                      title={v.title}
                      access="public"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-zinc-900">{v.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">Short testimonial video</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LessonsPanel = (
    <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-200/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Lessons
            </p>
            <p className="mt-1 text-sm font-bold text-zinc-900">
              {completedCount}/{totalCount} completed
            </p>
            {nextRecommended && progressPct < 100 ? (
              <p className="mt-1 text-xs text-zinc-500">
                Next:{" "}
                <span className="font-semibold text-amber-700">
                  {formatLecturePart(nextRecommended.partLabel)}
                </span>
              </p>
            ) : null}
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-800">
            {progressPct}%
          </span>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-gold transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mt-5 space-y-2">
          {FREE_LESSONS.map((lesson) => {
            const isActive = lesson.id === activeLesson?.id;
            const isDone = completedSet.has(lesson.id);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => openLesson(lesson.id)}
                className={cn(
                  "w-full rounded-xl border p-3.5 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2",
                  isActive
                    ? "border-amber-300 bg-amber-50 shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                )}
                aria-current={isActive ? "true" : undefined}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
                      isActive ? "bg-amber-200/80 text-amber-800" : "bg-zinc-100 text-zinc-500",
                      isDone && !isActive && "bg-emerald-100 text-emerald-600"
                    )}
                    aria-hidden
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {formatLecturePart(lesson.partLabel)}
                      </p>
                      <span className="shrink-0 text-xs font-medium text-zinc-500">
                        {lesson.durationLabel}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-zinc-600">
                      {lesson.title}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop sidebar only (hide inside mobile lesson drawer) */}
        <div className="mt-5 hidden lg:block">{PremiumEnrollmentSection}</div>
      </CardContent>
    </Card>
  );

  if (!activeLesson) return null;

  return (
    <div
      className="relative min-h-screen bg-zinc-950 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/free-lecture-bg.png)", backgroundAttachment: "fixed" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/35" aria-hidden />
      <div className="relative mx-auto w-full max-w-7xl px-2 py-6 sm:px-3 sm:py-8 md:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col items-center text-center sm:items-start sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-4 py-2 shadow-sm" dir="rtl">
              <ListVideo className="h-4 w-4 shrink-0 text-amber-700" aria-hidden />
              <p className="text-sm font-semibold text-amber-900">
                محاضرة مجانية هتغير مستقبلك المهني في الرعاية الصحية
              </p>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl">
              {activeLesson.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <Sheet open={mobileLessonsOpen} onOpenChange={setMobileLessonsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 lg:hidden"
                >
                  <ListVideo className="h-4 w-4" />
                  Lessons
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[320px] border-zinc-200 bg-zinc-50/95 p-5 backdrop-blur-sm"
              >
                <div className="mt-2">{LessonsPanel}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-200/50">
              <div className="relative aspect-video w-full bg-zinc-900">
                <MediaVideoPlayer
                  source={activeLesson.youtubeId}
                  title={activeLesson.title}
                  access="public"
                  autoPlay
                  className="h-full w-full"
                />
              </div>
              <div className="border-t border-zinc-100 bg-zinc-50/50 p-4">
                <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div className="text-sm text-zinc-600 md:order-1">
                    <span className="font-semibold text-zinc-900">
                      {formatLecturePart(activeLesson.partLabel)}
                    </span>{" "}
                    <span className="text-zinc-400">·</span> {activeLesson.durationLabel}
                  </div>

                  <div className="flex items-center justify-between gap-2 md:order-2 md:justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 flex-1 rounded-xl border-zinc-200 bg-white shadow-sm transition hover:bg-zinc-50 md:flex-none"
                      onClick={() => prevLesson && openLesson(prevLesson.id)}
                      disabled={!prevLesson}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <Button
                      type="button"
                      className="h-10 flex-1 rounded-xl bg-gold text-gold-foreground shadow-sm transition hover:bg-gold/90 md:flex-none"
                      onClick={() => nextLesson && openLesson(nextLesson.id)}
                      disabled={!nextLesson}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Sheet open={resourcesOpen} onOpenChange={setResourcesOpen}>
                      <SheetTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 flex-1 rounded-xl border-zinc-200 bg-white shadow-sm transition hover:bg-zinc-50 md:flex-none"
                        >
                          <Download className="h-4 w-4" />
                          Download Material
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="bottom"
                        className="border-t border-zinc-200 bg-white p-4 shadow-xl sm:p-6"
                      >
                        <div className="mx-auto w-full max-w-3xl space-y-5">
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                              Materials
                            </p>
                            <p className="text-lg font-bold text-zinc-900">
                              Download materials for {formatLecturePart(activeLesson.partLabel)}
                            </p>
                            <p className="text-sm text-zinc-600">{activeLesson.title}</p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {activeLesson.resources.map((r) => (
                              <Card
                                key={r.label}
                                className="rounded-2xl border-zinc-200 bg-zinc-50/50 shadow-sm transition hover:shadow-md"
                              >
                                <CardContent className="flex items-center gap-3 p-4">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-zinc-900">
                                      {r.label}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                      Download and study offline
                                    </p>
                                  </div>
                                  <Button
                                    asChild
                                    variant="outline"
                                    className="h-9 shrink-0 rounded-xl border-zinc-200 bg-white"
                                  >
                                    <a href={r.href}>
                                      <Download className="h-4 w-4" />
                                      Download
                                    </a>
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
            </Card>

            <div className="overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-gold via-amber-50/30 to-gold shadow-[0_4px_24px_rgba(180,140,45,0.2)]">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <div className="flex shrink-0 items-center justify-center sm:items-start">
                    <div className="relative">
                      <div className="relative h-[4rem] w-[4rem] overflow-hidden rounded-full shadow-lg ring-2 ring-white/60 ring-offset-2 ring-offset-amber-100/50 sm:h-[4.5rem] sm:w-[4.5rem]">
                        <Image
                          src="/instructors/dr-ahmed-habib.png"
                          alt="Dr. Ahmed Habib"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 64px, 72px"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-900/70">
                        Instructor
                      </p>
                      <h3 className="mt-0.5 text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                        Dr. Ahmed Habib
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm">
                        <Users className="h-3.5 w-3.5 text-amber-800" aria-hidden />
                        1,345 enrolled
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-amber-600 text-amber-600"
                            aria-hidden
                          />
                        ))}
                        <span className="ml-0.5 font-semibold">5.0</span>
                      </span>
                    </div>
                    <p className="border-t border-amber-200/50 pt-3 text-sm leading-relaxed text-white">
                      15 years Experience in Healthcare Quality Management. I helped more than 2500
                      medical students like ( Doctors, Dentists, Pharmacists, Nurses ) achieve
                      Excellence and start a new career in Healthcare Quality in Egypt and GULF
                      Region.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Outcomes / Result section */}
            <section
              dir="rtl"
              className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 p-6 shadow-md ring-1 ring-zinc-200/50 backdrop-blur-sm sm:p-8"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-gold to-amber-500"
                aria-hidden
              />
              <h2 className="text-center text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                هتستفيد أيه لما تشترك في CPHQ Preparation Course
              </h2>
              <ul className="mt-6 space-y-3">
                {[
                  "تفهم منهج امتحان CPHQ (Domains) وتعرف الأولويات اللي فعلاً بتجيب درجات",
                  "تتقن أدوات الجودة الأساسية (Lean, DMAIC, RCA, PDSA) وتطبقها على أمثلة واقعية",
                  "تطبق مفاهيم سلامة المرضى وتحول الحوادث إلى تحسينات قابلة للقياس",
                  "تختار المؤشرات الصح وتقرأ البيانات بثقة (Process vs Outcome + Variation)",
                  "تقود مبادرات التحسين وتثبت النتائج (Strategy alignment + Change management)",
                  "تجهز للاختبار بخطة مذاكرة + 45+ ساعة محاضرات و 1,200+ سؤال تدريبي",
                ].map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3.5 shadow-sm"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 ring-1 ring-amber-200"
                      aria-hidden
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <span className="flex-1 text-sm font-medium leading-relaxed text-zinc-800">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex justify-center">
                <Button
                  asChild
                  className="h-12 min-w-[200px] rounded-xl bg-gold px-8 font-bold text-gold-foreground shadow-md transition hover:bg-gold/90 hover:shadow-lg"
                >
                  <Link href="/offers/cphq-offer">خصم 25% - ابدأ دلوقتي</Link>
                </Button>
              </div>
            </section>

            {/* Mobile-only: show Premium Enrollment just below video */}
            <div className="lg:hidden">{PremiumEnrollmentSection}</div>

            {CompleteCourseCurriculumSection}

            {StudentFeedbackSection}
          </div>

          <aside className="hidden h-fit lg:sticky lg:top-6 lg:block">{LessonsPanel}</aside>
        </div>
      </div>
    </div>
  );
}
