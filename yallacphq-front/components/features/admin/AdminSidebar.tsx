"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ShoppingBag,
  Tag,
  Ticket,
  Video,
  Settings,
  Shield,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/promo-codes", label: "Promo codes", icon: Ticket },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/webinars", label: "Webinars", icon: Video },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-50">
      <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-gold-foreground">
            <Shield className="h-5 w-5" aria-hidden />
          </span>
          <div className="leading-tight">
            <div className="font-semibold text-white">Admin</div>
            <div className="text-xs text-zinc-400">Yalla CPHQ</div>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="rounded-xl border-zinc-800 bg-transparent text-zinc-100 hover:bg-zinc-900 hover:text-white"
        >
          <Link href="/dashboard">Student</Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className="block">
              <span
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gold text-gold-foreground"
                    : "text-zinc-200 hover:bg-zinc-900 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{label}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Quick tip
          </div>
          <p className="mt-1 text-sm text-zinc-200">
            Keep offers up to date to boost conversions.
          </p>
          <Button asChild size="sm" className="mt-3 w-full rounded-xl bg-zinc-900 text-white hover:bg-zinc-800">
            <Link href="/admin/offers">Manage offers</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}

