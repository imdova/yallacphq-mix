"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { STUDENT_NAV_ITEMS } from "@/components/features/dashboard/student-nav-config";
import { STUDENT_SIDEBAR_BRANDING } from "@/constants";
import { Lightbulb } from "lucide-react";

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 text-white">
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold text-gold-foreground">
          <Lightbulb className="h-5 w-5" />
        </span>
        <div className="flex flex-col">
          <span className="font-semibold tracking-tight">{STUDENT_SIDEBAR_BRANDING.title}</span>
          <span className="text-xs uppercase tracking-wider text-zinc-400">
            {STUDENT_SIDEBAR_BRANDING.subtitle}
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 p-3" aria-label="Main">
        {STUDENT_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <span
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gold text-gold-foreground"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 border-t border-zinc-800 p-3">
        <Link
          href="/dashboard/premium"
          className="flex w-full items-center justify-center rounded-lg bg-gold px-3 py-2.5 text-sm font-semibold text-gold-foreground hover:bg-gold/90"
        >
          Go Premium
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Help Center
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">Facing issues? Contact support</p>
          <Link
            href="/dashboard/support"
            className="mt-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Get Support
          </Link>
        </div>
      </div>
    </aside>
  );
}
