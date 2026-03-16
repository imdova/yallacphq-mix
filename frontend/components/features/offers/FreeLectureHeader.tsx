"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FreeLectureHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-gold text-gold-foreground font-bold text-sm">
            Y
          </span>
          <span className="text-lg font-semibold uppercase tracking-wide text-zinc-900">
            Yalla CPHQ
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="h-10 rounded-xl border-zinc-200">
            <Link href="/offers">More offers</Link>
          </Button>
          <Button asChild className="h-10 rounded-xl bg-gold text-gold-foreground hover:bg-gold/90">
            <Link href="/offers/cphq-offer">Get full access</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
