import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Register1Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/logo-black.png"
            alt="Yalla CPHQ"
            width={220}
            height={48}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium uppercase tracking-wide text-white/90 transition-colors hover:text-white"
          >
            Member Login
          </Link>
          <Button
            asChild
            className="bg-gold px-6 font-semibold uppercase tracking-wide text-gold-foreground hover:bg-gold/90"
          >
            <Link href="/#enroll">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
