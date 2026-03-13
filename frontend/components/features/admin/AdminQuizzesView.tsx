"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Eye,
  FileQuestion,
  Filter,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUIZ_CATEGORIES = [
  { id: "all", label: "All Quizzes" },
  { id: "healthcare", label: "Healthcare Quality" },
  { id: "patient-safety", label: "Patient Safety" },
  { id: "leadership", label: "Leadership" },
  { id: "strategy", label: "Strategy" },
];

/** Mock quiz rows for display until backend exists. */
const MOCK_QUIZZES = [
  { id: "1", title: "Healthcare Quality Fundamentals", module: "Module 1: Introduction to Quality", category: "healthcare", questions: 25, status: "active" as const, lastUpdated: "Oct 12, 2023" },
  { id: "2", title: "Patient Safety Protocol Midterm", module: "Module 2: Safety Standards", category: "patient-safety", questions: 50, status: "active" as const, lastUpdated: "Oct 10, 2023" },
  { id: "3", title: "Strategic Leadership Assessment", module: "Module 3: Leadership in Healthcare", category: "leadership", questions: 30, status: "draft" as const, lastUpdated: "Oct 8, 2023" },
  { id: "4", title: "Regulatory Compliance Quiz", module: "Module 1: Compliance Basics", category: "strategy", questions: 20, status: "active" as const, lastUpdated: "Oct 5, 2023" },
  { id: "5", title: "Module Quiz", module: "Module 1: Foundations", category: "healthcare", questions: 15, status: "active" as const, lastUpdated: "Oct 1, 2023" },
  { id: "6", title: "Knowledge Check", module: "Module 2: Core Concepts", category: "patient-safety", questions: 10, status: "draft" as const, lastUpdated: "Sep 28, 2023" },
  { id: "7", title: "CPHQ Practice Quiz", module: "Module 4: Exam Prep", category: "strategy", questions: 40, status: "active" as const, lastUpdated: "Sep 25, 2023" },
  { id: "8", title: "Assessment", module: "Module 3: Assessment", category: "leadership", questions: 35, status: "active" as const, lastUpdated: "Sep 20, 2023" },
  { id: "9", title: "Final Quiz", module: "Module 5: Final", category: "healthcare", questions: 60, status: "draft" as const, lastUpdated: "Sep 15, 2023" },
  { id: "10", title: "Section Review", module: "Module 2: Review", category: "patient-safety", questions: 12, status: "active" as const, lastUpdated: "Sep 10, 2023" },
];

const ICON_COLORS = [
  "bg-gold/20 text-gold",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
];

export function AdminQuizzesView() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MOCK_QUIZZES.filter((quiz) => {
      const matchSearch =
        !q ||
        quiz.title.toLowerCase().includes(q) ||
        quiz.module.toLowerCase().includes(q) ||
        quiz.id === q;
      const matchCategory = category === "all" || quiz.category === category;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, category]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            Manage Quizzes
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Create, edit, and monitor all academic assessments for the CPHQ program.
          </p>
        </div>
        <Button
          className="h-10 shrink-0 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
          asChild
        >
          <Link href="/admin/courses/new?step=2" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Quiz
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search quizzes, courses, or IDs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 pr-4"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {QUIZ_CATEGORIES.map((cat) => {
              const count = cat.id === "all" ? MOCK_QUIZZES.length : 0;
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gold text-gold-foreground shadow-sm hover:bg-gold/90"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  )}
                >
                  {cat.label}
                  {cat.id === "all" ? (
                    <span className={cn("ml-1.5", isActive ? "text-gold-foreground/90" : "text-zinc-500")}>
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="ml-auto rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            >
              <Filter className="mr-1.5 h-4 w-4" />
              More Filters
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-zinc-500">
                    Quiz title & course
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
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-zinc-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                      No quizzes found. Try adjusting your search or filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((quiz, idx) => (
                    <tr key={quiz.id} className="bg-white hover:bg-zinc-50/50 transition-colors">
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
                          <div>
                            <p className="font-semibold text-zinc-900">{quiz.title}</p>
                            <p className="text-xs text-zinc-500">{quiz.module}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-700">
                        {quiz.questions} Questions
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            quiz.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-zinc-100 text-zinc-600"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              quiz.status === "active" ? "bg-emerald-500" : "bg-zinc-400"
                            )}
                          />
                          {quiz.status === "active" ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{quiz.lastUpdated}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                            aria-label="Edit quiz"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                            aria-label="View quiz"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                            aria-label="Quiz stats"
                          >
                            <BarChart3 className="h-4 w-4" />
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
