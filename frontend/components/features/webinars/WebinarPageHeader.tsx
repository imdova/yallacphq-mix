"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function WebinarPageHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-gold" aria-hidden />
          <span className="text-lg font-semibold text-zinc-900">Yalla CPHQ</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900"
          >
            Home
          </Link>
          <Link
            href="/webinars"
            className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900"
          >
            Webinars
          </Link>
          <Link
            href="/courses"
            className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900"
          >
          </Link>
        </nav>
        <Button
          asChild
          className="rounded-lg bg-gold px-5 text-gold-foreground hover:bg-gold/90 font-semibold"
        >
          <Link href="#save-spot">Register Now</Link>
        </Button>
      </div>
    </header>
  );
}
