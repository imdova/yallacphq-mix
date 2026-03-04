"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type QuizOption = {
  id: string;
  text: string;
};

type QuizQuestion = {
  id: string;
  prompt: React.ReactNode;
  options: QuizOption[];
  correctOptionId: string;
};

const QUIZ_BANK: Record<
  string,
  {
    title: string;
    question: QuizQuestion;
  }
> = {
  m1: {
    title: "QM Principles",
    question: {
      id: "q1",
      prompt: (
        <>
          What does{" "}
          <span className="rounded bg-black/35 px-1 font-mono text-white/95">this</span>{" "}
          refer to when used in an object method?
        </>
      ),
      options: [
        { id: "a", text: "The global object [object Window]" },
        { id: "b", text: "The object that the method belongs to." },
      ],
      correctOptionId: "b",
    },
  },
  m2: {
    title: "Quality Tools",
    question: {
      id: "q2",
      prompt: (
        <>
          In Pareto analysis, what is the main goal of the chart?
        </>
      ),
      options: [
        { id: "a", text: "Show trends over time for a single metric." },
        { id: "b", text: "Identify the few causes that create most of the impact." },
      ],
      correctOptionId: "b",
    },
  },
  m3: {
    title: "Info Mgmt",
    question: {
      id: "q3",
      prompt: <>Which statement best describes data integrity?</>,
      options: [
        { id: "a", text: "Data is available from any device at any time." },
        { id: "b", text: "Data is accurate, complete, and protected from unauthorized changes." },
      ],
      correctOptionId: "b",
    },
  },
};

export function QuizTakingClient() {
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("module") || "m2";
  const moduleQuiz = QUIZ_BANK[moduleId] ?? QUIZ_BANK.m2;

  const [selected, setSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelected(null);
  }, [moduleId]);

  const q = moduleQuiz.question;

  return (
    <div className="min-h-[calc(100vh-2rem)] rounded-2xl bg-[#2b3444] px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl bg-[#334055] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Exercise: {moduleQuiz.title}
            </h1>
            <p className="mt-3 text-sm font-medium text-white/85 md:text-base">{q.prompt}</p>
          </div>

          <div className="mt-8 space-y-3">
            {q.options.map((opt) => {
              const active = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelected(opt.id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left transition",
                    "bg-[#3d4a62] ring-1 ring-white/10 hover:bg-[#44526c]",
                    active && "bg-[#465572] ring-white/25"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-white/35",
                      active ? "bg-white/95" : "bg-transparent"
                    )}
                    aria-hidden
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", active ? "bg-[#2b3444]" : "bg-transparent")} />
                  </span>
                  <span className="text-sm font-medium text-white/90 md:text-base">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

