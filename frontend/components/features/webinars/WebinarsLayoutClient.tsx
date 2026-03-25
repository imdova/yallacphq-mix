"use client";

import { usePathname } from "next/navigation";
import { CoursesHeader } from "@/components/features/courses/CoursesHeader";

export function WebinarsLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWebinarDetailPage =
    pathname?.startsWith("/webinars/") && pathname.split("/").filter(Boolean).length > 1;

  if (isWebinarDetailPage) {
    return <>{children}</>;
  }
  return (
    <>
      <CoursesHeader />
      {children}
    </>
  );
}
