"use client";

import * as React from "react";
import Link from "next/link";
import { LessonPageHeader } from "@/components/features/dashboard/LessonPageHeader";
import { LessonSidebar } from "@/components/features/dashboard/LessonSidebar";
import { LessonContentView } from "@/components/features/dashboard/LessonContentView";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function LessonPage() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <LessonPageHeader
          sidebarTrigger={
            <SheetTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-9 w-9 rounded-xl border-zinc-200 bg-white"
                aria-label="Open course outline"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          }
        />
        <div className="flex-1">
          <div className="border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
            <nav className="text-sm text-zinc-500" aria-label="Breadcrumb">
              <Link href="/dashboard/courses" className="hover:text-zinc-700">
                My Courses
              </Link>
              <span className="mx-2">/</span>
              <span className="text-zinc-900">Healthcare Quality Tools</span>
            </nav>
          </div>
          <div className="flex">
            <div className="hidden lg:block">
              <LessonSidebar />
            </div>

            <SheetContent side="left" className="p-0" showClose>
              <LessonSidebar variant="sheet" onNavigate={() => setOpen(false)} />
            </SheetContent>

            <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6">
              <div className="mx-auto w-full max-w-5xl">
                <LessonContentView />
              </div>
            </main>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
