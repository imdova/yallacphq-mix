"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminStoredQuiz, DraftQuestion } from "@/types/quiz";

type QuizQuestionOrder = "regular" | "random";
type QuizPracticeMode = "quiz" | "test" | "study";
type QuestionAnswer = string | string[] | boolean;

type QuizReviewItem = {
  id: string;
  index: number;
  prompt: string;
  yourSelection: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  rationale?: string;
};

type QuizAttemptReport = {
  title: string;
  timeTakenSeconds: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracyPercent: number;
  passingScorePercent: number;
  passed: boolean;
  questions: QuizReviewItem[];
};

function shuffle<T>(items: T[]): T[] {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex]!, clone[index]!];
  }
  return clone;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function formatMmSs(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.max(0, totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function questionTypeLabel(question: DraftQuestion) {
  switch (question.questionType) {
    case "multiple-select":
      return "Multiple Select";
    case "true-false":
      return "True / False";
    case "short-answer":
      return "Short Answer";
    case "multiple-choice":
    default:
      return "Multiple Choice";
  }
}

function isAnswered(question: DraftQuestion, answer: QuestionAnswer | undefined) {
  switch (question.questionType) {
    case "multiple-select":
      return Array.isArray(answer) && answer.length > 0;
    case "true-false":
      return typeof answer === "boolean";
    case "short-answer":
      return typeof answer === "string" && answer.trim().length > 0;
    case "multiple-choice":
    default:
      return typeof answer === "string" && answer.trim().length > 0;
  }
}

function evaluateQuestion(question: DraftQuestion, answer: QuestionAnswer | undefined) {
  switch (question.questionType) {
    case "multiple-select": {
      const selectedIds = Array.isArray(answer) ? answer : [];
      const selectedOptions = question.options
        .filter((option) => selectedIds.includes(option.id))
        .map((option) => option.text);
      const correctOptions = question.options
        .filter((option) => question.correctOptionIds.includes(option.id))
        .map((option) => option.text);
      const selectedSet = new Set(selectedIds);
      const correctSet = new Set(question.correctOptionIds);
      const isCorrect =
        selectedSet.size === correctSet.size &&
        question.correctOptionIds.every((id) => selectedSet.has(id));
      return {
        isCorrect,
        yourSelection: selectedOptions.length ? selectedOptions.join(", ") : null,
        correctAnswer: correctOptions.join(", ") || "—",
      };
    }
    case "true-false": {
      const selected = typeof answer === "boolean" ? answer : null;
      return {
        isCorrect: selected === question.correctBoolean,
        yourSelection: selected == null ? null : selected ? "True" : "False",
        correctAnswer: question.correctBoolean ? "True" : "False",
      };
    }
    case "short-answer": {
      const selected = typeof answer === "string" ? answer.trim() : "";
      const normalized = normalizeText(selected);
      const acceptableAnswers = question.acceptableAnswers.map(normalizeText);
      return {
        isCorrect: Boolean(selected) && acceptableAnswers.includes(normalized),
        yourSelection: selected || null,
        correctAnswer: question.acceptableAnswers.join(", "),
      };
    }
    case "multiple-choice":
    default: {
      const selectedId = typeof answer === "string" ? answer : "";
      const yourSelection =
        question.options.find((option) => option.id === selectedId)?.text ?? null;
      const correctAnswer =
        question.options.find((option) => option.id === question.correctOptionId)?.text ?? "—";
      return {
        isCorrect: selectedId === question.correctOptionId,
        yourSelection,
        correctAnswer,
      };
    }
  }
}

function QuizPerformanceReport({
  attempt,
  onRetake,
}: {
  attempt: QuizAttemptReport;
  onRetake: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-zinc-950 to-zinc-900 p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-gold">QUIZ REPORT</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              {attempt.title}
            </h1>
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-white/55">TIME</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatMmSs(attempt.timeTakenSeconds)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-white/55">SCORE</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {attempt.correctCount} / {attempt.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-white/55">ACCURACY</p>
                <p className="mt-1 text-sm font-semibold text-white">{attempt.accuracyPercent}%</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-white/55">STATUS</p>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    attempt.passed ? "text-emerald-300" : "text-rose-300"
                  )}
                >
                  {attempt.passed ? "Passed" : "Needs Review"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-black/20 px-6 py-5 text-center ring-1 ring-white/10">
            <p className="text-[11px] font-semibold tracking-wider text-white/55">PASS MARK</p>
            <p className="mt-1 text-3xl font-semibold text-gold">
              {attempt.passingScorePercent}%
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {attempt.questions.map((question) => (
          <div key={question.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-zinc-500">
                  QUESTION {String(question.index).padStart(2, "0")}
                </p>
                <p className="mt-3 text-sm font-semibold text-zinc-900">{question.prompt}</p>
              </div>
              {question.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-rose-500" aria-hidden />
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[10px] font-semibold tracking-wider text-zinc-500">
                  YOUR ANSWER
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {question.yourSelection ?? "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[10px] font-semibold tracking-wider text-amber-700">
                  CORRECT ANSWER
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {question.correctAnswer}
                </p>
              </div>
            </div>

            {question.rationale ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[10px] font-semibold tracking-wider text-zinc-500">
                  RATIONALE
                </p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                  {question.rationale}
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onRetake}
          className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}

export function CourseQuizPlayer({
  quiz,
  order,
  mode,
}: {
  quiz: AdminStoredQuiz;
  order: QuizQuestionOrder;
  mode: QuizPracticeMode;
}) {
  const questions = React.useMemo(() => {
    const items = [...(quiz.questionBank ?? [])];
    return order === "random" ? shuffle(items) : items;
  }, [order, quiz.questionBank]);

  const totalQuestions = questions.length;
  const durationSeconds = Math.max(60, (quiz.meta?.durationMinutes ?? 15) * 60);
  const passingScorePercent = quiz.meta?.passingScorePercent ?? 60;

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, QuestionAnswer>>({});
  const [view, setView] = React.useState<"quiz" | "report">("quiz");
  const [secondsLeft, setSecondsLeft] = React.useState(durationSeconds);
  const [attempt, setAttempt] = React.useState<QuizAttemptReport | null>(null);

  React.useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setView("quiz");
    setAttempt(null);
    setSecondsLeft(durationSeconds);
  }, [durationSeconds, order, mode, quiz.id]);

  const finish = React.useCallback(() => {
    const reviewItems: QuizReviewItem[] = questions.map((question, index) => {
      const evaluation = evaluateQuestion(question, answers[question.id]);
      return {
        id: question.id,
        index: index + 1,
        prompt: question.prompt,
        yourSelection: evaluation.yourSelection,
        correctAnswer: evaluation.correctAnswer,
        isCorrect: evaluation.isCorrect,
        rationale: question.rationale,
      };
    });

    const correctCount = reviewItems.filter((item) => item.isCorrect).length;
    const total = reviewItems.length;
    const accuracyPercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const report: QuizAttemptReport = {
      title: quiz.title,
      timeTakenSeconds: Math.max(0, durationSeconds - secondsLeft),
      totalQuestions: total,
      correctCount,
      incorrectCount: Math.max(0, total - correctCount),
      accuracyPercent,
      passingScorePercent,
      passed: accuracyPercent >= passingScorePercent,
      questions: reviewItems,
    };
    setAttempt(report);
    setView("report");
  }, [answers, durationSeconds, passingScorePercent, questions, quiz.title, secondsLeft]);

  React.useEffect(() => {
    if (view !== "quiz") return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [view]);

  React.useEffect(() => {
    if (view === "quiz" && secondsLeft === 0 && totalQuestions > 0) {
      finish();
    }
  }, [finish, secondsLeft, totalQuestions, view]);

  const currentQuestion = questions[currentIndex] ?? null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLast = currentIndex >= totalQuestions - 1;
  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  if (!totalQuestions) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
        This quiz does not have any questions yet.
      </div>
    );
  }

  if (view === "report" && attempt) {
    return <QuizPerformanceReport attempt={attempt} onRetake={() => {
      setCurrentIndex(0);
      setAnswers({});
      setAttempt(null);
      setView("quiz");
      setSecondsLeft(durationSeconds);
    }} />;
  }

  const immediateFeedback =
    mode === "study" && currentQuestion ? evaluateQuestion(currentQuestion, currentAnswer) : null;

  return (
    <div className="rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-950 to-black p-4 text-white shadow-[0_40px_120px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:p-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/55">
              QUESTION {Math.min(totalQuestions, currentIndex + 1)} OF {totalQuestions}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gold" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="rounded-full border-2 border-gold px-4 py-2 text-xs font-semibold text-gold">
            {formatMmSs(secondsLeft)}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
            {questionTypeLabel(currentQuestion!)}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
            {currentQuestion?.points ?? 1} {currentQuestion?.points === 1 ? "point" : "points"}
          </span>
        </div>

        <h2 className="mt-4 text-lg font-semibold leading-snug text-white md:text-xl">
          {currentQuestion?.prompt}
        </h2>

        <div className="mt-5 space-y-3">
          {currentQuestion?.questionType === "multiple-choice" &&
            currentQuestion.options.map((option, index) => {
              const active = currentAnswer === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }))
                  }
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition",
                    active
                      ? "border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(215,175,62,0.35)]"
                      : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
                      active ? "bg-gold text-zinc-950" : "bg-white/5 text-white/75"
                    )}
                  >
                    {option.label || String.fromCharCode(65 + index)}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-white/90">
                    {option.text}
                  </span>
                  {active ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-zinc-950">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                  ) : null}
                </button>
              );
            })}

          {currentQuestion?.questionType === "multiple-select" &&
            currentQuestion.options.map((option, index) => {
              const selectedIds = Array.isArray(currentAnswer) ? currentAnswer : [];
              const active = selectedIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => {
                      const current = Array.isArray(prev[currentQuestion.id])
                        ? (prev[currentQuestion.id] as string[])
                        : [];
                      const next = current.includes(option.id)
                        ? current.filter((id) => id !== option.id)
                        : [...current, option.id];
                      return { ...prev, [currentQuestion.id]: next };
                    })
                  }
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition",
                    active
                      ? "border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(215,175,62,0.35)]"
                      : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
                      active ? "bg-gold text-zinc-950" : "bg-white/5 text-white/75"
                    )}
                  >
                    {option.label || String.fromCharCode(65 + index)}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-white/90">
                    {option.text}
                  </span>
                  {active ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-zinc-950">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                  ) : null}
                </button>
              );
            })}

          {currentQuestion?.questionType === "true-false" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "True", value: true },
                { label: "False", value: false },
              ].map((option) => {
                const active = currentAnswer === option.value;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.value }))
                    }
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition",
                      active
                        ? "border-gold bg-gold/10 text-white"
                        : "border-white/10 bg-black/20 text-white/80 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion?.questionType === "short-answer" && (
            <textarea
              value={typeof currentAnswer === "string" ? currentAnswer : ""}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: event.target.value }))
              }
              placeholder="Type your answer here…"
              className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold/40"
            />
          )}
        </div>

        {mode === "study" && immediateFeedback && isAnswered(currentQuestion!, currentAnswer) ? (
          <div
            className={cn(
              "mt-5 rounded-2xl border px-4 py-3 text-sm",
              immediateFeedback.isCorrect
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : "border-rose-400/30 bg-rose-500/10 text-rose-100"
            )}
          >
            <p className="font-semibold">
              {immediateFeedback.isCorrect ? "Correct answer" : "Check this answer"}
            </p>
            <p className="mt-1">
              Correct answer: <span className="font-semibold">{immediateFeedback.correctAnswer}</span>
            </p>
            {currentQuestion?.rationale ? (
              <p className="mt-2 text-xs text-white/80">{currentQuestion.rationale}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          disabled={currentIndex === 0}
          className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Previous
        </Button>

        <Button
          type="button"
          onClick={() => {
            if (isLast) finish();
            else setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1));
          }}
          className="rounded-2xl bg-gold text-zinc-950 hover:bg-gold/90"
        >
          {isLast ? "Finish Quiz" : "Next Question"}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
