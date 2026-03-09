"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/features/admin/ConfirmDialog";
import { createCourse, deleteCourse, getCourses } from "@/lib/dal/courses";
import type { Course, CreateCourseInput } from "@/types/course";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/api/error";

type AccessFilter = "all" | "free" | "paid";
type TagFilter = "all" | string;

function formatCurrency(amount: number, currency?: string) {
  if (amount === 0) return "Free";
  const cur = currency?.trim() || "USD";
  const symbol = cur === "EGP" ? "EGP" : cur === "USD" ? "$" : cur;
  return symbol === "$" ? `$${amount.toFixed(2)}` : `${symbol} ${amount.toFixed(2)}`;
}

function formatPrice(c: Course) {
  const hasSale =
    c.priceSale != null && c.priceSale > 0 && (c.priceRegular ?? 0) > (c.priceSale ?? 0);
  const display = hasSale ? c.priceSale! : (c.priceRegular ?? 0);
  const label = formatCurrency(display, c.currency);
  const strike = hasSale ? formatCurrency(c.priceRegular ?? 0, c.currency) : null;
  return { label, strike };
}

function buildDuplicateCourseInput(course: Course): CreateCourseInput {
  // Exclude id, createdAt, updatedAt from duplicate payload
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    title,
    curriculumSections,
    reviewMedia,
    learningOutcomes,
    relatedCourseIds,
    ...rest
  } = course;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return {
    ...rest,
    title: `${title} (Copy)`,
    learningOutcomes: learningOutcomes ? [...learningOutcomes] : undefined,
    relatedCourseIds: relatedCourseIds ? [...relatedCourseIds] : undefined,
    reviewMedia: reviewMedia
      ? reviewMedia.map((item) => ({
          ...item,
        }))
      : undefined,
    curriculumSections: curriculumSections
      ? curriculumSections.map((section) => ({
          ...section,
          items: section.items?.map((item) => ({
            ...item,
          })),
        }))
      : undefined,
  };
}

