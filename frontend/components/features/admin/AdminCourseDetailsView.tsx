"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/features/admin/ConfirmDialog";
import { fetchCourseById } from "@/lib/dal/courses";
import { fetchAdminOrders } from "@/lib/dal/orders";
import { fetchUsers, updateUser } from "@/lib/dal/user";
import type { Course } from "@/types/course";
import type { Order } from "@/types/order";
import type { User } from "@/types/user";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api/error";
import {
  ArrowLeft,
  Copy,
  Eye,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  ReceiptText,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

function formatCurrency(amount: number, currency?: string) {
  const cur = currency?.trim() || "USD";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(amount);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

function statusBadge(status?: Course["status"]) {
  const s = status ?? "draft";
  return s === "published"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-zinc-100 text-zinc-700 border-zinc-200";
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return "—";
  }
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

export function AdminCourseDetailsView() {
  const params = useParams();
  const courseId = String((params as { id?: string })?.id ?? "");

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [course, setCourse] = React.useState<Course | null>(null);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [students, setStudents] = React.useState<User[]>([]);

  const [studentCountry, setStudentCountry] = React.useState<string>("all");
  const [studentSpeciality, setStudentSpeciality] = React.useState<string>("all");
  const [removingUser, setRemovingUser] = React.useState<User | null>(null);
  const [removeOpen, setRemoveOpen] = React.useState(false);
  const [removeLoading, setRemoveLoading] = React.useState(false);

  React.useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [c, o, u] = await Promise.all([fetchCourseById(courseId), fetchAdminOrders(), fetchUsers()]);
        if (cancelled) return;
        setCourse(c);
        setOrders(o);
        setStudents(u);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load course details"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const enrolledStudents = React.useMemo(() => {
    if (!course) return [];
    const title = course.title.trim();
    return students
      .filter((u) => u.enrolled && (u.course?.trim() || "") === title)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, course]);

  const studentCountryOptions = React.useMemo(() => {
    const set = new Set<string>();
    enrolledStudents.forEach((u) => {
      const c = u.country?.trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [enrolledStudents]);

  const studentSpecialityOptions = React.useMemo(() => {
    const set = new Set<string>();
    enrolledStudents.forEach((u) => {
      const s = u.speciality?.trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [enrolledStudents]);

  const filteredStudents = React.useMemo(() => {
    return enrolledStudents.filter((u) => {
      if (studentCountry !== "all" && (u.country?.trim() || "") !== studentCountry) return false;
      if (studentSpeciality !== "all" && (u.speciality?.trim() || "") !== studentSpeciality) return false;
      return true;
    });
  }, [enrolledStudents, studentCountry, studentSpeciality]);

  const handleRemoveFromCourse = async () => {
    if (!removingUser || !course) return;
    setRemoveLoading(true);
    try {
      const updated = await updateUser(removingUser.id, { enrolled: false, course: "" });
      if (updated) setStudents((prev) => prev.map((u) => (u.id === removingUser.id ? updated : u)));
      setRemoveOpen(false);
      setRemovingUser(null);
    } finally {
      setRemoveLoading(false);
    }
  };

  const courseOrders = React.useMemo(() => {
    if (!course) return [];
    const title = course.title.trim();
    return orders.filter((o) => (o.courseTitle?.trim() || "") === title);
  }, [orders, course]);

  const orderStats = React.useMemo(() => {
    const total = courseOrders.length;
    const paid = courseOrders.filter((o) => o.status === "paid").length;
    const refunded = courseOrders.filter((o) => o.status === "refunded").length;
    const revenue = courseOrders
      .filter((o) => o.status === "paid")
      .reduce((acc, o) => acc + Math.max(0, o.amount - (o.discountAmount ?? 0)), 0);
    return { total, paid, refunded, revenue };
  }, [courseOrders]);

  const overviewPrice = React.useMemo(() => {
    if (!course) return "—";
    const hasSale =
      course.priceSale != null &&
      course.priceSale > 0 &&
      (course.priceRegular ?? 0) > (course.priceSale ?? 0);
    const display = hasSale ? course.priceSale! : (course.priceRegular ?? 0);
    return display === 0 ? "Free" : formatCurrency(display, course.currency);
  }, [course]);

  const studentsColumns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Student",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200/80"
                aria-hidden
              >
                {getInitials(u.name)}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="truncate font-semibold text-zinc-900">{u.name}</div>
                <div className="flex items-center gap-1.5 truncate text-sm text-zinc-500">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{u.email}</span>
                </div>
                {u.phone?.trim() ? (
                  <div className="flex items-center gap-1.5 truncate text-sm text-zinc-500">
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{u.phone.trim()}</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-700">{row.original.country?.trim() || "—"}</span>
        ),
      },
      {
        accessorKey: "speciality",
        header: "Speciality",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-700">{row.original.speciality?.trim() || "—"}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: () => (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <UserCheck className="h-3.5 w-3.5" />
            Enrolled
          </span>
        ),
      },
      {
        id: "course",
        header: "Course",
        cell: () => (course ? (
          <span className="text-sm text-zinc-700">{course.title}</span>
        ) : "—"),
      },
      {
        id: "joined",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-600" title={row.original.createdAt}>
            {formatDate(row.original.createdAt)}
          </span>
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
              <Link href="/admin/students">
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-zinc-200 text-red-600 hover:text-red-700"
              onClick={() => {
                setRemovingUser(row.original);
                setRemoveOpen(true);
              }}
              aria-label="Remove from course"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [course]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/80 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
        <p className="mt-3 text-sm font-medium text-zinc-600">Loading course…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
          <p className="text-sm font-semibold text-rose-800">Couldn’t load course details</p>
          <p className="mt-1 text-sm text-rose-700">{error}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl border-zinc-200">
            <Link href="/admin/courses">Back to courses</Link>
          </Button>
          {error === "UNAUTHENTICATED" && (
            <Button asChild className="rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
              <Link href={`/auth/login?next=${encodeURIComponent(`/admin/courses/${courseId}`)}`}>
                Log in again
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">Course not found.</p>
        <Button asChild variant="outline" className="rounded-xl border-zinc-200">
          <Link href="/admin/courses">Back to courses</Link>
        </Button>
      </div>
    );
  }

  const imgSrc =
    course.imageUrl?.startsWith("data:") || course.imageUrl?.startsWith("http")
      ? course.imageUrl
      : undefined;
  const publicPreviewHref = `/course-details?course=${encodeURIComponent(course.id)}`;
  const aov = orderStats.paid > 0 ? orderStats.revenue / orderStats.paid : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="overflow-hidden rounded-2xl border-zinc-200 bg-white shadow-sm">
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[260px_1fr] lg:gap-6 lg:p-6">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 min-h-[180px] sm:min-h-0">
            {imgSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgSrc} alt={course.title} className="h-44 w-full object-cover lg:h-full lg:min-h-[260px]" />
            ) : (
              <div className="flex h-44 w-full items-center justify-center text-2xl font-bold text-zinc-500 lg:h-full lg:min-h-[260px]">
                {course.title.trim().slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-zinc-200 shrink-0">
                    <Link href="/admin/courses">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Link>
                  </Button>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                      statusBadge(course.status)
                    )}
                  >
                    {course.status ?? "draft"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    {course.tag}
                  </span>
                  {course.level ? (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                      {course.level}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-3 truncate text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                  {course.title}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600">
                  <span className="font-medium text-zinc-900">{overviewPrice}</span>
                  <span className="text-zinc-300">•</span>
                  <span>{course.durationHours}h</span>
                  <span className="text-zinc-300">•</span>
                  <span>{course.enrolledCount ?? 0} enrolled</span>
                  <span className="text-zinc-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    ID <span className="font-mono text-xs">{course.id}</span>
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0 rounded-xl border-zinc-200"
                    onClick={() => void copyText(course.id)}
                    aria-label="Copy course ID"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {course.description?.trim() ? (
                  <p className="mt-3 line-clamp-2 text-sm text-zinc-600">{course.description.trim()}</p>
                ) : null}
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
                <Button
                  asChild
                  className="h-10 w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  <Link href={`/admin/courses/new?edit=${course.id}`}>Edit course</Link>
                </Button>
                <Button asChild variant="outline" className="h-10 w-full rounded-xl border-zinc-200">
                  <Link href={publicPreviewHref} className="inline-flex items-center justify-center gap-2">
                    <Eye className="h-4 w-4 shrink-0" />
                    <span>Preview public page</span>
                  </Link>
                </Button>
              </div>
            </div>

            {(course.enableEnrollment === false || (course.status ?? "draft") === "draft") && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Heads up</p>
                <p className="mt-1 text-sm text-amber-800">
                  {course.enableEnrollment === false
                    ? "Enrollment is currently disabled for this course."
                    : "This course is in draft. Publish it when it’s ready."}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Students</div>
            <div className="mt-2 flex items-center gap-2 text-xl sm:text-2xl font-bold text-zinc-900">
              <Users className="h-5 w-5 shrink-0 text-zinc-500" />
              {enrolledStudents.length}
            </div>
            <div className="mt-1 text-xs text-zinc-500">Enrolled to this course</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Orders</div>
            <div className="mt-2 flex items-center gap-2 text-xl sm:text-2xl font-bold text-zinc-900">
              <ReceiptText className="h-5 w-5 shrink-0 text-zinc-500" />
              {orderStats.total}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {orderStats.paid} paid · {orderStats.refunded} refunded
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Revenue</div>
            <div className="mt-2 text-xl sm:text-2xl font-bold text-zinc-900">
              {formatCurrency(orderStats.revenue, "USD")}
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              AOV {formatCurrency(aov, "USD")} · Paid orders only
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</div>
            <div className="mt-2 flex items-center gap-2 text-xl sm:text-2xl font-bold text-zinc-900">
              <GraduationCap className="h-5 w-5 shrink-0 text-zinc-500" />
              {course.status ?? "draft"}
            </div>
            <div className="mt-1 text-xs text-zinc-500">Enrollment {course.enableEnrollment ? "enabled" : "off"}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 p-4 sm:p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">Students</CardTitle>
            <CardDescription>
              Enrolled in this course. Filter by country or speciality.
            </CardDescription>
          </div>
          <Button
            asChild
            className="h-10 w-full shrink-0 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90 sm:w-auto"
          >
            <Link href="/admin/students" className="inline-flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4 shrink-0" />
              Add student
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-600">Country</span>
              <Select value={studentCountry} onValueChange={setStudentCountry}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {studentCountryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-600">Speciality</span>
              <Select value={studentSpeciality} onValueChange={setStudentSpeciality}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All specialities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialities</SelectItem>
                  {studentSpecialityOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-xs text-zinc-500">
            Showing {filteredStudents.length} of {enrolledStudents.length} students
          </p>

          {enrolledStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/50 py-12 sm:py-16 text-center px-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-200/80 text-zinc-500">
                <Users className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-zinc-800">No enrolled students yet</p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                Add and enroll students from the Students page to see them here.
              </p>
              <Button asChild className="mt-4 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
                <Link href="/admin/students" className="inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Go to students
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[640px] px-4 sm:px-0">
                <DataTable
                  columns={studentsColumns}
                  data={filteredStudents}
                  pageSize={10}
                  enableRowSelection={false}
                  emptyMessage="No students match the filters."
                  className="[&_.rounded-md.border]:rounded-2xl [&_.rounded-md.border]:border-zinc-200 [&_thead]:bg-zinc-50/70"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={(open) => {
          setRemoveOpen(open);
          if (!open) setRemovingUser(null);
        }}
        title="Remove from course?"
        description={
          removingUser
            ? `This will remove ${removingUser.name} from this course. They can be enrolled again later.`
            : "This will remove the student from this course."
        }
        confirmText="Remove"
        confirmVariant="destructive"
        loading={removeLoading}
        onConfirm={handleRemoveFromCourse}
      />
    </div>
  );
}

