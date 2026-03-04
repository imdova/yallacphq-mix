import Link from "next/link";
import Image from "next/image";

export function Register1Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="container flex h-16 flex-col items-center justify-between gap-4 py-4 md:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/logo-black.png"
            alt="Yalla CPHQ"
            width={200}
            height={44}
            className="h-7 w-auto"
          />
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium uppercase tracking-wide text-white/80">
          <Link href="#privacy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="#terms" className="hover:text-white">
            Terms of Service
          </Link>
          <Link href="#contact" className="hover:text-white">
            Contact Support
          </Link>
        </div>
        <p className="text-sm text-white/60">© 2024 Yalla CPHQ All rights reserved.</p>
      </div>
    </footer>
  );
}
