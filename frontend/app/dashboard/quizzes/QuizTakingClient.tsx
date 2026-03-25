"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Flag,
  HelpCircle,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

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

export const QUIZ_BANK: Record<
  string,
  {
    title: string;
    question: QuizQuestion;
    passingScorePercent?: number;
  }
> = {
  m1: {
    title: "QM Principles",
    passingScorePercent: 60,
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
    passingScorePercent: 60,
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
    passingScorePercent: 60,
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

type QuizQuestionOrder = "regular" | "random";
type QuizPracticeMode = "quiz" | "test" | "study";

const STUDY_QUESTIONS_BANK: Partial<Record<string, QuizQuestion[]>> = {
  m2: [
    {
      id: "m2-s1",
      prompt: <>What is the main purpose of a Pareto chart?</>,
      options: [
        { id: "a", text: "Show correlations between two variables." },
        { id: "b", text: "Identify the vital few causes contributing most to an effect." },
        { id: "c", text: "Track process performance over time with control limits." },
        { id: "d", text: "Map a process from start to finish." },
      ],
      correctOptionId: "b",
    },
    {
      id: "m2-s2",
      prompt: <>Which tool is best for monitoring variation over time and detecting special causes?</>,
      options: [
        { id: "a", text: "Control chart" },
        { id: "b", text: "Histogram" },
        { id: "c", text: "Fishbone (Ishikawa) diagram" },
        { id: "d", text: "Affinity diagram" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-s3",
      prompt: <>What does a scatter diagram help you determine?</>,
      options: [
        { id: "a", text: "Whether two variables may be related." },
        { id: "b", text: "Which step in a process has the most waste." },
        { id: "c", text: "How many defects occurred per shift." },
        { id: "d", text: "How to group ideas into themes." },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-s4",
      prompt: (
        <>
          Which quality improvement tool is most effective for identifying the root cause of a specific problem by
          visually mapping out all potential contributing factors?
        </>
      ),
      options: [
        { id: "a", text: "Pareto Chart" },
        { id: "b", text: "Ishikawa (Fishbone) Diagram" },
        { id: "c", text: "Scatter Diagram" },
        { id: "d", text: "Control Chart" },
      ],
      correctOptionId: "b",
    },
    {
      id: "m2-s5",
      prompt: <>Which tool is used to map the steps in a process to understand flow and handoffs?</>,
      options: [
        { id: "a", text: "Flowchart" },
        { id: "b", text: "Run chart" },
        { id: "c", text: "Histogram" },
        { id: "d", text: "Check sheet" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-s6",
      prompt: <>A histogram is primarily used to visualize:</>,
      options: [
        { id: "a", text: "The relationship between two variables." },
        { id: "b", text: "The distribution of a set of data." },
        { id: "c", text: "The sequence of events in a process." },
        { id: "d", text: "The top causes contributing to defects." },
      ],
      correctOptionId: "b",
    },
    {
      id: "m2-s7",
      prompt: <>Which tool is best for simple data collection at the point of activity?</>,
      options: [
        { id: "a", text: "Check sheet" },
        { id: "b", text: "SIPOC" },
        { id: "c", text: "Affinity diagram" },
        { id: "d", text: "Control chart" },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-s8",
      prompt: <>A run chart helps you identify:</>,
      options: [
        { id: "a", text: "Trends and shifts over time." },
        { id: "b", text: "Root causes across categories." },
        { id: "c", text: "Correlation between variables." },
        { id: "d", text: "The most common defect types." },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-s9",
      prompt: <>What technique repeatedly asks “Why?” to drill down to a root cause?</>,
      options: [
        { id: "a", text: "PDSA cycle" },
        { id: "b", text: "5 Whys" },
        { id: "c", text: "Stratification" },
        { id: "d", text: "Benchmarking" },
      ],
      correctOptionId: "b",
    },
    {
      id: "m2-s10",
      prompt: <>SIPOC is most useful when you need to:</>,
      options: [
        { id: "a", text: "Compare performance to external organizations." },
        { id: "b", text: "Create a high-level view of a process and its stakeholders." },
        { id: "c", text: "Display data distribution." },
        { id: "d", text: "Identify special-cause variation." },
      ],
      correctOptionId: "b",
    },
    {
      id: "m2-s11",
      prompt: <>Failure Mode and Effects Analysis (FMEA) is used to:</>,
      options: [
        { id: "a", text: "Prioritize risks by severity, occurrence, and detection." },
        { id: "b", text: "Sort bars in descending order to show vital few causes." },
        { id: "c", text: "Measure correlation between two variables." },
        { id: "d", text: "Display variation around the mean." },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-s12",
      prompt: <>An affinity diagram helps teams:</>,
      options: [
        { id: "a", text: "Organize large numbers of ideas into related groups." },
        { id: "b", text: "Determine whether a process is stable." },
        { id: "c", text: "Track a metric over time with a line." },
        { id: "d", text: "Identify root causes with categories like People/Process/Equipment." },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-s13",
      prompt: <>Benchmarking refers to:</>,
      options: [
        { id: "a", text: "Testing a change on a small scale and learning from results." },
        { id: "b", text: "Comparing performance with best-in-class or peers to identify gaps." },
        { id: "c", text: "Collecting defects using tally marks." },
        { id: "d", text: "Arranging bars in descending order with a cumulative line." },
      ],
      correctOptionId: "b",
    },
    {
      id: "m2-s14",
      prompt: <>Stratification is used to:</>,
      options: [
        { id: "a", text: "Separate data into categories to reveal patterns." },
        { id: "b", text: "Map steps of a process with swimlanes." },
        { id: "c", text: "Show correlation between variables." },
        { id: "d", text: "Display a distribution of values." },
      ],
      correctOptionId: "a",
    },
    {
      id: "m2-s15",
      prompt: <>The PDSA cycle stands for:</>,
      options: [
        { id: "a", text: "Plan–Do–Study–Act" },
        { id: "b", text: "Prepare–Design–Solve–Analyze" },
        { id: "c", text: "Predict–Develop–Scale–Assess" },
        { id: "d", text: "Process–Data–System–Action" },
      ],
      correctOptionId: "a",
    },
  ],
};

function formatMmSs(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

function getStudyQuestions(moduleId: string, fallback: QuizQuestion): QuizQuestion[] {
  const bank = STUDY_QUESTIONS_BANK[moduleId];
  if (bank && bank.length > 0) return bank;

  return Array.from({ length: 15 }, (_, i) => ({
    ...fallback,
    id: `${fallback.id}-${i + 1}`,
    prompt: fallback.prompt,
  }));
}

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const DEFAULT_PASSING_SCORE_PERCENT = 60;
const QUIZ_DURATION_SECONDS = 15 * 60;

const DOMAINS = ["Quality Leadership", "Information Management", "Patient Safety"] as const;
type QuizDomain = (typeof DOMAINS)[number];

function domainForIndex(index: number): QuizDomain {
  if (index < 5) return "Quality Leadership";
  if (index < 10) return "Information Management";
  return "Patient Safety";
}

type QuizReviewItem = {
  id: string;
  index: number;
  prompt: React.ReactNode;
  yourSelection: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  domain: QuizDomain;
  rationale: string;
};

type QuizAttemptReport = {
  moduleId: string;
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

function AccuracyRing({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - p / 100);

  return (
    <div className="relative h-28 w-28">
      <svg className="h-full w-full" viewBox="0 0 120 120" role="img" aria-label={`${p}% accuracy`}>
        <circle cx="60" cy="60" r={r} fill="transparent" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="transparent"
          stroke="rgb(215 175 62)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-semibold tracking-tight text-white">{p}%</div>
        <div className="text-[11px] font-semibold tracking-wider text-white/60">ACCURACY</div>
      </div>
    </div>
  );
}

function QuizPerformanceReport({
  attempt,
  onRetake,
}: {
  attempt: QuizAttemptReport;
  onRetake: () => void;
}) {
  const [filter, setFilter] = React.useState<"all" | "correct" | "incorrect">("all");

  const filtered = React.useMemo(() => {
    if (filter === "correct") return attempt.questions.filter((q) => q.isCorrect);
    if (filter === "incorrect") return attempt.questions.filter((q) => !q.isCorrect);
    return attempt.questions;
  }, [attempt.questions, filter]);

  const domainStats = React.useMemo(() => {
    return DOMAINS.map((domain) => {
      const items = attempt.questions.filter((q) => q.domain === domain);
      const correct = items.filter((q) => q.isCorrect).length;
      const percent = items.length > 0 ? Math.round((correct / items.length) * 100) : 0;
      return { domain, percent };
    });
  }, [attempt.questions]);

  const weakest = React.useMemo(() => {
    return domainStats.reduce((min, cur) => (cur.percent < min.percent ? cur : min), domainStats[0]);
  }, [domainStats]);

  return (
    <div className="min-h-[calc(100vh-2rem)] rounded-3xl bg-zinc-50 p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-zinc-950 to-zinc-900 p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Performance Report</h1>
              <p className="mt-1 text-sm text-white/65">CPHQ Practice Quiz: Comprehensive Analysis</p>
              <p className="mt-3 text-sm font-medium text-white/80">{attempt.title}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-white/55">TIME TAKEN</p>
                  <p className="mt-1 text-sm font-semibold text-gold">{formatMmSs(attempt.timeTakenSeconds)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-white/55">TOTAL SCORE</p>
                  <p className="mt-1 text-sm font-semibold text-gold">
                    {attempt.correctCount} / {attempt.totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-white/55">STATUS</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        attempt.passed ? "bg-emerald-400" : "bg-rose-400"
                      )}
                      aria-hidden
                    />
                    <span className={attempt.passed ? "text-emerald-200" : "text-rose-200"}>
                      {attempt.passed ? "Passed" : "Needs review"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-end">
              <div className="rounded-3xl bg-black/20 p-4 ring-1 ring-white/10">
                <AccuracyRing percent={attempt.accuracyPercent} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gold" aria-hidden />
            <h2 className="text-sm font-semibold text-zinc-900">Detailed Review</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("correct")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                filter === "correct"
                  ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
                  : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
              )}
            >
              {attempt.correctCount} Correct
            </button>
            <button
              type="button"
              onClick={() => setFilter("incorrect")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                filter === "incorrect"
                  ? "bg-rose-100 text-rose-800 ring-rose-200"
                  : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
              )}
            >
              {attempt.incorrectCount} Incorrect
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                filter === "all"
                  ? "bg-zinc-900 text-white ring-zinc-900"
                  : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
              )}
            >
              All
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {filtered.map((q) => (
              <div key={q.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-wider text-zinc-500">
                      QUESTION {String(q.index).padStart(2, "0")} ·{" "}
                      <span className={q.isCorrect ? "text-emerald-600" : "text-rose-600"}>
                        {q.isCorrect ? "CORRECT" : "INCORRECT"}
                      </span>
                    </p>
                    <div className="mt-3 text-sm font-semibold text-zinc-900">{q.prompt}</div>
                  </div>
                  <div className="mt-1 shrink-0">
                    {q.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500" aria-hidden />
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-[10px] font-semibold tracking-wider text-rose-500">YOUR SELECTION</p>
                    <p className="mt-2 text-sm font-semibold text-zinc-900">{q.yourSelection ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-[10px] font-semibold tracking-wider text-amber-700">CORRECT ANSWER</p>
                    <p className="mt-2 text-sm font-semibold text-zinc-900">{q.correctAnswer}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-zinc-500">
                    <Sparkles className="h-4 w-4 text-gold" aria-hidden />
                    SMART RATIONALE
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-600">{q.rationale}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-semibold tracking-wider text-zinc-500">DOMAIN PERFORMANCE</h3>
              <div className="mt-4 space-y-4">
                {domainStats.map((d) => (
                  <div key={d.domain}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-zinc-900">{d.domain}</p>
                      <p className="text-sm font-semibold text-zinc-700">{d.percent}%</p>
                    </div>
                    {d.percent < attempt.passingScorePercent ? (
                      <p className="mt-1 text-[11px] font-semibold tracking-wider text-rose-500">
                        + FOCUS REQUIRED
                      </p>
                    ) : null}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${d.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs text-zinc-600">
                  Based on your results, prioritize{" "}
                  <span className="font-semibold text-zinc-900">{weakest.domain}</span> modules.
                </p>
                <button
                  type="button"
                  className="mt-3 w-full rounded-2xl border border-gold/40 bg-white px-4 py-2.5 text-xs font-semibold tracking-wider text-zinc-900 hover:bg-zinc-50"
                >
                  TARGETED STUDY PLAN
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-b from-zinc-950 to-zinc-900 p-5 text-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
              <p className="text-[11px] font-semibold tracking-wider text-gold">GOLD MEMBER</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">Master the CPHQ Exam</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Unlock the complete 1,500+ question bank and predictive mock exams.
              </p>
              <button
                type="button"
                className="mt-4 w-full rounded-2xl bg-gold px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-gold/90"
              >
                UPGRADE NOW
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function StudyModeQuizPlayer({
  moduleId,
  moduleQuiz,
  order,
  mode,
}: {
  moduleId: string;
  moduleQuiz: { title: string; question: QuizQuestion; passingScorePercent?: number };
  order: QuizQuestionOrder;
  mode: QuizPracticeMode;
}) {
  const questions = React.useMemo(() => {
    const base = getStudyQuestions(moduleId, moduleQuiz.question);
    return order === "random" ? shuffle(base) : base;
  }, [moduleId, moduleQuiz.question, order]);

  const total = questions.length;
  const passingScorePercent = moduleQuiz.passingScorePercent ?? DEFAULT_PASSING_SCORE_PERCENT;

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [flagged, setFlagged] = React.useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = React.useState(QUIZ_DURATION_SECONDS);
  const [view, setView] = React.useState<"quiz" | "report">("quiz");
  const [attempt, setAttempt] = React.useState<QuizAttemptReport | null>(null);

  React.useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setFlagged({});
    setSecondsLeft(QUIZ_DURATION_SECONDS);
    setView("quiz");
    setAttempt(null);
  }, [moduleId, order, mode]);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const q = questions[currentIndex] ?? questions[0];
  const selected = q ? answers[q.id] ?? null : null;
  const isFlagged = q ? Boolean(flagged[q.id]) : false;

  const completedCount = questions.reduce((acc, item, idx) => {
    if (idx === currentIndex) return acc;
    return answers[item.id] ? acc + 1 : acc;
  }, 0);
  const remainingCount = Math.max(0, total - completedCount - 1);

  const progressPct = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  const letters = ["A", "B", "C", "D"];

  const isLast = currentIndex >= total - 1;
  const showRightPanel = mode === "study";
  const navigatorInteractive = showRightPanel;
  const navigatorShowNumbers = showRightPanel;

  const finish = () => {
    const timeTakenSeconds = Math.max(0, QUIZ_DURATION_SECONDS - secondsLeft);
    const questionsForReport: QuizReviewItem[] = questions.map((question, idx) => {
      const selectedId = answers[question.id] ?? null;
      const yourSelection =
        selectedId ? question.options.find((o) => o.id === selectedId)?.text ?? null : null;
      const correctAnswer =
        question.options.find((o) => o.id === question.correctOptionId)?.text ?? "—";
      const isCorrect = selectedId === question.correctOptionId;
      const domain = domainForIndex(idx);
      const rationale = isCorrect
        ? "Correct. This choice best matches the tool’s primary purpose in quality improvement."
        : "Review the definition and typical use-case of each tool. The correct option is the one that directly addresses the question’s objective.";

      return {
        id: question.id,
        index: idx + 1,
        prompt: question.prompt,
        yourSelection,
        correctAnswer,
        isCorrect,
        domain,
        rationale,
      };
    });

    const correctCount = questionsForReport.filter((q) => q.isCorrect).length;
    const totalQuestions = questionsForReport.length;
    const accuracyPercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = accuracyPercent >= passingScorePercent;

    const report: QuizAttemptReport = {
      moduleId,
      title: moduleQuiz.title,
      timeTakenSeconds,
      totalQuestions,
      correctCount,
      incorrectCount: Math.max(0, totalQuestions - correctCount),
      accuracyPercent,
      passingScorePercent,
      passed,
      questions: questionsForReport,
    };

    setAttempt(report);
    setView("report");
  };

  const retake = () => {
    setCurrentIndex(0);
    setAnswers({});
    setFlagged({});
    setSecondsLeft(QUIZ_DURATION_SECONDS);
    setAttempt(null);
    setView("quiz");
  };

  if (view === "report" && attempt) {
    return <QuizPerformanceReport attempt={attempt} onRetake={retake} />;
  }

  return (
    <div className="min-h-[calc(80vh-2rem)] rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-950 to-black p-3 text-white shadow-[0_40px_120px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:p-4">
      <div className={cn("grid gap-5", showRightPanel && "lg:grid-cols-[minmax(0,1fr)_256px]")}>
        {/* Left: question */}
        <section className="min-w-0">
          <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold tracking-[0.2em] text-white/55">
                QUESTION {Math.min(total, currentIndex + 1)} OF {total}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gold" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!q) return;
                  setFlagged((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                  isFlagged
                    ? "border-gold/60 bg-gold/10 text-gold"
                    : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
                )}
              >
                <Flag className="h-4 w-4" aria-hidden />
                Flag for Review
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gold text-[11px] font-semibold text-gold">
                {formatMmSs(secondsLeft)}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-5">
            <h2 className="text-lg font-semibold leading-snug text-white md:text-xl">
              {q?.prompt}
            </h2>

            <div className="mt-4 space-y-2.5">
              {(q?.options ?? []).map((opt, idx) => {
                const active = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (!q) return;
                      setAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                    }}
                    className={cn(
                      "group flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition",
                      active
                        ? "border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(215,175,62,0.35)]"
                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
                    )}
                    aria-pressed={active}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
                        active ? "bg-gold text-zinc-950" : "bg-white/5 text-white/75"
                      )}
                      aria-hidden
                    >
                      {letters[idx] ?? String(idx + 1)}
                    </span>

                    <span className="min-w-0 flex-1 text-sm font-medium text-white/90 md:text-base">
                      {opt.text}
                    </span>

                    {active ? (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-zinc-950">
                        <Check className="h-4 w-4" aria-hidden />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition",
                currentIndex === 0
                  ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              )}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Previous
            </button>

            <button
              type="button"
              onClick={() => {
                if (isLast) finish();
                else setCurrentIndex((i) => Math.min(total - 1, i + 1));
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition",
                isLast ? "bg-gold text-zinc-950 hover:bg-gold/90" : "bg-gold text-zinc-950 hover:bg-gold/90"
              )}
            >
              {isLast ? "Finish Quiz" : "Next Question"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </section>

        {/* Right: navigator + help */}
        {showRightPanel ? (
          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <h3 className="text-sm font-semibold text-white">Question Navigator</h3>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {questions.map((item, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isCompleted = !isCurrent && Boolean(answers[item.id]);

                  const baseClasses =
                    "relative flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition";
                  const stateClasses = isCurrent
                    ? "border-transparent bg-gold text-zinc-950"
                    : isCompleted
                      ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-200"
                      : "border-white/10 bg-white/5 text-white/70";
                  const hoverClasses = navigatorInteractive
                    ? isCompleted
                      ? "hover:bg-emerald-500/20"
                      : "hover:bg-white/10"
                    : "";

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={navigatorInteractive ? () => setCurrentIndex(idx) : undefined}
                      disabled={!navigatorInteractive}
                      className={cn(
                        baseClasses,
                        stateClasses,
                        hoverClasses,
                        !navigatorInteractive && "cursor-default"
                      )}
                      aria-current={isCurrent ? "page" : undefined}
                      aria-label={`Question ${idx + 1}`}
                    >
                      {navigatorShowNumbers ? idx + 1 : null}
                      {isCompleted ? (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                  <span className="font-semibold tracking-wider text-white/55">
                    COMPLETED ({completedCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gold" aria-hidden />
                  <span className="font-semibold tracking-wider text-white/55">CURRENT (1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white/30" aria-hidden />
                  <span className="font-semibold tracking-wider text-white/55">
                    REMAINING ({remainingCount})
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gold/20 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <HelpCircle className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gold">Need help?</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    Refer to Module 3: Management and Leadership in Quality Improvement for more on root cause analysis.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10"
              >
                View Resources
              </button>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export function QuizTakingClient({ moduleId: moduleIdProp }: { moduleId?: string } = {}) {
  const searchParams = useSearchParams();
  const moduleId = moduleIdProp ?? searchParams.get("module") ?? "m2";
  const moduleQuiz = QUIZ_BANK[moduleId] ?? QUIZ_BANK.m2;

  const modeParam = searchParams.get("mode");
  const mode: QuizPracticeMode =
    modeParam === "quiz" || modeParam === "test" || modeParam === "study"
      ? modeParam
      : "quiz";

  const orderParam = searchParams.get("order");
  const order: QuizQuestionOrder = orderParam === "regular" || orderParam === "random" ? orderParam : "random";

  return <StudyModeQuizPlayer moduleId={moduleId} moduleQuiz={moduleQuiz} order={order} mode={mode} />;
}

