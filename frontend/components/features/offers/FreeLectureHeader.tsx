import Link from "next/link";

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
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        >
          ← Return to Dashboard
        </Link>
      </div>
    </header>
  );
}
