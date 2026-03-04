"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Send,
} from "lucide-react";

const accounts = [
  { href: "/dashboard", label: "Student Portal" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Register" },
  { href: "/checkout", label: "Checkout" },
];

const resources = [
  { href: "/courses", label: "All Courses" },
  { href: "/webinars", label: "Webinars" },
  { href: "/offers", label: "Offers" },
  { href: "#", label: "Support" },
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms" },
];

const social = [
  { href: "#", icon: Linkedin },
  { href: "#", icon: Instagram },
  { href: "#", icon: Facebook },
  { href: "#", icon: Youtube },
];

export function HomeFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-white">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <p className="text-lg font-semibold tracking-tight">Yalla CPHQ</p>
            <p className="text-sm text-zinc-400">
              Healthcare quality education and CPHQ certification preparation for professionals
              worldwide.
            </p>
            <div className="flex gap-3">
              {social.map(({ href, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-gold"
                  aria-label={Icon.name}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Account
            </h3>
            <ul className="mt-3 space-y-2">
              {accounts.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 transition hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Resources
            </h3>
            <ul className="mt-3 space-y-2">
              {resources.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 transition hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Newsletter
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Get CPHQ tips and updates.
            </p>
            <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email"
                className="rounded-lg border-zinc-700 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus-visible:ring-gold"
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 rounded-lg bg-gold text-gold-foreground hover:bg-gold/90"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 text-sm text-zinc-500 md:flex-row">
          <p>© 2026 Yalla CPHQ. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#" className="transition hover:text-white">Privacy</Link>
            <Link href="#" className="transition hover:text-white">Terms</Link>
            <Link href="#" className="transition hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
