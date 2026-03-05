"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { StudentDashboardLayout } from "./StudentDashboardLayout";
import { useAuth } from "@/contexts/auth-context";

/**
 * Renders dashboard layout with student sidebar. Redirects admins to /admin
 * so they only see the admin sidebar, not the student sidebar.
 */
export function DashboardLayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status } = useAuth();
  const isLessonPage = pathname?.includes("/dashboard/courses/lesson");

  React.useEffect(() => {
    if (status !== "authenticated" || !user) return;
    if (user.role === "admin") {
      router.replace("/admin");
    }
  }, [status, user, router]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-zinc-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && user?.role === "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-zinc-600">Redirecting to admin…</p>
        </div>
      </div>
    );
  }

  if (isLessonPage) {
    return <>{children}</>;
  }
  return <StudentDashboardLayout>{children}</StudentDashboardLayout>;
}
