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
import type { Course } from "@/types/course";
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
    const created = await createCourse({
      title: `${course.title} (Copy)`,
      tag: course.tag,
      instructorName: course.instructorName,
      instructorTitle: course.instructorTitle,
      durationHours: course.durationHours,
      priceRegular: course.priceRegular ?? 0,
      priceSale: course.priceSale,
    });
    setCourses((prev) => [...prev, created]);
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
        cell: () => <span className="text-sm text-zinc-600">—</span>,
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => <span className="text-sm text-zinc-700">{row.original.tag}</span>,
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
        id: "revenue",
        header: "Revenue",
        cell: ({ row }) => {
          const c = row.original;
          const price = (c.priceSale ?? c.priceRegular ?? 0) || 0;
          const enrolled = c.enrolledCount ?? 0;
          const rev = price > 0 && enrolled > 0 ? price * enrolled : 0;
          return rev > 0 ? (
            <span className="text-sm text-zinc-700">{formatCurrency(rev, c.currency)}</span>
          ) : (
            <span className="text-sm text-zinc-500">—</span>
          );
        },
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
    <div className="space-y-6">
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-rose-800">Couldn’t load courses</div>
            <div className="mt-1 text-sm text-rose-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total courses
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.total}</div>
            <div className="mt-1 text-xs text-zinc-500">
              {stats.published} published · {stats.draft} draft
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Enrollments
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.enrolled}</div>
            <div className="mt-1 text-xs text-zinc-500">Total enrolled across courses</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Free courses
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.free}</div>
            <div className="mt-1 text-xs text-zinc-500">Price is 0</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Paid courses
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{stats.total - stats.free}</div>
            <div className="mt-1 text-xs text-zinc-500">Regular or sale price &gt; 0</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Search</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="search"
                  placeholder="Title, category…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-xl border-zinc-200 bg-white pl-9 pr-4"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-600">Category</div>
              <Select value={tag} onValueChange={(v) => setTag(v as TagFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
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
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
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
              <Link href="/admin/courses/new" className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add course
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center text-sm text-zinc-600">
              Loading…
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              pageSize={10}
              enableRowSelection={true}
              emptyMessage="No courses found."
              className="[&_.rounded-md.border]:rounded-2xl [&_.rounded-md.border]:border-zinc-200 [&_thead]:bg-zinc-50/70"
            />
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
