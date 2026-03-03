"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus, Search, Ticket, Users, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const titleMap: Record<string, { title: string; subtitle?: string }> = {
  "/admin": { title: "Dashboard", subtitle: "KPIs, activity, and quick actions" },
  "/admin/students": { title: "Students", subtitle: "Manage students and roles" },
  "/admin/courses": { title: "Courses", subtitle: "Catalog, pricing, and publishing" },
  "/admin/courses/new": { title: "New course", subtitle: "Create course in 2 steps" },
  "/admin/orders": { title: "Orders", subtitle: "Payments and checkout activity" },
  "/admin/offers": { title: "Offers", subtitle: "Landing pages and promotions" },
  "/admin/webinars": { title: "Webinars", subtitle: "Sessions, registrations, reminders" },
  "/admin/settings": { title: "Settings", subtitle: "Security, integrations, preferences" },
};

export function AdminHeader() {
  const pathname = usePathname() ?? "/admin";
  const [q, setQ] = React.useState("");

  const meta = React.useMemo(() => {
    // Map nested pages to their top-level section.
    const key = Object.keys(titleMap)
      .sort((a, b) => b.length - a.length)
      .find((k) => pathname === k || pathname.startsWith(k + "/"));
    return titleMap[key ?? "/admin"] ?? titleMap["/admin"];
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900">{meta.title}</div>
          {meta.subtitle ? (
            <div className="truncate text-xs text-zinc-500">{meta.subtitle}</div>
          ) : null}
        </div>

        <div className="hidden max-w-md flex-1 lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search students, courses, orders…"
              className="h-9 rounded-xl border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm"
            />
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
                <Link href="/admin/students">
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
        </div>
      </div>
    </header>
  );
}

