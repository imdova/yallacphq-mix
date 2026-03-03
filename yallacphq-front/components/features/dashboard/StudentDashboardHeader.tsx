"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";

export function StudentDashboardHeader() {
  const pathname = usePathname();
  const isCoursesPage = pathname?.startsWith("/dashboard/courses");
  const searchPlaceholder = isCoursesPage ? "Search my courses..." : "Search for topics...";
  const userName = isCoursesPage ? "Dr. Sarah Ahmed" : "Abdullah Ahmed";
  const userSub = isCoursesPage ? "Premium Member" : "Student ID: #8829";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white px-4 md:px-6">
      <div className="flex-1 flex justify-center max-w-xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-zinc-900">{userName}</p>
          <p className="text-xs text-zinc-500">{userSub}</p>
        </div>
        <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-200 bg-cover bg-center" />
      </div>
    </header>
  );
}
