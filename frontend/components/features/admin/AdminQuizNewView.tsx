"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormInput, FormSelect } from "@/components/shared/forms";
import { cn } from "@/lib/utils";
import type {
  DraftOption,
  DraftQuestion,
  MultipleChoiceDraftQuestion,
  MultipleSelectDraftQuestion,
  ShortAnswerDraftQuestion,
  TrueFalseDraftQuestion,
} from "@/types/quiz";
import { createQuiz, getAdminQuizById, updateQuiz } from "@/lib/dal/quizzes";
import { getErrorMessage } from "@/lib/api/error";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Info,
  Plus,
  Save,
  Upload,
  X,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "healthcare", label: "Healthcare Quality" },
  { value: "patient-safety", label: "Patient Safety" },
  { value: "leadership", label: "Leadership" },
  { value: "strategy", label: "Strategy" },
] as const;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
] as const;

const QUESTION_TYPE_OPTIONS = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "multiple-select", label: "Multiple Select" },
  { value: "true-false", label: "True / False" },
  { value: "short-answer", label: "Short Answer" },
] as const;

const quizCreateSchema = z.object({
  title: z.string().min(3, "Quiz title is required").max(160),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["draft", "active"]),
  durationMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute").max(240),
  passingScorePercent: z.coerce.number().int().min(0).max(100),
});

type QuizCreateValues = z.infer<typeof quizCreateSchema>;

function nextId(prefix = "q") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function letterForIndex(i: number) {
  return String.fromCharCode(65 + i);
}

function getCategoryModuleLabel(category: string) {
  return CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category;
}

