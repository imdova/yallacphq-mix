"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/components/features/admin/admin-nav-config";
import { ADMIN_SIDEBAR_BRANDING } from "@/constants";
import { Shield } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-50">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-gold-foreground">
          <Shield className="h-5 w-5" aria-hidden />
        </span>
        <div className="leading-tight">
          <div className="font-semibold text-white">{ADMIN_SIDEBAR_BRANDING.title}</div>
          <div className="text-xs text-zinc-400">{ADMIN_SIDEBAR_BRANDING.subtitle}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
        {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
          <Link
            href="/admin/offers"
            className="mt-3 flex w-full items-center justify-center rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Manage offers
          </Link>
        </div>
      </div>
    </aside>
  );
}
