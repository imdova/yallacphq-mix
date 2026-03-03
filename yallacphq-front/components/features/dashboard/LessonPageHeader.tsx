"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Search, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LessonPageHeader({ sidebarTrigger }: { sidebarTrigger?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 shrink-0">
        <div className="md:hidden">{sidebarTrigger}</div>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-gold-foreground">
            <Lightbulb className="h-4 w-4" />
          </span>
          <span className="font-semibold text-zinc-900">Yalla CPHQ</span>
        </Link>
      </div>

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="hidden md:inline-flex text-zinc-600 hover:text-zinc-900"
      >
        <Link href="/dashboard/courses" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
      </Button>

      <div className="flex-1" />

      <div className="hidden items-center gap-4 lg:flex">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder="Search topics, tools..."
            className="h-9 rounded-lg border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm"
          />
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-zinc-900">Ahmed Hassan</p>
          <p className="text-xs text-zinc-500">Student ID: #8821</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden text-right sm:block lg:hidden">
          <p className="text-sm font-semibold text-zinc-900">Ahmed Hassan</p>
          <p className="text-xs text-zinc-500">Student ID: #8821</p>
        </div>
        <div className="h-8 w-8 shrink-0 rounded-full bg-zinc-200" />
      </div>
    </header>
  );
}
