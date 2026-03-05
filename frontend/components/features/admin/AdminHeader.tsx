"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Plus, Search, Ticket, Users, GraduationCap, LogOut, ShoppingBag } from "lucide-react";
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
  "/admin/courses/new": { title: "New course", subtitle: "Create course in 2 steps" },
  "/admin/orders": { title: "Orders", subtitle: "Payments and checkout activity" },
  "/admin/promo-codes": { title: "Promo codes", subtitle: "Discount codes and limits" },
  "/admin/offers": { title: "Offers", subtitle: "Landing pages and promotions" },
  "/admin/webinars": { title: "Webinars", subtitle: "Sessions, registrations, reminders" },
  "/admin/settings": { title: "Settings", subtitle: "Security, integrations, preferences" },
};

export function AdminHeader() {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const { logout } = useAuth();
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
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900">{meta.title}</div>
          {meta.subtitle ? (
            <div className="truncate text-xs text-zinc-500">{meta.subtitle}</div>
          ) : null}
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-zinc-200"
            onClick={() => void handleLogout()}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}

