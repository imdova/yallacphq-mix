"use client";

import * as React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
    youtubeId: "9JJYT8ajOKg",
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
    youtubeId: "9JJYT8ajOKg",
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
    youtubeId: "9JJYT8ajOKg",
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
    youtubeId: "9JJYT8ajOKg",
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

  const toggleComplete = () => {
    if (!activeLesson) return;
    setCompleted((prev) => {
      const set = new Set(prev);
      if (set.has(activeLesson.id)) set.delete(activeLesson.id);
      else set.add(activeLesson.id);
      return Array.from(set);
    });
  };

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
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.22),transparent_55%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold/90">
            <Medal className="h-4 w-4 text-gold" aria-hidden />
            Premium Enrollment
          </div>

          <p className="mt-3 text-xl font-bold tracking-tight text-white">
            Get the Full CPHQ Preparation Bundle
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Unlock 45+ hours of lectures, 1,200+ practice questions, and the complete study guide.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-zinc-200">
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>Comprehensive Exam Coverage</span>
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>Live Q&amp;A Mentorship Sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>1-Year Full Platform Access</span>
            </li>
          </ul>

          <Button
            asChild
            className="mt-5 h-12 w-full rounded-xl bg-[#F6D54A] font-bold uppercase tracking-wider text-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-[#F6D54A]/90"
          >
            <Link href="/offers/cphq-offer">Enroll in full program</Link>
          </Button>

          <p className="mt-3 text-center text-xs text-zinc-400">
            Limited time: Use code <span className="font-semibold text-gold">CPHQ25</span> for{" "}
            <span className="font-semibold text-zinc-200">25% OFF</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-zinc-900">
            <img
              src="/instructors/dr-ahmed-habib.png"
              alt="Dr. Ahmed Habib"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold/90">
              Instructor
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-white">Dr. Ahmed Habib</p>
            <p className="mt-0.5 text-xs text-zinc-300">
              15 years Experience in Healthcare Quality Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const CompleteCourseCurriculumSection = (
    <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Course Curriculum</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {FULL_COURSE_TOTALS.sections} Sections - {FULL_COURSE_TOTALS.lectures} Lectures,{" "}
            {FULL_COURSE_TOTALS.quizzes} Quizzes
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {FULL_COURSE_CURRICULUM.map((section) => {
            const open = courseCurriculumOpenId === section.id;
            return (
              <div key={section.id} className="rounded-xl bg-zinc-50 p-4">
                <button
                  type="button"
                  onClick={() => setCourseCurriculumOpenId(open ? null : section.id)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={open}
                >
                  <span className="text-sm font-semibold text-zinc-900">{section.title}</span>
                  <span className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="font-medium">
                      {section.lectureCount} {section.lectureCount === 1 ? "lecture" : "lectures"}
                    </span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "rotate-0")}
                      aria-hidden
                    />
                  </span>
                </button>

                {open ? (
                  <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4">
                    {section.lectures.map((lecture) => (
                      <div key={lecture.id} className="flex items-start justify-between gap-3">
                        <p className="text-sm text-zinc-700">{lecture.title}</p>
                        {lecture.durationLabel ? (
                          <span className="shrink-0 text-xs font-semibold text-zinc-500">
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
    <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">Students Feedback</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-900">
              Proof that the program delivers results
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Explore real student comments and short video testimonials that highlight the learning experience.
            </p>
          </div>
          <Button asChild variant="outline" className="h-10 rounded-xl border-zinc-200">
            <Link href="/offers/cphq-offer">See full program</Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900">Images</p>
                <p className="mt-1 text-xs text-zinc-500">A snapshot of real comments and success stories.</p>
              </div>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">Real reviews</span>
            </div>
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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900">Videos</p>
                <p className="mt-1 text-xs text-zinc-500">Hear directly from students—what changed after joining.</p>
              </div>
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-zinc-100">Testimonials</span>
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
                <div key={v.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                  <div className="relative aspect-[16/9] w-full bg-black">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube.com/embed/${v.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-zinc-900">{v.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">Short testimonial video</p>
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
    <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Lessons</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {completedCount}/{totalCount} completed
            </p>
            {nextRecommended && progressPct < 100 ? (
              <p className="mt-1 text-xs text-zinc-500">
                Next recommended:{" "}
                <span className="font-semibold text-zinc-700">
                  {formatLecturePart(nextRecommended.partLabel)}
                </span>
              </p>
            ) : null}
          </div>
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
            {progressPct}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
          <div className="h-full rounded-full bg-gold" style={{ width: `${progressPct}%` }} />
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
                  "w-full rounded-2xl border p-4 text-left transition",
                  isActive
                    ? "border-gold/40 bg-gold/10"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                )}
                aria-current={isActive ? "true" : undefined}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      isActive ? "bg-gold/15 text-gold" : "bg-zinc-100 text-zinc-500"
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
                      <span className="shrink-0 text-xs font-semibold text-zinc-500">
                        {lesson.durationLabel}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{lesson.title}</p>
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
    <div className="bg-zinc-50/80">
      <div className="container py-8 md:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-xl border border-zinc-700 bg-black px-4 py-2 text-left">
              <ListVideo className="h-4 w-4 shrink-0 text-gold" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  CPHQ Free Lecture
                </p>
                <p className="text-xs text-zinc-400">
                  {formatLecturePart(activeLesson.partLabel)} of {totalCount}
                </p>
              </div>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
              {activeLesson.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Sheet open={mobileLessonsOpen} onOpenChange={setMobileLessonsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 rounded-xl border-zinc-200 lg:hidden">
                  <ListVideo className="h-4 w-4" />
                  Lessons
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] bg-zinc-50 p-4">
                <div className="mt-4">{LessonsPanel}</div>
              </SheetContent>
            </Sheet>

            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-zinc-200"
              onClick={toggleComplete}
            >
              <CheckCircle2
                className={cn("h-4 w-4", completedSet.has(activeLesson.id) && "text-emerald-600")}
              />
              {completedSet.has(activeLesson.id) ? "Completed" : "Mark complete"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm">
              <div className="relative aspect-[16/9] w-full bg-black">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${activeLesson.youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <div className="border-t border-zinc-200 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-900">
                      {formatLecturePart(activeLesson.partLabel)}
                    </span>{" "}
                    <span className="text-zinc-400">·</span> {activeLesson.durationLabel}
                  </div>

                  <div className="flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-xl border-zinc-200"
                      onClick={() => prevLesson && openLesson(prevLesson.id)}
                      disabled={!prevLesson}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <Button
                      type="button"
                      className="h-9 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                      onClick={() => nextLesson && openLesson(nextLesson.id)}
                      disabled={!nextLesson}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-start sm:justify-end">
                    <Sheet open={resourcesOpen} onOpenChange={setResourcesOpen}>
                      <SheetTrigger asChild>
                        <Button type="button" variant="outline" className="h-9 rounded-xl border-zinc-200">
                          <Download className="h-4 w-4" />
                          Download Material
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="border-zinc-200 bg-zinc-50 p-4 sm:p-6">
                        <div className="mx-auto w-full max-w-3xl space-y-4">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Materials</p>
                            <p className="text-lg font-semibold text-zinc-900">
                              Download materials for {formatLecturePart(activeLesson.partLabel)}
                            </p>
                            <p className="text-sm text-zinc-600">{activeLesson.title}</p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {activeLesson.resources.map((r) => (
                              <Card key={r.label} className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                                <CardContent className="flex items-center gap-3 p-4">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-zinc-900">{r.label}</p>
                                    <p className="text-xs text-zinc-500">Download and study offline</p>
                                  </div>
                                  <Button asChild variant="outline" className="h-9 rounded-xl border-zinc-200">
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

            {/* Mobile-only: show Premium Enrollment just below video */}
            <div className="lg:hidden">{PremiumEnrollmentSection}</div>

            {CompleteCourseCurriculumSection}

            {StudentFeedbackSection}
          </div>

          <aside className="hidden h-fit lg:sticky lg:top-24 lg:block">{LessonsPanel}</aside>
        </div>
      </div>
    </div>
  );
}
