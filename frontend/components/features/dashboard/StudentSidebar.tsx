"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { STUDENT_NAV_ITEMS } from "@/components/features/dashboard/student-nav-config";

export function StudentSidebar({
  variant = "sidebar",
  onNavigate,
}: {
  variant?: "sidebar" | "sheet";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col bg-zinc-900 text-white",
        variant === "sidebar" ? "w-56 border-r border-zinc-800" : "w-full"
      )}
    >
      <div className="flex h-20 items-center justify-center border-b border-zinc-800 px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex w-full items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          <Image
            src="/brand/logo-sidebar.png"
            alt="Yalla CPHQ - think quality. lead change"
            width={180}
            height={56}
            className="h-auto w-full max-w-[180px] object-contain"
            priority
          />
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3" aria-label="Main">
        {STUDENT_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={onNavigate}>
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
          onClick={onNavigate}
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
            onClick={onNavigate}
            className="mt-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Get Support
          </Link>
        </div>
      </div>
    </aside>
  );
}
