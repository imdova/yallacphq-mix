"use client";

import * as React from "react";
import { StudentSidebar } from "@/components/features/dashboard/StudentSidebar";
import { StudentDashboardHeader } from "@/components/features/dashboard/StudentDashboardHeader";

export function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <StudentSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <StudentDashboardHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
