"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const explore = [
  { href: "/courses", label: "Courses Catalog" },
  { href: "#exam-simulation", label: "Exam Simulation" },
  { href: "#resource-library", label: "Resource Library" },
  { href: "#pricing", label: "Pricing Plans" },
];

const support = [
  { href: "#help", label: "Help Center" },
  { href: "#terms", label: "Terms of Service" },
  { href: "#privacy", label: "Privacy Policy" },
  { href: "#contact", label: "Contact Us" },
];

export function CoursesFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 text-white">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <p className="text-lg font-semibold uppercase tracking-wide">Yalla CPHQ</p>
            <p className="text-sm text-white/70">
              Professional healthcare quality education and CPHQ certification preparation for
              excellence.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
              Explore
            </h3>
            <ul className="mt-4 space-y-2">
              {explore.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              {support.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">
              Newsletter
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Get the latest CPHQ exam tips delivered.
            </p>
            <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Email"
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-gold"
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 bg-gold text-gold-foreground hover:bg-gold/90"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        <p className="mt-12 text-center text-sm text-white/50">
          ©2024 Yalla CPHQ. All rights reserved. Designed for excellence.
        </p>
      </div>
    </footer>
  );
}
