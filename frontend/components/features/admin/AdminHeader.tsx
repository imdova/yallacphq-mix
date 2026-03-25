"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Ticket,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { searchAdmin } from "@/lib/dal/search";
import type { User } from "@/types/user";
import type { Course } from "@/types/course";
import type { Order } from "@/types/order";

const titleMap: Record<string, { title: string; subtitle?: string }> = {
  "/admin": { title: "Dashboard", subtitle: "KPIs, activity, and quick actions" },
  "/admin/students": { title: "Students", subtitle: "Manage students and roles" },
  "/admin/courses": { title: "Courses", subtitle: "Catalog, pricing, and publishing" },
  "/admin/courses/new": { title: "", subtitle: "" },
  "/admin/quizzes": { title: "Quizzes", subtitle: "Create, edit, and monitor assessments" },
  "/admin/quizzes/new": { title: "Add New Quiz", subtitle: "Build questions and publish when ready" },
  "/admin/orders": { title: "Orders", subtitle: "Payments and checkout activity" },
  "/admin/promo-codes": { title: "Promo codes", subtitle: "Discount codes and limits" },
  "/admin/offers": { title: "Offers", subtitle: "Landing pages and promotions" },
  "/admin/webinars": { title: "Webinars", subtitle: "Sessions, registrations, reminders" },
  "/admin/site-settings": { title: "Site settings", subtitle: "Site-wide options and preferences" },
  "/admin/settings": { title: "LMS Setting", subtitle: "Security, integrations, preferences" },
};

export function AdminHeader({ onOpenNav }: { onOpenNav?: () => void }) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const { user, logout } = useAuth();
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [results, setResults] = React.useState<{ students: User[]; courses: Course[]; orders: Order[] } | null>(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  React.useEffect(() => {
    if (!debouncedQ.trim()) {
      setResults(null);
      setSearchOpen(false);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    setSearchOpen(true);
    searchAdmin(debouncedQ)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setSearchLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults({ students: [], courses: [], orders: [] });
          setSearchLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const meta = React.useMemo(() => {
    const key = Object.keys(titleMap)
      .sort((a, b) => b.length - a.length)
      .find((k) => pathname === k || pathname.startsWith(k + "/"));
    return titleMap[key ?? "/admin"] ?? titleMap["/admin"];
  }, [pathname]);

  const totalResults =
    (results?.students.length ?? 0) + (results?.courses.length ?? 0) + (results?.orders.length ?? 0);
  const showDropdown = searchOpen && debouncedQ.trim().length >= 2 && (searchLoading || results !== null);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="min-w-0 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-zinc-200 lg:hidden"
            onClick={onOpenNav}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            {pathname === "/admin/courses/new" ? (
              <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-zinc-200">
                <Link href="/admin/courses">
                  <ArrowLeft className="h-4 w-4" />
                  Back to courses
                </Link>
              </Button>
            ) : (
              <>
                <div className="truncate text-sm font-semibold text-zinc-900">{meta.title}</div>
                {meta.subtitle ? (
                  <div className="truncate text-xs text-zinc-500">{meta.subtitle}</div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="hidden max-w-md flex-1 lg:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => debouncedQ.trim().length >= 2 && setSearchOpen(true)}
              type="search"
              placeholder="Search students, courses, orders…"
              className="h-9 rounded-xl border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm"
              autoComplete="off"
              aria-expanded={showDropdown}
              aria-haspopup="listbox"
            />
            {showDropdown ? (
              <div
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(70vh,400px)] overflow-auto rounded-xl border border-zinc-200 bg-white shadow-lg"
                role="listbox"
              >
                {searchLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
                    Searching…
                  </div>
                ) : results && totalResults === 0 ? (
                  <div className="py-6 text-center text-sm text-zinc-500">No results for “{debouncedQ}”</div>
                ) : results ? (
                  <div className="py-2">
                    {results.students.length > 0 ? (
                      <div className="px-2 pb-1">
                        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Students
                        </div>
                        {results.students.map((u) => (
                          <Link
                            key={u.id}
                            href="/admin/students"
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
                            role="option"
                          >
                            <Users className="h-4 w-4 shrink-0 text-zinc-400" />
                            <span className="truncate">{u.name}</span>
                            <span className="truncate text-zinc-500">{u.email}</span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    {results.courses.length > 0 ? (
                      <div className="px-2 pb-1">
                        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Courses
                        </div>
                        {results.courses.map((c) => (
                          <Link
                            key={c.id}
                            href={`/admin/courses/${c.id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
                            role="option"
                          >
                            <GraduationCap className="h-4 w-4 shrink-0 text-zinc-400" />
                            <span className="truncate">{c.title}</span>
                            {c.tag ? (
                              <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                                {c.tag}
                              </span>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    {results.orders.length > 0 ? (
                      <div className="px-2">
                        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Orders
                        </div>
                        {results.orders.map((o) => (
                          <Link
                            key={o.id}
                            href="/admin/orders"
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
                            role="option"
                          >
                            <ShoppingBag className="h-4 w-4 shrink-0 text-zinc-400" />
                            <span className="truncate">{o.studentName}</span>
                            <span className="truncate text-zinc-500">{o.courseTitle}</span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90"
              >
                <Plus className="h-4 w-4" />
                Quick add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuItem asChild>
                <Link href="/admin/students?add=1">
                  <Users className="mr-2 h-4 w-4" />
                  New student
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/courses/new">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  New course
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/quizzes/new">
                  <FileQuestion className="mr-2 h-4 w-4" />
                  Add New Quiz
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/promo-codes/new">
                  <Ticket className="mr-2 h-4 w-4" />
                  New promo code
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white pl-1.5 pr-2.5 py-1.5 min-w-0 hover:bg-zinc-50 hover:border-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                aria-label="My account"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600">
                  {user?.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profileImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </span>
                <span className="truncate max-w-[120px] text-sm font-medium text-zinc-900">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-zinc-200 p-2 shadow-lg">
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">My Account</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900">
                  <LayoutDashboard className="h-4 w-4 shrink-0 text-zinc-500" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900">
                  <UserIcon className="h-4 w-4 shrink-0 text-zinc-500" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900">
                  <Settings className="h-4 w-4 shrink-0 text-zinc-500" />
                  LMS Setting
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-100" />
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-700 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                onSelect={() => void handleLogout()}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

