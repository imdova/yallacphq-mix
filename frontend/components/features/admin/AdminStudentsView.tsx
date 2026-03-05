"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { EnrollStudentModal } from "@/components/features/admin/EnrollStudentModal";
import { UserUpsertModal } from "@/components/features/admin/UserUpsertModal";
import { fetchCourses, enrollUserInCourse } from "@/lib/dal/courses";
import { createUser, deleteUser, getUsers, updateUser } from "@/lib/dal/user";
import { getStudentFieldOptions } from "@/lib/dal/settings";
import type { User } from "@/types/user";
import type { Course } from "@/types/course";
import { getErrorMessage } from "@/lib/api/error";
import {
  Mail,
  Pencil,
  Phone,
  Search,
  Trash2,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
} from "lucide-react";

type CountryFilter = "all" | string;
type SpecialityFilter = "all" | string;
type EnrollmentFilter = "all" | "enrolled" | "not_enrolled";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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

export function AdminStudentsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [students, setStudents] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [countryFilter, setCountryFilter] = React.useState<CountryFilter>("all");
  const [specialityFilter, setSpecialityFilter] = React.useState<SpecialityFilter>("all");
  const [enrollmentFilter, setEnrollmentFilter] = React.useState<EnrollmentFilter>("all");

  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<User | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const [deleting, setDeleting] = React.useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const [enrollingUser, setEnrollingUser] = React.useState<User | null>(null);
  const [enrollOpen, setEnrollOpen] = React.useState(false);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = React.useState(false);
  const [enrollLoading, setEnrollLoading] = React.useState(false);
  const [fieldOptions, setFieldOptions] = React.useState<{ countries: string[]; specialities: string[] }>({
    countries: [],
    specialities: [],
  });

  React.useEffect(() => {
    let cancelled = false;
    getStudentFieldOptions()
      .then((data) => {
        if (!cancelled) setFieldOptions(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUsers({
          search: debouncedSearch.trim() || undefined,
          country: countryFilter !== "all" ? countryFilter : undefined,
          speciality: specialityFilter !== "all" ? specialityFilter : undefined,
          enrollment: enrollmentFilter !== "all" ? enrollmentFilter : undefined,
        });
        if (!cancelled) setStudents(data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load students"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, countryFilter, specialityFilter, enrollmentFilter]);

  React.useEffect(() => {
    if (!enrollOpen) return;
    let cancelled = false;
    (async () => {
      setCoursesLoading(true);
      try {
        const data = await fetchCourses();
        if (!cancelled) setCourses(data);
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enrollOpen]);

  const openEnrollModal = (user: User) => {
    setEnrollingUser(user);
    setEnrollOpen(true);
  };

  const handleEnroll = async (userId: string, courseIds: string[]) => {
    setEnrollLoading(true);
    try {
      let lastUser: User | null = null;
      for (const courseId of courseIds) {
        const result = await enrollUserInCourse(courseId, userId);
        if (result.user) lastUser = result.user as User;
      }
      if (lastUser) {
        setStudents((prev) => prev.map((u) => (u.id === userId ? lastUser! : u)));
      } else if (courseIds.length > 0) {
        const updated = await updateUser(userId, { enrolled: true });
        if (updated) setStudents((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      }
      setEnrollOpen(false);
      setEnrollingUser(null);
    } finally {
      setEnrollLoading(false);
    }
  };

  const countryOptions = React.useMemo(() => {
    if (fieldOptions.countries.length > 0) return fieldOptions.countries;
    const set = new Set<string>();
    students.forEach((u) => {
      const c = u.country?.trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [students, fieldOptions.countries]);

  const specialityOptions = React.useMemo(() => {
    if (fieldOptions.specialities.length > 0) return fieldOptions.specialities;
    const set = new Set<string>();
    students.forEach((u) => {
      const s = u.speciality?.trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [students, fieldOptions.specialities]);

  const stats = React.useMemo(() => {
    const total = students.length;
    const enrolled = students.filter((u) => u.enrolled).length;
    const notEnrolled = total - enrolled;
    const admins = students.filter((u) => u.role === "admin").length;
    const studentCount = students.filter((u) => u.role === "student").length;
    return { total, enrolled, notEnrolled, admins, studentCount };
  }, [students]);

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  // Quick add from navbar: /admin/students?add=1 opens create modal
  React.useEffect(() => {
    if (searchParams.get("add") === "1") {
      openCreate();
      router.replace("/admin/students", { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only on mount / when add=1
  }, []);

  const handleUpsert = async (data: {
    name: string;
    email: string;
    role: User["role"];
    phone?: string;
    course?: string;
    country?: string;
    speciality?: string;
  }) => {
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone?.trim() || undefined,
      course: data.course?.trim() || undefined,
      country: data.country?.trim() || undefined,
      speciality: data.speciality?.trim() || undefined,
    };
    if (mode === "create") {
      const created = await createUser(payload);
      setStudents((prev) => [...prev, created]);
      return;
    }
    if (!editing) return;
    const updated = await updateUser(editing.id, payload);
    if (!updated) return;
    setStudents((prev) => prev.map((u) => (u.id === editing.id ? updated : u)));
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const ok = await deleteUser(deleting.id);
      if (ok) setStudents((prev) => prev.filter((u) => u.id !== deleting.id));
      setDeleteOpen(false);
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: ColumnDef<User>[] = React.useMemo(
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
          <span className="text-sm text-zinc-700">
            {row.original.country?.trim() || "—"}
          </span>
        ),
      },
      {
        accessorKey: "speciality",
        header: "Speciality",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-700">
            {row.original.speciality?.trim() || "—"}
          </span>
        ),
      },
      {
        id: "enrollment",
        header: "Status",
        cell: ({ row }) => {
          const u = row.original;
          return u.enrolled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <UserCheck className="h-3.5 w-3.5" />
              Enrolled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              <UserX className="h-3.5 w-3.5" />
              Not enrolled
            </span>
          );
        },
      },
      {
        accessorKey: "course",
        header: "Course",
        cell: ({ row }) => (
          <span className="text-sm text-zinc-700">
            {row.original.course?.trim() || "—"}
          </span>
        ),
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
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-zinc-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-200"
              onClick={() => openEnrollModal(row.original)}
              aria-label="Enroll student"
            >
              <GraduationCap className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl border-zinc-200"
              onClick={() => {
                setMode("edit");
                setEditing(row.original);
                setModalOpen(true);
              }}
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
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
    []
  );

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="rounded-2xl border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-rose-800">Couldn’t load students</div>
            <div className="mt-1 text-sm text-rose-700">{error}</div>
          </CardContent>
        </Card>
      ) : null}
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Total students
                </div>
                <div className="mt-0.5 text-2xl font-bold text-zinc-900">{stats.total}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              {stats.admins} admin{stats.admins !== 1 ? "s" : ""} · {stats.studentCount} student{stats.studentCount !== 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Enrolled
                </div>
                <div className="mt-0.5 text-2xl font-bold text-zinc-900">{stats.enrolled}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">Active in at least one course</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                <UserX className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Not enrolled
                </div>
                <div className="mt-0.5 text-2xl font-bold text-zinc-900">{stats.notEnrolled}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">No course enrollments yet</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Admins
                </div>
                <div className="mt-0.5 text-2xl font-bold text-zinc-900">{stats.admins}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">Full access to admin panel</div>
          </CardContent>
        </Card>
      </div>

      {/* Table card */}
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-600">Search</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="search"
                  placeholder="Name, email, phone…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-xl border-zinc-200 bg-white pl-9 pr-4"
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-600">Country</span>
              <Select value={countryFilter} onValueChange={(v) => setCountryFilter(v as CountryFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {countryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-600">Speciality</span>
              <Select value={specialityFilter} onValueChange={(v) => setSpecialityFilter(v as SpecialityFilter)}>
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All specialities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialities</SelectItem>
                  {specialityOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-600">Enrollment</span>
              <Select
                value={enrollmentFilter}
                onValueChange={(v) => setEnrollmentFilter(v as EnrollmentFilter)}
              >
                <SelectTrigger className="h-10 rounded-xl border-zinc-200 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="not_enrolled">Not enrolled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={openCreate}
              className="h-10 w-full rounded-xl bg-gold text-gold-foreground hover:bg-gold/90 sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              Add student
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/80 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-600">Loading students…</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50/50 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-200/80 text-zinc-500">
                <Users className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-zinc-800">
                {searchQuery.trim() ||
                countryFilter !== "all" ||
                specialityFilter !== "all" ||
                enrollmentFilter !== "all"
                  ? "No students match your filters"
                  : "No students yet"}
              </p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                {searchQuery.trim() ||
                countryFilter !== "all" ||
                specialityFilter !== "all" ||
                enrollmentFilter !== "all"
                  ? "Try changing search, country, speciality or enrollment to see more results."
                  : "Add your first student to get started."}
              </p>
              {!searchQuery.trim() &&
                countryFilter === "all" &&
                specialityFilter === "all" &&
                enrollmentFilter === "all" && (
                <Button
                  onClick={openCreate}
                  className="mt-4 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  <UserPlus className="h-4 w-4" />
                  Add student
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Narrow viewport: card list — no horizontal scroll */}
              <div className="block xl:hidden space-y-3">
                {students.map((u) => (
                  <Card
                    key={u.id}
                    className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200/80"
                          aria-hidden
                        >
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div>
                            <div className="font-semibold text-zinc-900">{u.name}</div>
                            <div className="flex items-center gap-1.5 truncate text-sm text-zinc-500">
                              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              <span className="truncate">{u.email}</span>
                            </div>
                            {u.phone?.trim() ? (
                              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                <span>{u.phone.trim()}</span>
                              </div>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-zinc-500">
                              Country: {u.country?.trim() || "—"}
                            </span>
                            <span className="text-zinc-400">·</span>
                            <span className="text-zinc-500">
                              Speciality: {u.speciality?.trim() || "—"}
                            </span>
                            <span className="text-zinc-400">·</span>
                            <span className="text-zinc-500">
                              Joined: {formatDate(u.createdAt)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            {u.enrolled ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <UserCheck className="h-3.5 w-3.5" />
                                Enrolled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                                <UserX className="h-3.5 w-3.5" />
                                Not enrolled
                              </span>
                            )}
                            {u.course?.trim() ? (
                              <span className="text-xs text-zinc-600 truncate max-w-[180px]">
                                {u.course.trim()}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-lg border-zinc-200 text-emerald-600 hover:text-emerald-700"
                              onClick={() => openEnrollModal(u)}
                              aria-label="Enroll student"
                            >
                              <GraduationCap className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-lg border-zinc-200"
                              onClick={() => {
                                setMode("edit");
                                setEditing(u);
                                setModalOpen(true);
                              }}
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-lg border-zinc-200 text-red-600 hover:text-red-700"
                              onClick={() => {
                                setDeleting(u);
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
                ))}
              </div>

              {/* Wide viewport: table */}
              <div className="hidden xl:block overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[800px] px-4 sm:px-0">
                  <DataTable
                    columns={columns}
                    data={students}
                    pageSize={10}
                    enableRowSelection={false}
                    emptyMessage="No students found."
                    className="[&_.rounded-md.border]:rounded-2xl [&_.rounded-md.border]:border-zinc-200 [&_thead]:bg-zinc-50/70"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <UserUpsertModal
        open={modalOpen}
        mode={mode}
        user={editing}
        countryOptions={fieldOptions.countries}
        specialityOptions={fieldOptions.specialities}
        onOpenChange={setModalOpen}
        onSubmit={handleUpsert}
      />

      <EnrollStudentModal
        open={enrollOpen}
        onOpenChange={(open) => {
          setEnrollOpen(open);
          if (!open) setEnrollingUser(null);
        }}
        user={enrollingUser}
        courses={courses}
        loading={coursesLoading || enrollLoading}
        onEnroll={handleEnroll}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete student?"
        description={
          deleting
            ? `This will permanently remove ${deleting.name} (${deleting.email}).`
            : "This will permanently remove the student."
        }
        confirmText="Delete"
        confirmVariant="destructive"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
