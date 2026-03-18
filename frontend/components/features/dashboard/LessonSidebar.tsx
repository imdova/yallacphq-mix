"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronRight, HelpCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LessonSidebarLesson = {
  id: string;
  title: string;
  href: string;
  current: boolean;
};

type LessonSidebarQuiz = {
  id: string;
  title: string;
};

type LessonSidebarSection = {
  id: string;
  title: string;
  description?: string;
  current: boolean;
  lessons: LessonSidebarLesson[];
  quizzes: LessonSidebarQuiz[];
};

export function LessonSidebar({
  courseTitle,
  sections,
  totalLessons,
  currentLessonIndex,
  variant = "sidebar",
  onNavigate,
}: {
  courseTitle?: string;
  sections: LessonSidebarSection[];
  totalLessons: number;
  currentLessonIndex: number;
  variant?: "sidebar" | "sheet";
  onNavigate?: () => void;
}) {
  const searchParams = useSearchParams();
  const quizParam = searchParams.get("quiz");
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!sections.length) {
      setExpanded({});
      return;
    }

    setExpanded((prev) => {
      const next: Record<string, boolean> = {};
      sections.forEach((section, index) => {
        next[section.id] = prev[section.id] ?? (section.current || index === 0);
      });
      return next;
    });
  }, [sections]);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const lessonPosition = totalLessons > 0 && currentLessonIndex >= 0 ? currentLessonIndex + 1 : 0;
  const progressPercent =
    totalLessons > 0 && lessonPosition > 0 ? Math.max(6, Math.round((lessonPosition / totalLessons) * 100)) : 0;

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col bg-white",
        variant === "sidebar" ? "w-72 border-r border-zinc-200" : "w-full"
      )}
    >
      <div className={cn("border-b border-zinc-200", variant === "sidebar" ? "p-4" : "p-5")}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Course outline</h3>
          <span className="text-xs font-semibold text-zinc-600">
            {totalLessons > 0 ? `${progressPercent}%` : "Empty"}
          </span>
        </div>
        {courseTitle ? (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{courseTitle}</p>
        ) : null}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="mt-2 text-sm text-zinc-600">
          {totalLessons > 0 ? `Viewing lesson ${lessonPosition} of ${totalLessons}` : "No lessons added yet"}
        </p>
      </div>
      <nav className={cn("flex-1 overflow-auto", variant === "sidebar" ? "p-2" : "p-3")} aria-label="Course modules">
        {sections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
            No curriculum sections have been added to this course yet.
          </div>
        ) : (
          sections.map((section) => {
            const lectureCount = section.lessons.length;
            const quizCount = section.quizzes.length;
            const isQuizActive = Boolean(quizParam && section.current);

            return (
              <div key={section.id} className="py-1">
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  {expanded[section.id] ? (
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  ) : (
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-zinc-900">{section.title}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      {lectureCount} lessons{quizCount ? ` · ${quizCount} quizzes` : ""}
                    </span>
                  </div>
                </button>

                {expanded[section.id] ? (
                  <div className="ml-6 mt-1 space-y-0.5">
                    {section.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={lesson.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                          lesson.current
                            ? "bg-gold/15 font-medium text-zinc-900"
                            : "text-zinc-600 hover:bg-zinc-50"
                        )}
                        aria-current={lesson.current ? "page" : undefined}
                      >
                        <PlayCircle
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            lesson.current ? "text-gold" : "text-zinc-400"
                          )}
                        />
                        <span className="truncate">{lesson.title}</span>
                      </Link>
                    ))}

                    {section.quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className={cn(
                          "mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-500",
                          isQuizActive ? "bg-gold/10 text-zinc-800" : "bg-zinc-50/80"
                        )}
                      >
                        <HelpCircle className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        <span className="truncate">{quiz.title}</span>
                        <span className="ml-auto shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 ring-1 ring-zinc-200">
                          Quiz
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </nav>
      <div className="border-t border-zinc-200 p-3">
        <Button
          asChild
          variant="outline"
          className="w-full gap-2 border-zinc-300"
        >
          <Link href="/dashboard/courses">
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
        </Button>
      </div>
    </aside>
  );
}
