"use client";

import * as React from "react";
import { StudentSidebar } from "@/components/features/dashboard/StudentSidebar";
import { StudentDashboardHeader } from "@/components/features/dashboard/StudentDashboardHeader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex min-h-[100dvh] bg-zinc-50">
        <div className="hidden md:block">
          <StudentSidebar />
        </div>

        <SheetContent side="left" className="p-0" showClose>
          <StudentSidebar variant="sheet" onNavigate={() => setOpen(false)} />
        </SheetContent>

        <div className="flex flex-1 flex-col min-w-0">
          <StudentDashboardHeader
            sidebarTrigger={
              <SheetTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 rounded-xl border-zinc-200 bg-white"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            }
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </Sheet>
  );
}
