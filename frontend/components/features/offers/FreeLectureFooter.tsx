import Link from "next/link";

export function FreeLectureFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-zinc-500">
          © 2024 Yalla CPHQ. All content is NAPHQ-aligned and expert-verified.
        </p>
        <div className="flex gap-6 text-sm font-medium uppercase tracking-wide text-zinc-600">
          <Link href="#privacy" className="hover:text-zinc-900">
            Privacy Policy
          </Link>
          <Link href="#terms" className="hover:text-zinc-900">
            Terms of Service
          </Link>
          <Link href="#support" className="hover:text-zinc-900">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