function questionTypeLabel(type: DraftQuestion["questionType"]) {
  return QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

function createDefaultOptions() {
  const labels = ["A", "B", "C", "D"];
  return labels.map((label) => ({ id: nextId("opt"), label, text: "" })) satisfies DraftOption[];
}

function isOptionBasedQuestion(
  question: DraftQuestion
): question is MultipleChoiceDraftQuestion | MultipleSelectDraftQuestion {
  return (
    question.questionType === "multiple-choice" || question.questionType === "multiple-select"
  );
}

function cloneQuestion(question: DraftQuestion): DraftQuestion {
  switch (question.questionType) {
    case "multiple-select":
      return {
        ...question,
        options: question.options.map((option) => ({ ...option })),
        correctOptionIds: [...question.correctOptionIds],
      };
    case "true-false":
      return { ...question };
    case "short-answer":
      return {
        ...question,
        acceptableAnswers: [...question.acceptableAnswers],
      };
    case "multiple-choice":
    default:
      return {
        ...question,
        options: question.options.map((option) => ({ ...option })),
      };
  }
}

function createMultipleChoiceQuestion(): MultipleChoiceDraftQuestion {
  const options = createDefaultOptions();
  return {
    id: nextId("question"),
    questionType: "multiple-choice",
    prompt: "",
    options,
    correctOptionId: options[0]?.id ?? "",
    points: 1,
    rationale: "",
  };
}

function createMultipleSelectQuestion(): MultipleSelectDraftQuestion {
  const options = createDefaultOptions();
  return {
    id: nextId("question"),
    questionType: "multiple-select",
    prompt: "",
    options,
    correctOptionIds: options[0] ? [options[0].id] : [],
    points: 1,
    rationale: "",
  };
}

function createTrueFalseQuestion(): TrueFalseDraftQuestion {
  return {
    id: nextId("question"),
    questionType: "true-false",
    prompt: "",
    correctBoolean: true,
    points: 1,
    rationale: "",
  };
}

function createShortAnswerQuestion(): ShortAnswerDraftQuestion {
  return {
    id: nextId("question"),
    questionType: "short-answer",
    prompt: "",
    acceptableAnswers: [""],
    points: 1,
    rationale: "",
  };
}

function createModalQuestion(questionType: DraftQuestion["questionType"] = "multiple-choice"): DraftQuestion {
  switch (questionType) {
    case "multiple-select":
      return createMultipleSelectQuestion();
    case "true-false":
      return createTrueFalseQuestion();
    case "short-answer":
      return createShortAnswerQuestion();
    case "multiple-choice":
    default:
      return createMultipleChoiceQuestion();
  }
}

function convertQuestionType(
  question: DraftQuestion,
  questionType: DraftQuestion["questionType"]
): DraftQuestion {
  const base = {
    id: question.id,
    prompt: question.prompt,
    points: question.points,
    rationale: question.rationale,
  };

  if (questionType === "multiple-choice") {
    const options = isOptionBasedQuestion(question)
      ? question.options.map((option, index) => ({
          ...option,
          label: letterForIndex(index),
        }))
      : createDefaultOptions();
    const correctOptionId =
      question.questionType === "multiple-choice"
        ? question.correctOptionId
        : question.questionType === "multiple-select"
          ? question.correctOptionIds[0] ?? options[0]?.id ?? ""
          : options[0]?.id ?? "";
    return { ...base, questionType, options, correctOptionId };
  }

  if (questionType === "multiple-select") {
    const options = isOptionBasedQuestion(question)
      ? question.options.map((option, index) => ({
          ...option,
          label: letterForIndex(index),
        }))
      : createDefaultOptions();
    const correctOptionIds =
      question.questionType === "multiple-select"
        ? question.correctOptionIds
        : question.questionType === "multiple-choice"
          ? [question.correctOptionId]
          : options[0]
            ? [options[0].id]
            : [];
    return { ...base, questionType, options, correctOptionIds };
  }

  if (questionType === "true-false") {
    return {
      ...base,
      questionType,
      correctBoolean: question.questionType === "true-false" ? question.correctBoolean : true,
    };
  }

  return {
    ...base,
    questionType,
    acceptableAnswers:
      question.questionType === "short-answer"
        ? [...question.acceptableAnswers]
        : [""],
  };
}

function normalizeDraftQuestion(question: DraftQuestion): DraftQuestion {
  const base = {
    id: question.id,
    prompt: question.prompt.trim(),
    points: typeof question.points === "number" ? Math.max(1, question.points) : 1,
    rationale: (question.rationale ?? "").trim() || undefined,
  };

  switch (question.questionType) {
    case "multiple-select": {
      const options = question.options
        .map((option, index) => ({
          ...option,
          label: letterForIndex(index),
          text: option.text.trim(),
        }))
        .filter((option) => option.text);
      const optionIds = new Set(options.map((option) => option.id));
      const correctOptionIds = Array.from(
        new Set(question.correctOptionIds.filter((id) => optionIds.has(id)))
      );
      return {
        ...base,
        questionType: "multiple-select",
        options,
        correctOptionIds: correctOptionIds.length ? correctOptionIds : options[0] ? [options[0].id] : [],
      };
    }
    case "true-false":
      return {
        ...base,
        questionType: "true-false",
        correctBoolean: Boolean(question.correctBoolean),
      };
    case "short-answer": {
      const acceptableAnswers = Array.from(
        new Set(question.acceptableAnswers.map((answer) => answer.trim()).filter(Boolean))
      );
      return {
        ...base,
        questionType: "short-answer",
        acceptableAnswers,
      };
    }
    case "multiple-choice":
    default: {
      const options = question.options
        .map((option, index) => ({
          ...option,
          label: letterForIndex(index),
          text: option.text.trim(),
        }))
        .filter((option) => option.text);
      const correctOptionId = options.some((option) => option.id === question.correctOptionId)
        ? question.correctOptionId
        : options[0]?.id ?? "";
      return {
        ...base,
        questionType: "multiple-choice",
        options,
        correctOptionId,
      };
    }
  }
}

function normalizeImportedQuestion(
  q: {
    id?: string;
    prompt?: string;
    options?: DraftOption[];
    correctLetter?: string;
    correctOptionId?: string;
    points?: number;
    rationale?: string;
  }
): DraftQuestion | null {
  const prompt = (q.prompt ?? "").trim();
  if (!prompt) return null;
  const opts = (q.options ?? []).filter((o) => o.text.trim());
  if (opts.length < 2) return null;
  const labels = opts.map((_, i) => letterForIndex(i));
  const options: DraftOption[] = opts.map((o, i) => ({
    id: o.id || nextId("opt"),
    label: labels[i] ?? String(i + 1),
    text: o.text.trim(),
  }));
  let correctId = options[0]?.id ?? "";
  const correctLetter = q.correctLetter;
  if (correctLetter) {
    const L = correctLetter.toUpperCase();
    const found = options.find((o) => o.label === L);
    if (found) correctId = found.id;
  } else if (q.correctOptionId) {
    const found = options.find((o) => o.id === q.correctOptionId);
    if (found) correctId = found.id;
  }
  return {
    id: q.id || nextId("question"),
    questionType: "multiple-choice",
    prompt,
    options,
    correctOptionId: correctId,
    points: Math.max(1, Number(q.points) || 1),
    rationale: (q.rationale ?? "").trim() || undefined,
  };
}

function buildQuizPayload(
  data: QuizCreateValues,
  questions: DraftQuestion[],
  moduleName: string
) {
  return {
    title: data.title.trim(),
    module:
      moduleName && moduleName !== "—"
        ? moduleName
        : `Category · ${getCategoryModuleLabel(data.category)}`,
    category: data.category,
    status: data.status,
    meta: {
      durationMinutes: data.durationMinutes,
      passingScorePercent: data.passingScorePercent,
    },
    questionBank: questions.map(normalizeDraftQuestion),
  };
}

/** Tab-separated template (Excel-friendly). */
const IMPORT_TEMPLATE_TSV = `Question\tOptionA\tOptionB\tOptionC\tOptionD\tCorrect\tPoints
Which of the following maps the expected course of care?\tAlgorithm A\tAlgorithm B\tAlgorithm C\tAlgorithm D\tA\t2`;

function parseImportRows(rows: Array<Array<string | number | boolean | null | undefined>>): DraftQuestion[] {
  if (rows.length < 2) return [];
  const out: DraftQuestion[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i] ?? [];
    const parts = Array.from({ length: 7 }, (_, index) => String(cells[index] ?? "").trim());
    if (parts.every((part) => !part)) continue;
    const [question, a, b, c, d, correct, pts] = parts;
    const options: DraftOption[] = [a, b, c, d]
      .filter((t) => t)
      .map((text, idx) => ({ id: nextId("opt"), label: letterForIndex(idx), text }));
    if (options.length < 2) continue;
    const parsedQuestion = normalizeImportedQuestion({
      prompt: question,
      options,
      correctLetter: correct,
      points: Number(pts) || 1,
    });
    if (parsedQuestion) out.push(parsedQuestion);
  }
  return out;
}

