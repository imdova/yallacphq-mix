"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LessonPageHeader } from "@/components/features/dashboard/LessonPageHeader";
import { LessonSidebar } from "@/components/features/dashboard/LessonSidebar";
import { LessonContentView } from "@/components/features/dashboard/LessonContentView";
import { QuizTakingClient, QUIZ_BANK } from "@/app/dashboard/quizzes/QuizTakingClient";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getMyCourses } from "@/lib/dal/courses";
import { getErrorMessage } from "@/lib/api/error";
import type { Course, CourseCurriculumLecture } from "@/types/course";
import { ArrowLeft, Clock, ListOrdered, Menu, Shuffle, SlidersHorizontal, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizQuestionOrder = "regular" | "random";
type QuizPracticeMode = "quiz" | "test" | "study";

type FlattenedLecture = CourseCurriculumLecture & {
  sectionId: string;
  sectionTitle: string;
  sectionDescription?: string;
};

function buildLessonHref(courseId: string, lessonId: string): string {
  const params = new URLSearchParams();
  params.set("course", courseId);
  params.set("lesson", lessonId);
  return `/dashboard/courses/lesson?${params.toString()}`;
}

function LessonQuizConfiguration({ moduleId }: { moduleId: string }) {
  const searchParams = useSearchParams();
  const quiz = QUIZ_BANK[moduleId] ?? QUIZ_BANK.m2;

  const [order, setOrder] = React.useState<QuizQuestionOrder>("random");
  const [mode, setMode] = React.useState<QuizPracticeMode>("test");

  React.useEffect(() => {
    setOrder("random");
    setMode("test");
  }, [moduleId]);

  const startParams = new URLSearchParams(searchParams.toString());
  startParams.set("quiz", moduleId);
  startParams.set("quizStart", "1");
  startParams.set("order", order);
  startParams.set("mode", mode);
  const startHref = `/dashboard/courses/lesson?${startParams.toString()}`;

  const reviewParams = new URLSearchParams(searchParams.toString());
  reviewParams.delete("quiz");
  reviewParams.delete("quizStart");
  reviewParams.delete("order");
  reviewParams.delete("mode");
  const reviewHref = reviewParams.toString()
    ? `/dashboard/courses/lesson?${reviewParams.toString()}`
    : "/dashboard/courses/lesson";

  // Placeholder values to match the provided design.
  const totalQuestions = 67;
  const durationMin = 60;
  const passingScore = 70;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="rounded-3xl bg-zinc-950/5 px-6 py-6 shadow-sm ring-1 ring-black/5 sm:px-10 sm:py-7">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {quiz.title}
          </h1>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-white/70">
              <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <ListOrdered className="h-3.5 w-3.5" aria-hidden />
              </div>
              QUESTIONS
            </div>
            <p className="mt-2 text-xs font-medium text-white/70">Total Volume</p>
            <p className="mt-0.5 text-2xl font-semibold leading-none text-white">{totalQuestions}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-white/70">
              <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Clock className="h-3.5 w-3.5" aria-hidden />
              </div>
              TIME LIMIT
            </div>
            <p className="mt-2 text-xs font-medium text-white/70">Duration</p>
            <p className="mt-0.5 text-2xl font-semibold leading-none text-white">{durationMin} min</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-white/70">
              <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Target className="h-3.5 w-3.5" aria-hidden />
              </div>
              TARGET
            </div>
            <p className="mt-2 text-xs font-medium text-white/70">Passing Score</p>
            <p className="mt-0.5 text-2xl font-semibold leading-none text-white">{passingScore}%</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section>
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-gold" aria-hidden />
              <h2 className="text-sm font-semibold text-zinc-900">Question Order</h2>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setOrder("regular")}
                className={cn(
                  "rounded-2xl border bg-white p-3 text-left shadow-sm transition",
                  order === "regular"
                    ? "border-gold ring-2 ring-gold/20"
                    : "border-zinc-200 hover:border-zinc-300"
                )}
                aria-pressed={order === "regular"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-700">
                    <ListOrdered className="h-4 w-4" aria-hidden />
                  </div>
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      order === "regular" ? "border-gold" : "border-zinc-200"
                    )}
                    aria-hidden
                  >
                    {order === "regular" ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                    ) : null}
                  </div>
                </div>
                <p className="mt-2.5 text-sm font-semibold text-zinc-900">Regular</p>
                <p className="mt-1 text-xs text-zinc-500">Sequential order</p>
              </button>

              <button
                type="button"
                onClick={() => setOrder("random")}
                className={cn(
                  "rounded-2xl border bg-white p-3 text-left shadow-sm transition",
                  order === "random"
                    ? "border-gold ring-2 ring-gold/20"
                    : "border-zinc-200 hover:border-zinc-300"
                )}
                aria-pressed={order === "random"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-700">
                    <Shuffle className="h-4 w-4" aria-hidden />
                  </div>
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      order === "random" ? "border-gold" : "border-zinc-200"
                    )}
                    aria-hidden
                  >
                    {order === "random" ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                    ) : null}
                  </div>
                </div>
                <p className="mt-2.5 text-sm font-semibold text-zinc-900">Random</p>
                <p className="mt-1 text-xs text-zinc-500">Shuffled questions</p>
              </button>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gold" aria-hidden />
              <h2 className="text-sm font-semibold text-zinc-900">Practice Mode</h2>
            </div>

            <div className="mt-3 space-y-3">
              <button
                type="button"
                onClick={() => setMode("quiz")}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm transition",
                  mode === "quiz"
                    ? "border-gold ring-2 ring-gold/20"
                    : "border-zinc-200 hover:border-zinc-300"
                )}
              >
                <span
                  className={cn(
                    "mt-1 flex h-5 w-5 items-center justify-center rounded-full border",
                    mode === "quiz" ? "border-gold" : "border-zinc-300"
                  )}
                  aria-hidden
                >
                  {mode === "quiz" ? <span className="h-2.5 w-2.5 rounded-full bg-gold" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-zinc-900">Quiz Mode</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    Get detailed feedback immediately after each question.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode("test")}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm transition",
                  mode === "test"
                    ? "border-gold ring-2 ring-gold/20"
                    : "border-zinc-200 hover:border-zinc-300"
                )}
              >
                <span
                  className={cn(
                    "mt-1 flex h-5 w-5 items-center justify-center rounded-full border",
                    mode === "test" ? "border-gold" : "border-zinc-300"
                  )}
                  aria-hidden
                >
                  {mode === "test" ? <span className="h-2.5 w-2.5 rounded-full bg-gold" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-zinc-900">Test Mode</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    Full exam simulation. Results shown only at the end.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode("study")}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm transition",
                  mode === "study"
                    ? "border-gold ring-2 ring-gold/20"
                    : "border-zinc-200 hover:border-zinc-300"
                )}
              >
                <span
                  className={cn(
                    "mt-1 flex h-5 w-5 items-center justify-center rounded-full border",
                    mode === "study" ? "border-gold" : "border-zinc-300"
                  )}
                  aria-hidden
                >
                  {mode === "study" ? <span className="h-2.5 w-2.5 rounded-full bg-gold" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-zinc-900">Study Mode</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    Browse questions with answers and explanations visible.
                  </span>
                </span>
              </button>
            </div>
          </section>
        </div>

        <div className="mt-8">
          <Button
            asChild
            className="h-12 w-full rounded-2xl bg-gold text-sm font-semibold text-gold-foreground hover:bg-gold/90"
          >
            <Link href={startHref}>Start Quiz Now</Link>
          </Button>
          <Link
            href={reviewHref}
            className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Review Lesson
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  const [open, setOpen] = React.useState(false);
  const searchParams = useSearchParams();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    getMyCourses()
      .then((items) => {
        if (!cancelled) {
          setCourses(items);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCourses([]);
          setLoadError(getErrorMessage(error, "Failed to load your courses"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const courseId = searchParams.get("course")?.trim() ?? "";
  const lessonId = searchParams.get("lesson")?.trim() ?? "";
  const quizModuleId = searchParams.get("quiz");
  const quizStarted = searchParams.get("quizStart") === "1";
  const quizMode = searchParams.get("mode");
  const isStudyMode = quizMode === "study";
  const activeCourse = React.useMemo(() => {
    if (!courses.length) return null;
    if (courseId) return courses.find((course) => course.id === courseId) ?? null;
    return courses[0] ?? null;
  }, [courses, courseId]);

  const flattenedLectures = React.useMemo<FlattenedLecture[]>(() => {
    const sections = activeCourse?.curriculumSections ?? [];
    return sections.flatMap((section) =>
      (section.items ?? []).flatMap((item) =>
        item.type === "lecture"
          ? [
              {
                ...item,
                sectionId: section.id,
                sectionTitle: section.title,
                sectionDescription: section.description,
              },
            ]
          : []
      )
    );
  }, [activeCourse]);

  const currentLecture = React.useMemo(() => {
    if (!flattenedLectures.length) return null;
    if (lessonId) return flattenedLectures.find((lecture) => lecture.id === lessonId) ?? flattenedLectures[0];
    return flattenedLectures[0];
  }, [flattenedLectures, lessonId]);

  const currentLessonIndex = currentLecture
    ? flattenedLectures.findIndex((lecture) => lecture.id === currentLecture.id)
    : -1;
  const previousLecture =
    currentLessonIndex > 0 ? flattenedLectures[currentLessonIndex - 1] : null;
  const nextLecture =
    currentLessonIndex >= 0 && currentLessonIndex < flattenedLectures.length - 1
      ? flattenedLectures[currentLessonIndex + 1]
      : null;

  const sidebarSections = React.useMemo(() => {
    if (!activeCourse) return [];

    return (activeCourse.curriculumSections ?? []).map((section) => {
      const items = section.items ?? [];
      const lessons = items.flatMap((item) =>
        item.type === "lecture"
          ? [
              {
                id: item.id,
                title: item.title,
                href: buildLessonHref(activeCourse.id, item.id),
                current: currentLecture?.id === item.id,
              },
            ]
          : []
      );
      const quizzes = items.flatMap((item) =>
        item.type === "quiz"
          ? [
              {
                id: item.id,
                title: item.title,
              },
            ]
          : []
      );

      return {
        id: section.id,
        title: section.title,
        description: section.description,
        current: lessons.some((lesson) => lesson.current),
        lessons,
        quizzes,
      };
    });
  }, [activeCourse, currentLecture?.id]);

  const content = loading ? (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="text-sm text-zinc-500">Loading course content…</p>
      </div>
    </div>
  ) : loadError ? (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
      <p className="text-sm font-semibold text-rose-800">Couldn’t load your course</p>
      <p className="mt-1 text-sm text-rose-700">{loadError}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-xl border-rose-200">
          <Link href="/dashboard/courses">Back to courses</Link>
        </Button>
      </div>
    </div>
  ) : !activeCourse ? (
    <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 shadow-sm">
      <p className="text-base font-semibold text-zinc-900">
        {courseId ? "This course is not in your dashboard" : "No enrolled courses yet"}
      </p>
      <p className="mt-1 text-sm text-zinc-600">
        {courseId
          ? "Open a course from your My Courses page to view its lessons."
          : "Enroll in a course first, then your lesson content will appear here."}
      </p>
      <div className="mt-4">
        <Button asChild variant="outline" className="rounded-xl border-zinc-200">
          <Link href="/dashboard/courses">Go to my courses</Link>
        </Button>
      </div>
    </div>
  ) : quizModuleId ? (
    quizStarted ? (
      <QuizTakingClient moduleId={quizModuleId} />
    ) : (
      <LessonQuizConfiguration moduleId={quizModuleId} />
    )
  ) : (
    <LessonContentView
      courseTitle={activeCourse.title}
      courseDescription={activeCourse.description}
      sectionTitle={currentLecture?.sectionTitle}
      sectionDescription={currentLecture?.sectionDescription}
      lesson={currentLecture}
      lessonNumber={currentLessonIndex >= 0 ? currentLessonIndex + 1 : 0}
      totalLessons={flattenedLectures.length}
      previousLesson={
        previousLecture
          ? { title: previousLecture.title, href: buildLessonHref(activeCourse.id, previousLecture.id) }
          : null
      }
      nextLesson={
        nextLecture ? { title: nextLecture.title, href: buildLessonHref(activeCourse.id, nextLecture.id) } : null
      }
    />
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <LessonPageHeader
          sidebarTrigger={
            <SheetTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-xl border-zinc-200 bg-white"
                aria-label="Open course outline"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          }
        />
        <div className="flex-1">
          <div className="flex">
            <div className="hidden lg:block">
              <LessonSidebar
                courseTitle={activeCourse?.title}
                sections={sidebarSections}
                totalLessons={flattenedLectures.length}
                currentLessonIndex={currentLessonIndex}
              />
            </div>

            <SheetContent side="left" className="p-0" showClose>
              <LessonSidebar
                courseTitle={activeCourse?.title}
                sections={sidebarSections}
                totalLessons={flattenedLectures.length}
                currentLessonIndex={currentLessonIndex}
                variant="sheet"
                onNavigate={() => setOpen(false)}
              />
            </SheetContent>

            <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6">
              <div
                className={`mx-auto w-full ${
                  quizStarted && isStudyMode ? "max-w-[1100px]" : "max-w-5xl"
                }`}
              >
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
