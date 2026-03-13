"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { StudentAccountMenu } from "@/components/features/dashboard/StudentAccountMenu";

export function FreeLectureHeader() {
  const { user, status } = useAuth();
  const isLoggedIn = status === "authenticated" && !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-gold text-gold-foreground font-bold text-sm">
            Y
          </span>
          <span className="text-lg font-semibold uppercase tracking-wide text-zinc-900">
            Yalla CPHQ
          </span>
        </Link>
        {isLoggedIn ? (
          <StudentAccountMenu />
        ) : (
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            ← Return to Dashboard
          </Link>
        )}
      </div>
    </header>
  );
}
