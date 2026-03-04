"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Lock, Trophy, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const modules = [
  {
    id: "m1",
    title: "Module 1: QM Principles",
    completed: true,
    expanded: false,
    lessons: [],
    quiz: { id: "q1", title: "Quiz", completed: true, locked: false },
  },
  {
    id: "m2",
    title: "Module 2: Quality Tools",
    completed: true,
    expanded: true,
    lessons: [
      { id: "l1", title: "Introduction to SPC", completed: true, current: false, locked: false },
      { id: "l2", title: "Pareto Chart Analysis", completed: false, current: true, locked: false },
      { id: "l3", title: "Control Chart Methods", completed: false, current: false, locked: true },
    ],
    quiz: { id: "q2", title: "Quiz", completed: false, locked: false },
  },
  {
    id: "m3",
    title: "Module 3: Info Mgmt",
    completed: false,
    expanded: false,
    lessons: [],
    quiz: { id: "q3", title: "Quiz", completed: false, locked: true },
  },
];

export function LessonSidebar({
  variant = "sidebar",
  onNavigate,
}: {
  variant?: "sidebar" | "sheet";
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    m1: false,
    m2: true,
    m3: false,
  });

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col bg-white",
        variant === "sidebar" ? "w-72 border-r border-zinc-200" : "w-full"
      )}
    >
      <div className={cn("border-b border-zinc-200", variant === "sidebar" ? "p-4" : "p-5")}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Course Progress</h3>
          <span className="text-xs font-semibold text-zinc-600">65%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full w-[65%] rounded-full bg-gold" />
        </div>
        <p className="mt-2 text-sm text-zinc-600">12/18 lessons completed</p>
      </div>
      <nav className={cn("flex-1 overflow-auto", variant === "sidebar" ? "p-2" : "p-3")} aria-label="Course modules">
        {modules.map((mod) => (
          <div key={mod.id} className="py-1">
            <button
              type="button"
              onClick={() => toggle(mod.id)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {expanded[mod.id] ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
              )}
              {mod.completed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-zinc-300" />
              )}
              <span className="truncate">{mod.title}</span>
            </button>
            {expanded[mod.id] && (mod.lessons.length > 0 || mod.quiz) ? (
              <div className="ml-6 mt-1 space-y-0.5">
                {mod.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={lesson.locked ? "#" : "/dashboard/courses/lesson"}
                    onClick={lesson.locked ? undefined : onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                      lesson.current
                        ? "bg-gold/15 font-medium text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-50",
                      lesson.locked && "pointer-events-none opacity-60"
                    )}
                    aria-current={lesson.current ? "page" : undefined}
                  >
                    {lesson.locked ? (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    ) : lesson.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-gold" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </Link>
                ))}

                {mod.quiz ? (
                  <Link
                    href={mod.quiz.locked ? "#" : `/dashboard/quizzes?module=${encodeURIComponent(mod.id)}`}
                    onClick={mod.quiz.locked ? undefined : onNavigate}
                    className={cn(
                      "mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                      "text-zinc-600 hover:bg-zinc-50",
                      mod.quiz.locked && "pointer-events-none opacity-60"
                    )}
                  >
                    {mod.quiz.locked ? (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    ) : mod.quiz.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    )}
                    <span className="truncate">{mod.quiz.title}</span>
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </nav>
      <div className="border-t border-zinc-200 p-3">
        <Button
          asChild
          variant="outline"
          className="w-full gap-2 border-zinc-300"
        >
          <Link href="#">
            <Trophy className="h-4 w-4" />
            Download Syllabus
          </Link>
        </Button>
      </div>
    </aside>
  );
}