export function AdminCoursesView() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [access, setAccess] = React.useState<AccessFilter>("all"); // Payment: Free/Paid
  const [tag, setTag] = React.useState<TagFilter>("all"); // Category

  const [deleting, setDeleting] = React.useState<Course | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCourses();
        if (!cancelled) setCourses(data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load courses"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tagOptions = React.useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(c.tag));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const stats = React.useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.status === "published").length;
    const draft = courses.filter((c) => (c.status ?? "draft") === "draft").length;
    const free = courses.filter((c) => (c.priceSale ?? c.priceRegular ?? 0) === 0).length;
    const enrolled = courses.reduce((acc, c) => acc + (c.enrolledCount ?? 0), 0);
    return { total, published, draft, free, enrolled };
  }, [courses]);

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((c) => {
      if (q) {
        const title = (c.title ?? "").toLowerCase();
        const tagStr = (c.tag ?? "").toLowerCase();
        if (!title.includes(q) && !tagStr.includes(q)) return false;
      }
      const isFree = (c.priceSale ?? c.priceRegular ?? 0) === 0;
      if (access === "free" && !isFree) return false;
      if (access === "paid" && isFree) return false;
      if (tag !== "all" && c.tag !== tag) return false;
      return true;
    });
  }, [courses, searchQuery, access, tag]);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const ok = await deleteCourse(deleting.id);
      if (ok) setCourses((prev) => prev.filter((c) => c.id !== deleting.id));
      setDeleteOpen(false);
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const duplicateCourse = React.useCallback(async (course: Course) => {
    try {
      const created = await createCourse(buildDuplicateCourseInput(course));
      setCourses((prev) => [...prev, created]);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to duplicate course"));
    }
  }, []);

  const columns: ColumnDef<Course>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "title",
        header: "Course",
        cell: ({ row }) => {
          const c = row.original;
          const href = `/admin/courses/${c.id}`;
          const imgSrc =
            c.imageUrl?.startsWith("data:") || c.imageUrl?.startsWith("http")
              ? c.imageUrl
              : undefined;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-14 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgSrc} alt={c.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-500">
                    {c.title.trim().slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <Link
                  href={href}
                  className="truncate font-semibold text-zinc-900 hover:underline"
                >
                  {c.title}
                </Link>
              </div>
            </div>
          );
        },
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => {
          const c = row.original;
          const raw = c.updatedAt ?? c.createdAt;
          if (!raw) return <span className="text-sm text-zinc-500">—</span>;
          const d = new Date(raw);
          const formatted =
            Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { dateStyle: "short" });
          return <span className="text-sm text-zinc-600">{formatted}</span>;
        },
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => <span className="text-sm text-zinc-700">{row.original.tag}</span>,
      },
      {
        id: "level",
        header: "Level",
        cell: ({ row }) => {
          const level = row.original.level;
          return (
            <span className="text-sm text-zinc-700">{level ?? "—"}</span>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status ?? "draft";
          const isPublished = status === "published";
          return (
            <span
              className={
                isPublished
                  ? "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                  : "inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600"
              }
            >
              {isPublished ? "Published" : "Draft"}
            </span>
          );
        },
      },
      {
        id: "price",
        header: "Price",
        cell: ({ row }) => {
          const c = row.original;
          const hasAnyPrice = c.priceRegular != null || c.priceSale != null;
          const { label } = formatPrice(c);
          return (
            <span className="inline-flex items-center rounded-lg bg-zinc-100 px-2.5 py-1 text-sm font-semibold text-zinc-800">
              {hasAnyPrice ? label : "No prices"}
            </span>
          );
        },
      },
      {
        id: "discount",
        header: "Discount",
        cell: ({ row }) => {
          const c = row.original;
          const pct =
            c.discountPercent != null
              ? c.discountPercent
              : c.priceSale != null &&
                  (c.priceRegular ?? 0) > 0 &&
                  c.priceSale < (c.priceRegular ?? 0)
                ? Math.round((1 - c.priceSale / (c.priceRegular ?? 1)) * 100)
                : 0;
          return pct > 0 ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {pct}%
            </span>
          ) : (
            <span className="text-sm text-zinc-500">—</span>
          );
        },
      },
      {
        id: "students",
        header: "Students",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-700">{row.original.enrolledCount ?? 0}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              asChild
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-zinc-200"
              aria-label="Edit"
            >
              <Link href={`/admin/courses/new?edit=${row.original.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-zinc-200"
              onClick={() => void duplicateCourse(row.original)}
              aria-label="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-zinc-200 text-red-600 hover:text-red-700"
              onClick={() => {
                setDeleting(row.original);
                setDeleteOpen(true);
              }}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [duplicateCourse]
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-sm font-semibold text-rose-800">Couldn’t load courses</div>
            <div className="mt-1 text-sm text-rose-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total courses
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-zinc-900">{stats.total}</div>
            <div className="mt-1 text-xs text-zinc-500">
              {stats.published} published · {stats.draft} draft
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Enrollments
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-zinc-900">{stats.enrolled}</div>
            <div className="mt-1 text-xs text-zinc-500">Total enrolled across courses</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Free courses
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-zinc-900">{stats.free}</div>
            <div className="mt-1 text-xs text-zinc-500">Price is 0</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Paid courses
            </div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-zinc-900">{stats.total - stats.free}</div>
            <div className="mt-1 text-xs text-zinc-500">Regular or sale price &gt; 0</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-4 pt-6 sm:p-6 sm:pt-6">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Search</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="search"
                  placeholder="Title, category…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-xl border-zinc-200 bg-white pl-9 pr-4 w-full"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Category</div>
              <Select value={tag} onValueChange={(v) => setTag(v as TagFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white w-full sm:w-auto">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {tagOptions.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Payment</div>
              <Select value={access} onValueChange={(v) => setAccess(v as AccessFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white w-full sm:w-auto">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              asChild
              className="h-10 w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90 sm:w-auto"
            >
              <Link href="/admin/courses/new" className="inline-flex items-center justify-center gap-2">
                <Plus className="h-4 w-4 shrink-0" />
                Add course
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 sm:p-10 text-center text-sm text-zinc-600">
              Loading…
            </div>
          ) : (
            <>
              {/* Narrow viewport (incl. with sidebar): card list — no horizontal scroll */}
              <div className="block xl:hidden space-y-3">
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-600">
                    No courses found.
                  </div>
                ) : (
                  filtered.map((c) => {
                    const raw = c.updatedAt ?? c.createdAt;
                    const dateStr =
                      raw && !Number.isNaN(new Date(raw).getTime())
                        ? new Date(raw).toLocaleDateString(undefined, { dateStyle: "short" })
                        : "—";
                    const status = c.status ?? "draft";
                    const isPublished = status === "published";
                    const hasAnyPrice = c.priceRegular != null || c.priceSale != null;
                    const { label: priceLabel } = formatPrice(c);
                    const imgSrc =
                      c.imageUrl?.startsWith("data:") || c.imageUrl?.startsWith("http")
                        ? c.imageUrl
                        : undefined;
                    return (
                      <Card
                        key={c.id}
                        className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                              {imgSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imgSrc}
                                  alt={c.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-500">
                                  {c.title.trim().slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <Link
                                href={`/admin/courses/${c.id}`}
                                className="font-semibold text-zinc-900 hover:underline line-clamp-2"
                              >
                                {c.title}
                              </Link>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span
                                  className={
                                    isPublished
                                      ? "rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700"
                                      : "rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-600"
                                  }
                                >
                                  {isPublished ? "Published" : "Draft"}
                                </span>
                                <span className="text-zinc-500">{c.tag}</span>
                                {c.level && (
                                  <span className="text-zinc-600">{c.level}</span>
                                )}
                                <span className="text-zinc-500">{dateStr}</span>
                              </div>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex rounded-lg bg-zinc-100 px-2 py-1 text-sm font-semibold text-zinc-800">
                                  {hasAnyPrice ? priceLabel : "No prices"}
                                </span>
                                <span className="text-xs text-zinc-500">
                                  {c.enrolledCount ?? 0} students
                                </span>
                              </div>
                              <div className="flex justify-end gap-2 pt-1">
                                <Button
                                  asChild
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg border-zinc-200"
                                  aria-label="Edit"
                                >
                                  <Link href={`/admin/courses/new?edit=${c.id}`}>
                                    <Pencil className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg border-zinc-200"
                                  onClick={() => void duplicateCourse(c)}
                                  aria-label="Duplicate"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg border-zinc-200 text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setDeleting(c);
                                    setDeleteOpen(true);
                                  }}
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Wide viewport only: table (avoids horizontal scroll on smaller widths) */}
              <div className="hidden xl:block overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[800px] px-4 sm:px-0">
                  <DataTable
                    columns={columns}
                    data={filtered}
                    pageSize={10}
                    enableRowSelection={true}
                    emptyMessage="No courses found."
                    className="[&_.rounded-md.border]:rounded-2xl [&_.rounded-md.border]:border-zinc-200 [&_thead]:bg-zinc-50/70"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete course?"
        description={
          deleting
            ? `This will permanently remove “${deleting.title}”.`
            : "This will permanently remove the course."
        }
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
