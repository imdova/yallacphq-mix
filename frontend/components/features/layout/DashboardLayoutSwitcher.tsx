"use client";

import { usePathname } from "next/navigation";
import { StudentDashboardLayout } from "./StudentDashboardLayout";

export function DashboardLayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLessonPage = pathname?.includes("/dashboard/courses/lesson");

  if (isLessonPage) {
    return <>{children}</>;
  }
  return <StudentDashboardLayout>{children}</StudentDashboardLayout>;
}
