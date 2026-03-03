"use client";

import { usePathname } from "next/navigation";
import { CoursesHeader } from "@/components/features/courses/CoursesHeader";

export function WebinarsLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWebinar1Page = pathname?.includes("cphq-webinar-1");

  if (isWebinar1Page) {
    return <>{children}</>;
  }
  return (
    <>
      <CoursesHeader />
      {children}
    </>
  );
}
