"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2,
  CircleDashed,
  FileQuestion,
  ListChecks,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminStoredQuiz } from "@/types/quiz";
import { deleteQuiz, getAdminQuizzes, updateQuiz } from "@/lib/dal/quizzes";
import { getErrorMessage } from "@/lib/api/error";
import { ConfirmDialog } from "@/components/features/admin/ConfirmDialog";

const QUIZ_CATEGORIES = [
  { id: "all", label: "All Quizzes" },
  { id: "healthcare", label: "Healthcare Quality" },
  { id: "patient-safety", label: "Patient Safety" },
  { id: "leadership", label: "Leadership" },
  { id: "strategy", label: "Strategy" },
] as const;

const STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
] as const;

const ICON_COLORS = [
  "bg-gold/20 text-gold",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
];

function categoryLabel(id: string) {
  return QUIZ_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Display creation date; older rows may only have lastUpdated. */
function createdAtLabel(quiz: AdminStoredQuiz): string {
  return formatDisplayDate(quiz.createdAt?.trim() || quiz.lastUpdated);
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

function formatDisplayDate(value?: string) {
  if (!value?.trim()) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatShortDate(parsed);
}

export function AdminQuizzesView() {
  const [quizzes, setQuizzes] = React.useState<AdminStoredQuiz[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [groupFilter, setGroupFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] =
    React.useState<(typeof STATUS_FILTERS)[number]["id"]>("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setQuizzes(await getAdminQuizzes());
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load quizzes"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return quizzes.filter((quiz) => {
      const matchSearch =
        !q ||
        quiz.title.toLowerCase().includes(q) ||
        quiz.module.toLowerCase().includes(q) ||
        quiz.id.toLowerCase().includes(q);
      const matchCategory = category === "all" || quiz.category === category;
      const matchGroup = groupFilter === "all" || quiz.module === groupFilter;
      const matchStatus = statusFilter === "all" || quiz.status === statusFilter;
      return matchSearch && matchCategory && matchGroup && matchStatus;
    });
  }, [searchQuery, category, groupFilter, statusFilter, quizzes]);

  const groupOptions = React.useMemo(() => {
    const unique = Array.from(new Set(quizzes.map((q) => q.module).filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [quizzes]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const aggregates = React.useMemo(() => {
    const active = quizzes.filter((q) => q.status === "active").length;
    const draft = quizzes.filter((q) => q.status === "draft").length;
    const questionSum = quizzes.reduce((s, q) => s + (q.questions || 0), 0);
    return { active, draft, questionSum };
  }, [quizzes]);

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      setError(null);
      await deleteQuiz(deleteId);
      await refresh();
      setDeleteId(null);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to delete quiz"));
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(quiz: AdminStoredQuiz, status: "active" | "draft") {
    try {
      setError(null);
      const updated = await updateQuiz(quiz.id, { status });
      if (updated) {
        setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? updated : q)));
      }
    } catch (e) {
      setError(getErrorMessage(e, "Failed to update quiz status"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            Manage Quizzes
          </h1>
        </div>
        <Button
          className="h-10 shrink-0 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
          asChild
        >
          <Link href="/admin/quizzes/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Quiz
          </Link>
        </Button>
      </div>

      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-4 text-sm font-medium text-rose-800">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Total quizzes
              </p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <ListChecks className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{quizzes.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Active</p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{aggregates.active}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Drafts</p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                <CircleDashed className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold text-zinc-700">{aggregates.draft}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Questions (all)
              </p>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <FileQuestion className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{aggregates.questionSum}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-md lg:flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search by title, category line, or ID…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 pr-4"
              />
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:ml-auto lg:w-auto">
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full min-w-[150px] rounded-xl border-zinc-200 bg-white text-sm sm:w-auto">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {QUIZ_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={groupFilter}
                onValueChange={(v) => {
                  setGroupFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full min-w-[150px] rounded-xl border-zinc-200 bg-white text-sm sm:w-auto">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groupOptions.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as (typeof STATUS_FILTERS)[number]["id"]);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full min-w-[140px] rounded-xl border-zinc-200 bg-white text-sm sm:w-auto">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-zinc-500">
                    Quiz title
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wider text-zinc-500">
                    Created at
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-zinc-500">
                    Category
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-zinc-500">
                    Group
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-zinc-500">
                    Questions
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-zinc-500">
                    Last updated
                  </th>
                  <th className="px-4 py-3 text-right font-semibold uppercase tracking-wider text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-sm text-zinc-500">
                      Loading quizzes…
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center">
                      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                          <FileQuestion className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-zinc-800">
                          {quizzes.length === 0
                            ? "No quizzes yet"
                            : "No quizzes match your filters"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {quizzes.length === 0
                            ? "Create your first quiz to start building questions and publishing assessments."
                            : "Try clearing search or switching category / status."}
                        </p>
                        {quizzes.length === 0 ? (
                          <Button
                            className="mt-1 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                            asChild
                          >
                            <Link
                              href="/admin/quizzes/new"
                              className="inline-flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Create a quiz
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((quiz, idx) => (
                    <tr key={quiz.id} className="bg-white transition-colors hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              ICON_COLORS[idx % ICON_COLORS.length]
                            )}
                          >
                            <FileQuestion className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900">{quiz.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                        {createdAtLabel(quiz)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                          {categoryLabel(quiz.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{quiz.module || "—"}</td>
                      <td className="px-4 py-3 text-zinc-700">
                        <div className="inline-flex items-center gap-2">
                          <span>{quiz.questions} Questions</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 rounded-full border border-zinc-200 bg-white px-2 text-zinc-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:bg-gold/10 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-gold/40"
                            aria-label="Add questions in quiz builder"
                            title="Add questions"
                            asChild
                          >
                            <Link
                              href={`/admin/quizzes/new?edit=${encodeURIComponent(quiz.id)}&tab=questions`}
                              className="inline-flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span className="hidden text-[11px] font-semibold sm:inline">Add</span>
                            </Link>
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={quiz.status}
                          onValueChange={(v) => void handleStatusChange(quiz, v as "active" | "draft")}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-8 w-[116px] rounded-lg border text-xs font-semibold",
                              quiz.status === "active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-zinc-200 bg-zinc-100 text-zinc-700"
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{formatDisplayDate(quiz.lastUpdated)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:bg-gold/5 hover:text-zinc-900"
                            aria-label="Edit quiz"
                            title="Edit quiz"
                            asChild
                          >
                            <Link href={`/admin/quizzes/new?edit=${encodeURIComponent(quiz.id)}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            aria-label="Delete quiz"
                            title="Delete quiz"
                            type="button"
                            onClick={() => setDeleteId(quiz.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-4 sm:flex-row">
              <p className="text-sm text-zinc-500">
                Showing {startItem} to {endItem} of {total} quizzes
              </p>
              {totalPages > 1 ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-zinc-200"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                  >
                    <span className="text-zinc-600">←</span>
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-9 min-w-[2.25rem] rounded-xl",
                        p === currentPage
                          ? "border-gold bg-gold text-gold-foreground hover:bg-gold/90 hover:text-gold-foreground"
                          : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      )}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-zinc-200"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                  >
                    <span className="text-zinc-600">→</span>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-zinc-400">Page 1 of 1</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this quiz?"
        description="This permanently removes the quiz and all of its questions. This cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleting}
        onOpenChange={(o) => !o && !deleting && setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
