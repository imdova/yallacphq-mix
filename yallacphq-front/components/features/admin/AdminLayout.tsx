"use client";

import * as React from "react";
import { AdminSidebar } from "@/components/features/admin/AdminSidebar";
import { AdminHeader } from "@/components/features/admin/AdminHeader";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