function parseImportTsv(text: string): DraftQuestion[] {
  return parseImportRows(
    text
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map((line) => line.split("\t"))
  );
}

function QuestionsTabPanel({
  quizTitle,
  questions,
  setQuestions,
  onBackToDetails,
  onSaveQuiz,
  onAutoSaveQuestions,
  savingQuiz,
}: {
  quizTitle: string;
  questions: DraftQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<DraftQuestion[]>>;
  onBackToDetails: () => void;
  onSaveQuiz: () => void | Promise<void>;
  onAutoSaveQuestions?: (nextQuestions: DraftQuestion[]) => Promise<void>;
  savingQuiz?: boolean;
}) {
  const [importOpen, setImportOpen] = React.useState(false);
  const [questionModalOpen, setQuestionModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [modalDraft, setModalDraft] = React.useState<DraftQuestion>(() => createModalQuestion());
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const displayQuizName = quizTitle.trim() || "Untitled quiz";
  const autoSaveEnabled = Boolean(onAutoSaveQuestions);

  const applyQuestions = React.useCallback(
    (nextQuestions: DraftQuestion[]) => {
      setQuestions(nextQuestions);
      if (onAutoSaveQuestions) {
        void onAutoSaveQuestions(nextQuestions);
      }
    },
    [onAutoSaveQuestions, setQuestions]
  );

  const openAdd = () => {
    setEditingId(null);
    setModalDraft(createModalQuestion());
    setModalError(null);
    setQuestionModalOpen(true);
  };

  const openEdit = (id: string) => {
    const q = questions.find((x) => x.id === id);
    if (!q) return;
    setEditingId(id);
    setModalDraft(cloneQuestion(q));
    setModalError(null);
    setQuestionModalOpen(true);
  };

  const saveModal = () => {
    const prompt = modalDraft.prompt.trim();
    if (!prompt) {
      setModalError("Question text is required.");
      return;
    }
    let saved: DraftQuestion;

    if (modalDraft.questionType === "multiple-choice") {
      const filled = modalDraft.options.filter((option) => option.text.trim());
      if (filled.length < 2) {
        setModalError("At least two answer options with text are required.");
        return;
      }
      const options: DraftOption[] = filled.map((option, index) => ({
        ...option,
        label: letterForIndex(index),
        text: option.text.trim(),
      }));
      const correct = options.find((option) => option.id === modalDraft.correctOptionId) ?? options[0];
      saved = {
        ...modalDraft,
        prompt,
        options,
        correctOptionId: correct?.id ?? options[0]!.id,
        points: Math.max(1, Number(modalDraft.points) || 1),
        rationale: modalDraft.rationale?.trim() || undefined,
      };
    } else if (modalDraft.questionType === "multiple-select") {
      const filled = modalDraft.options.filter((option) => option.text.trim());
      if (filled.length < 2) {
        setModalError("At least two answer options with text are required.");
        return;
      }
      const options: DraftOption[] = filled.map((option, index) => ({
        ...option,
        label: letterForIndex(index),
        text: option.text.trim(),
      }));
      const optionIds = new Set(options.map((option) => option.id));
      const correctOptionIds = modalDraft.correctOptionIds.filter((id) => optionIds.has(id));
      if (!correctOptionIds.length) {
        setModalError("Select at least one correct answer.");
        return;
      }
      saved = {
        ...modalDraft,
        prompt,
        options,
        correctOptionIds,
        points: Math.max(1, Number(modalDraft.points) || 1),
        rationale: modalDraft.rationale?.trim() || undefined,
      };
    } else if (modalDraft.questionType === "true-false") {
      saved = {
        ...modalDraft,
        prompt,
        correctBoolean: modalDraft.correctBoolean,
        points: Math.max(1, Number(modalDraft.points) || 1),
        rationale: modalDraft.rationale?.trim() || undefined,
      };
    } else {
      const acceptableAnswers = Array.from(
        new Set(modalDraft.acceptableAnswers.map((answer) => answer.trim()).filter(Boolean))
      );
      if (!acceptableAnswers.length) {
        setModalError("Add at least one accepted answer.");
        return;
      }
      saved = {
        ...modalDraft,
        prompt,
        acceptableAnswers,
        points: Math.max(1, Number(modalDraft.points) || 1),
        rationale: modalDraft.rationale?.trim() || undefined,
      };
    }

    const nextQuestions = editingId
      ? questions.map((question) => (question.id === editingId ? { ...saved, id: editingId } : question))
      : [...questions, saved];
    applyQuestions(nextQuestions);
    setQuestionModalOpen(false);
    setModalError(null);
  };

  const removeQuestion = (id: string) => {
    applyQuestions(questions.filter((question) => question.id !== id));
  };

  const addModalOption = () => {
    setModalDraft((d) => {
      if (!isOptionBasedQuestion(d)) return d;
      const nextLabel = letterForIndex(d.options.length);
      const nextOptions = [...d.options, { id: nextId("opt"), label: nextLabel, text: "" }];
      if (d.questionType === "multiple-select") {
        return {
          ...d,
          options: nextOptions,
        };
      }
      return {
        ...d,
        options: nextOptions,
      };
    });
  };

  const removeModalOption = (optionId: string) => {
    setModalDraft((d) => {
      if (!isOptionBasedQuestion(d)) return d;
      if (d.options.length <= 2) return d;
      const next = d.options.filter((o) => o.id !== optionId);
      const relabeled = next.map((o, i) => ({ ...o, label: letterForIndex(i) }));
      if (d.questionType === "multiple-select") {
        const correctOptionIds = d.correctOptionIds.filter((id) =>
          relabeled.some((option) => option.id === id)
        );
        return {
          ...d,
          options: relabeled,
          correctOptionIds: correctOptionIds.length
            ? correctOptionIds
            : relabeled[0]
              ? [relabeled[0].id]
              : [],
        };
      }
      let correct = d.correctOptionId;
      if (!relabeled.some((o) => o.id === correct)) {
        correct = relabeled[0]?.id ?? "";
      }
      return { ...d, options: relabeled, correctOptionId: correct };
    });
  };

  const updateModalOptionText = (optionId: string, text: string) => {
    setModalDraft((d) => ({
      ...d,
      ...(isOptionBasedQuestion(d)
        ? {
            options: d.options.map((option) =>
              option.id === optionId ? { ...option, text } : option
            ),
          }
        : {}),
    }));
  };

  const toggleCorrectOption = (optionId: string) => {
    setModalDraft((draft) => {
      if (!isOptionBasedQuestion(draft)) return draft;
      if (draft.questionType === "multiple-select") {
        const nextCorrectOptionIds = draft.correctOptionIds.includes(optionId)
          ? draft.correctOptionIds.filter((id) => id !== optionId)
          : [...draft.correctOptionIds, optionId];
        return {
          ...draft,
          correctOptionIds: nextCorrectOptionIds.length ? nextCorrectOptionIds : [optionId],
        };
      }
      return {
        ...draft,
        correctOptionId: optionId,
      };
    });
  };

  const addAcceptableAnswer = () => {
    setModalDraft((draft) =>
      draft.questionType === "short-answer"
        ? { ...draft, acceptableAnswers: [...draft.acceptableAnswers, ""] }
        : draft
    );
  };

  const updateAcceptableAnswer = (index: number, value: string) => {
    setModalDraft((draft) =>
      draft.questionType === "short-answer"
        ? {
            ...draft,
            acceptableAnswers: draft.acceptableAnswers.map((answer, answerIndex) =>
              answerIndex === index ? value : answer
            ),
          }
        : draft
    );
  };

  const removeAcceptableAnswer = (index: number) => {
    setModalDraft((draft) => {
      if (draft.questionType !== "short-answer") return draft;
      if (draft.acceptableAnswers.length <= 1) return draft;
      return {
        ...draft,
        acceptableAnswers: draft.acceptableAnswers.filter((_, answerIndex) => answerIndex !== index),
      };
    });
  };

  const handleImportFile = async (file: File | null) => {
    setImportError(null);
    if (!file) return;
    try {
      const fileName = file.name.toLowerCase();
      let parsed: DraftQuestion[] = [];

      if (
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls") ||
        fileName.endsWith(".csv")
      ) {
        const { read, utils } = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          setImportError("The spreadsheet is empty.");
          return;
        }
        const firstSheet = workbook.Sheets[firstSheetName];
        const rows = utils.sheet_to_json<Array<string | number | boolean | null | undefined>>(
          firstSheet,
          { header: 1, defval: "" }
        );
        parsed = parseImportRows(rows);
      } else {
        const text = await file.text();
        parsed = parseImportTsv(text);
      }

      if (parsed.length === 0) {
        setImportError(
          "No valid rows found. Use columns: Question, OptionA-D, Correct, Points."
        );
        return;
      }
      applyQuestions([...questions, ...parsed]);
      setImportOpen(false);
    } catch {
      setImportError("Could not read file. Use .xls, .xlsx, or the downloaded template.");
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([IMPORT_TEMPLATE_TSV], {
      type: "text/tab-separated-values;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-import-template.tsv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
            Manage Questions
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Add, edit, or import questions for:{" "}
            <span className="font-semibold text-zinc-700">{displayQuizName}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg border-zinc-300 bg-white"
            onClick={onBackToDetails}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => {
              setImportError(null);
              setImportOpen(true);
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import from Excel
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={openAdd}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Question Manually
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-gold text-gold-foreground hover:bg-gold/90"
            onClick={() => void onSaveQuiz()}
            disabled={savingQuiz}
          >
            <Save className="mr-2 h-4 w-4" />
            {savingQuiz ? "Saving…" : "Save Quiz"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-600">
        {autoSaveEnabled
          ? "Question changes are saved automatically for this existing quiz."
          : "For a new quiz, add your questions here then click Save Quiz to keep them."}
      </div>

      <details className="group rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-zinc-800">
          <ChevronRight className="h-4 w-4 shrink-0 transition group-open:rotate-90" />
          Excel Import Format Guide
        </summary>
        <div className="mt-3 space-y-2 border-t border-zinc-200 pt-3 text-sm text-zinc-600">
          <p>
            Upload an Excel file (<strong>.xlsx</strong> or <strong>.xls</strong>) or export as{" "}
            <strong>Tab delimited (.txt)</strong>. Columns (in order):
          </p>
          <ul className="list-inside list-disc space-y-1 text-zinc-700">
            <li>
              <strong>Question</strong> — full question text
            </li>
            <li>
              <strong>OptionA</strong> … <strong>OptionD</strong> — four choices (leave unused cells
              empty if fewer)
            </li>
            <li>
              <strong>Correct</strong> — letter A–D for the correct option
            </li>
            <li>
              <strong>Points</strong> — integer points for this question
            </li>
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 rounded-lg"
            onClick={downloadTemplate}
          >
            <Download className="mr-2 h-4 w-4" />
            Download template
          </Button>
        </div>
      </details>

      <div>
        <h3 className="text-base font-semibold text-zinc-900">Questions ({questions.length})</h3>

        {questions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center text-sm text-zinc-500">
            No questions yet. Import from Excel or add a question manually.
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {questions.map((q, idx) => {
              const correct =
                q.questionType === "multiple-choice"
                  ? q.options.find((option) => option.id === q.correctOptionId)
                  : null;
              return (
                <li key={q.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-zinc-900">Q{idx + 1}</span>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        {questionTypeLabel(q.questionType)}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        {q.points} {q.points === 1 ? "point" : "points"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-semibold">
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => openEdit(q.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-rose-600 hover:underline"
                        onClick={() => removeQuestion(q.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-800">
                    {idx + 1}. {q.prompt || "—"}
                  </p>
                  {q.questionType === "true-false" ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {["True", "False"].map((label) => {
                        const isCorrect = (label === "True") === q.correctBoolean;
                        return (
                          <div
                            key={label}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm font-medium",
                              isCorrect
                                ? "border-blue-200 bg-blue-50/80 text-zinc-900"
                                : "border-zinc-200 bg-zinc-50/80 text-zinc-700"
                            )}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  ) : q.questionType === "short-answer" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {q.acceptableAnswers.map((answer) => (
                        <span
                          key={answer}
                          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800"
                        >
                          {answer}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt) => {
                        const isCorrect =
                          q.questionType === "multiple-select"
                            ? q.correctOptionIds.includes(opt.id)
                            : opt.id === correct?.id;
                        return (
                          <div
                            key={opt.id}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm",
                              isCorrect
                                ? "border-blue-200 bg-blue-50/80 text-zinc-900"
                                : "border-zinc-200 bg-zinc-50/80 text-zinc-700"
                            )}
                          >
                            <span className="font-semibold text-zinc-900">{opt.label}.</span>{" "}
                            {opt.text.trim() || `Option ${opt.label}`}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      <Dialog open={questionModalOpen} onOpenChange={setQuestionModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Question" : "Add New Question"}</DialogTitle>
            <DialogDescription>
              Select the question type, enter the prompt, options, and mark the correct answer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>
                Question Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={modalDraft.questionType}
                onValueChange={(v) =>
                  setModalDraft((draft) =>
                    convertQuestionType(draft, v as DraftQuestion["questionType"])
                  )
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Question Text <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                value={modalDraft.prompt}
                onChange={(e) => setModalDraft((d) => ({ ...d, prompt: e.target.value }))}
                placeholder="Enter your question here..."
                className="min-h-[120px] rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>Rationale (Optional)</Label>
              <Textarea
                value={modalDraft.rationale ?? ""}
                onChange={(e) => setModalDraft((d) => ({ ...d, rationale: e.target.value }))}
                placeholder="Explain why this is the correct answer (optional)."
                className="min-h-[90px] rounded-lg"
              />
            </div>

            <div className="space-y-3">
              {isOptionBasedQuestion(modalDraft) ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>
                      Answer Options <span className="text-rose-500">*</span>
                    </Label>
                    <button
                      type="button"
                      className="inline-flex items-center text-sm font-semibold text-blue-600 hover:underline"
                      onClick={addModalOption}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {modalDraft.options.map((opt) => {
                      const checked =
                        modalDraft.questionType === "multiple-select"
                          ? modalDraft.correctOptionIds.includes(opt.id)
                          : modalDraft.correctOptionId === opt.id;
                      return (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            type={
                              modalDraft.questionType === "multiple-select"
                                ? "checkbox"
                                : "radio"
                            }
                            name="correct-answer"
                            checked={checked}
                            onChange={() => toggleCorrectOption(opt.id)}
                            className="h-4 w-4 shrink-0 border-zinc-300 text-blue-600"
                            aria-label={`Correct answer ${opt.label}`}
                          />
                          <span className="w-6 shrink-0 text-sm font-semibold text-zinc-600">
                            {opt.label}
                          </span>
                          <Input
                            value={opt.text}
                            onChange={(e) => updateModalOptionText(opt.id, e.target.value)}
                            placeholder={`Option ${opt.label}`}
                            className="h-10 flex-1 rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30"
                            disabled={modalDraft.options.length <= 2}
                            onClick={() => removeModalOption(opt.id)}
                            aria-label="Remove option"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {modalDraft.questionType === "multiple-select"
                      ? "Select all correct answers. Minimum 2 options required."
                      : "Select the radio button next to the correct answer. Minimum 2 options required."}
                  </p>
                </>
              ) : modalDraft.questionType === "true-false" ? (
                <div className="space-y-2">
                  <Label>
                    Correct Answer <span className="text-rose-500">*</span>
                  </Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { label: "True", value: true },
                      { label: "False", value: false },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() =>
                          setModalDraft((draft) =>
                            draft.questionType === "true-false"
                              ? { ...draft, correctBoolean: option.value }
                              : draft
                          )
                        }
                        className={cn(
                          "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                          modalDraft.correctBoolean === option.value
                            ? "border-gold bg-gold/10 text-zinc-900"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label>
                      Accepted Answers <span className="text-rose-500">*</span>
                    </Label>
                    <button
                      type="button"
                      className="inline-flex items-center text-sm font-semibold text-blue-600 hover:underline"
                      onClick={addAcceptableAnswer}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Answer
                    </button>
                  </div>
                  <div className="space-y-2">
                    {modalDraft.acceptableAnswers.map((answer, index) => (
                      <div key={`${modalDraft.id}-answer-${index}`} className="flex items-center gap-2">
                        <Input
                          value={answer}
                          onChange={(e) => updateAcceptableAnswer(index, e.target.value)}
                          placeholder={`Accepted answer ${index + 1}`}
                          className="h-10 flex-1 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30"
                          disabled={modalDraft.acceptableAnswers.length <= 1}
                          onClick={() => removeAcceptableAnswer(index)}
                          aria-label="Remove accepted answer"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Add every acceptable answer variation. Matching ignores letter case and extra spaces.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Points <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={modalDraft.points}
                onChange={(e) =>
                  setModalDraft((d) => ({ ...d, points: Math.max(1, Number(e.target.value) || 1) }))
                }
                className="h-10 max-w-[120px] rounded-lg"
              />
            </div>

            {modalError ? (
              <p className="text-sm text-rose-600" role="alert">
                {modalError}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={saveModal}>
              {editingId ? "Save changes" : "Add question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Excel / TSV Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>Import Questions from Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file (.xlsx / .xls) or a tab-separated file (.tsv / .txt). See the
              format guide on the main screen.
            </DialogDescription>
          </DialogHeader>

          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-10 text-center transition hover:border-emerald-300 hover:bg-emerald-50/30"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const f = e.dataTransfer.files?.[0];
              if (f) void handleImportFile(f);
            }}
            role="button"
            tabIndex={0}
          >
            <Upload className="mb-2 h-10 w-10 text-zinc-400" />
            <p className="text-sm font-semibold text-zinc-800">Click to upload or drag and drop</p>
            <p className="mt-1 text-xs text-zinc-500">
              Excel (.xlsx, .xls) or template (.tsv, .txt) up to 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.tsv,.txt,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/tab-separated-values,text/plain,text/csv"
              className="hidden"
              onChange={(e) => void handleImportFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Info className="h-4 w-4 shrink-0" />
              Required format
            </div>
            <p className="mt-2 text-xs text-blue-900/80">Required columns:</p>
            <ul className="mt-2 space-y-1 text-xs text-blue-950">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Question
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                OptionA, OptionB, OptionC, OptionD
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Correct (letter A–D), Points
              </li>
            </ul>
          </div>

          {importError ? (
            <p className="text-sm text-rose-600" role="alert">
              {importError}
            </p>
          ) : null}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              onClick={downloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DEFAULT_FORM: QuizCreateValues = {
  title: "",
  category: "healthcare",
  status: "draft",
  durationMinutes: 15,
  passingScorePercent: 60,
};

function AdminQuizNewViewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const tabParam = searchParams.get("tab");

  const [boot, setBoot] = React.useState<{
    key: number;
    defaults: QuizCreateValues;
    questions: DraftQuestion[];
    editNotFound: boolean;
    module: string;
  } | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadError(null);

      if (!editParam) {
        if (!cancelled) {
          setBoot({
            key: Date.now(),
            defaults: { ...DEFAULT_FORM },
            questions: [],
            editNotFound: false,
            module: "",
          });
        }
        return;
      }

      try {
        const q = await getAdminQuizById(editParam);
        if (cancelled) return;

        if (!q) {
          setBoot({
            key: Date.now(),
            defaults: { ...DEFAULT_FORM },
            questions: [],
            editNotFound: true,
            module: "",
          });
          return;
        }

        setBoot({
          key: Date.now(),
          defaults: {
            title: q.title,
            category: q.category,
            status: q.status,
            durationMinutes: q.meta?.durationMinutes ?? 15,
            passingScorePercent: q.meta?.passingScorePercent ?? 60,
          },
          questions: (q.questionBank ?? []).map(normalizeDraftQuestion),
          editNotFound: false,
          module: q.module,
        });
      } catch (e) {
        if (cancelled) return;
        setLoadError(getErrorMessage(e, "Failed to load quiz."));
        setBoot({
          key: Date.now(),
          defaults: { ...DEFAULT_FORM },
          questions: [],
          editNotFound: false,
          module: "",
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [editParam]);

  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("details");
  const [questions, setQuestions] = React.useState<DraftQuestion[]>([]);

  React.useEffect(() => {
    if (boot) setQuestions(boot.questions);
  }, [boot]);

  React.useEffect(() => {
    setActiveTab(tabParam === "questions" ? "questions" : "details");
  }, [tabParam, boot?.key]);

  if (!boot) {
    return (
      <div className="mx-auto w-full max-w-[min(100%,1400px)] space-y-6 p-6">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-12 w-40 animate-pulse rounded-lg bg-zinc-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  const isEditing = Boolean(editParam) && !boot.editNotFound;

  return (
    <Form<QuizCreateValues>
      key={boot.key}
      schema={quizCreateSchema}
      defaultValues={boot.defaults}
      onSubmit={async (data) => {
        setSaveError(null);
        setSaving(true);
        try {
          const payload = buildQuizPayload(data, questions, boot.module);
          const saved = isEditing && editParam
            ? await updateQuiz(editParam, payload)
            : await createQuiz(payload);
          if (!saved) {
            throw new Error("Quiz not found.");
          }

          router.push("/admin/quizzes");
          router.refresh();
        } catch (e) {
          setSaveError(getErrorMessage(e, "Failed to save quiz."));
        } finally {
          setSaving(false);
        }
      }}
      className="space-y-6"
    >
      {(methods) => {
        const status = methods.watch("status");
        const quizTitle = methods.watch("title") ?? "";
        const saveQuizDraft = async (nextQuestions = questions) => {
          setSaveError(null);
          setSaving(true);
          try {
            const valid = await methods.trigger();
            if (!valid) {
              setSaveError("Complete the quiz details first, then save again.");
              return;
            }
            const data = methods.getValues();
            const payload = buildQuizPayload(data, nextQuestions, boot.module);
            const saved = isEditing && editParam
              ? await updateQuiz(editParam, payload)
              : await createQuiz(payload);
            if (!saved) {
              throw new Error("Quiz not found.");
            }
            if (!isEditing) {
              router.replace(`/admin/quizzes/new?edit=${encodeURIComponent(saved.id)}&tab=questions`);
            }
          } catch (e) {
            setSaveError(getErrorMessage(e, "Failed to save quiz."));
          } finally {
            setSaving(false);
          }
        };
        const autoSaveQuestions = isEditing && editParam
          ? async (nextQuestions: DraftQuestion[]) => {
              try {
                const data = methods.getValues();
                const payload = buildQuizPayload(data, nextQuestions, boot.module);
                await updateQuiz(editParam, payload);
              } catch (e) {
                setSaveError(getErrorMessage(e, "Failed to save quiz questions."));
              }
            }
          : undefined;

        return (
          <div className="mx-auto w-full max-w-[min(100%,1400px)] space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Link
                  href="/admin/quizzes"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back to quizzes
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
                    {isEditing ? "Edit Quiz" : "Add New Quiz"}
                  </h1>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
                      status === "active"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-zinc-100 text-zinc-700 ring-zinc-200"
                    )}
                  >
                    {status === "active" ? "Active" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  {isEditing
                    ? "Update details and questions, then save to apply changes."
                    : "Configure quiz details, then manage questions in the second tab."}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-zinc-200"
                  onClick={() => router.push("/admin/quizzes")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                  disabled={saving}
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {saving ? "Saving…" : isEditing ? "Save changes" : "Save quiz"}
                </Button>
              </div>
            </div>

            {boot.editNotFound ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                That quiz could not be found. You can create a new quiz below, or go back to the
                list.
              </div>
            ) : null}

            {saveError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {saveError}
              </div>
            ) : null}

            {loadError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {loadError}
              </div>
            ) : null}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="h-11 w-full justify-start rounded-xl border border-zinc-200 bg-zinc-100/80 p-1 sm:w-auto">
                <TabsTrigger
                  value="details"
                  className="rounded-lg px-4 data-[state=active]:shadow-sm"
                >
                  Quiz Details
                </TabsTrigger>
                <TabsTrigger
                  value="questions"
                  className="rounded-lg px-4 data-[state=active]:shadow-sm"
                >
                  Questions
                  <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-zinc-200 px-1.5 text-[11px] font-bold text-zinc-700 data-[state=active]:bg-gold/20 data-[state=active]:text-zinc-900">
                    {questions.length}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 focus-visible:outline-none">
                <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Quiz details</CardTitle>
                    <CardDescription>Basic information for this quiz.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField name="title" label="Quiz title" required>
                        {({ id, error, ...field }) => (
                          <FormInput
                            id={id}
                            error={error}
                            placeholder="e.g., Patient Safety Protocol Midterm"
                            className="h-10 rounded-xl border-zinc-200 bg-zinc-50/60"
                            {...field}
                          />
                        )}
                      </FormField>

                      <FormSelect
                        name="category"
                        label="Category"
                        required
                        options={
                          CATEGORY_OPTIONS.slice() as unknown as { value: string; label: string }[]
                        }
                        placeholder="Select category..."
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormSelect
                        name="status"
                        label="Status"
                        required
                        options={
                          STATUS_OPTIONS.slice() as unknown as { value: string; label: string }[]
                        }
                        placeholder="Select status..."
                      />

                      <FormField name="durationMinutes" label="Duration (minutes)" required>
                        {({ id, error, ...field }) => (
                          <FormInput
                            id={id}
                            error={error}
                            type="number"
                            min={1}
                            max={240}
                            className="h-10 rounded-xl border-zinc-200 bg-zinc-50/60"
                            {...field}
                          />
                        )}
                      </FormField>
                    </div>

                    <FormField name="passingScorePercent" label="Passing score (%)" required>
                      {({ id, error, ...field }) => (
                        <FormInput
                          id={id}
                          error={error}
                          type="number"
                          min={0}
                          max={100}
                          className="h-10 rounded-xl border-zinc-200 bg-zinc-50/60 sm:max-w-xs"
                          {...field}
                        />
                      )}
                    </FormField>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="mt-4 focus-visible:outline-none">
                <QuestionsTabPanel
                  quizTitle={quizTitle}
                  questions={questions}
                  setQuestions={setQuestions}
                  onBackToDetails={() => setActiveTab("details")}
                  onSaveQuiz={() => saveQuizDraft()}
                  onAutoSaveQuestions={autoSaveQuestions}
                  savingQuiz={saving}
                />
              </TabsContent>
            </Tabs>
          </div>
        );
      }}
    </Form>
  );
}

export function AdminQuizNewView() {
  return (
    <React.Suspense
      fallback={
        <div className="mx-auto w-full max-w-[min(100%,1400px)] space-y-6 p-6">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-12 w-40 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      }
    >
      <AdminQuizNewViewInner />
    </React.Suspense>
  );
}
