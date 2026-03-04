"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { OFFERS_DROPDOWN_ITEMS, WEBINARS_DROPDOWN_ITEMS } from "@/constants";
import { useAuth } from "@/contexts/auth-context";

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "#about", label: "About Us" },
  { href: "/dashboard", label: "Student Portal" },
];

export function HomeHeader() {
  const [open, setOpen] = React.useState(false);
  const { user, status, logout } = useAuth();
  const isLoggedIn = status === "authenticated" && !!user;

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-white">
          <Image
            src="/brand/logo-black.png"
            alt="Yalla CPHQ"
            width={220}
            height={48}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-white/90 outline-none transition-colors hover:text-white"
              )}
              aria-haspopup="true"
              aria-expanded={undefined}
            >
              Offers
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px] border-zinc-800 bg-zinc-900 text-white">
              <DropdownMenuItem asChild className="focus:bg-zinc-800 focus:text-white">
                <Link href="/offers">All offers</Link>
              </DropdownMenuItem>
              {OFFERS_DROPDOWN_ITEMS.map(({ href, label }) => (
                <DropdownMenuItem key={href} asChild className="focus:bg-zinc-800 focus:text-white">
                  <Link href={href}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-white/90 outline-none transition-colors hover:text-white"
              )}
              aria-haspopup="true"
              aria-expanded={undefined}
            >
              Webinars
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px] border-zinc-800 bg-zinc-900 text-white">
              <DropdownMenuItem asChild className="focus:bg-zinc-800 focus:text-white">
                <Link href="/webinars">All webinars</Link>
              </DropdownMenuItem>
              {WEBINARS_DROPDOWN_ITEMS.map(({ href, label }) => (
                <DropdownMenuItem key={href} asChild className="focus:bg-zinc-800 focus:text-white">
                  <Link href={href}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium uppercase tracking-wide text-white/90",
                "transition-colors hover:text-white"
              )}
            >
              {label}
            </Link>
          ))}
          {isLoggedIn && (
            <>
              <Link
                href="/dashboard/profile"
                className={cn(
                  "text-sm font-medium uppercase tracking-wide text-white/90",
                  "transition-colors hover:text-white inline-flex items-center gap-1.5"
                )}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className={cn(
                  "text-sm font-medium uppercase tracking-wide text-white/90",
                  "transition-colors hover:text-white inline-flex items-center gap-1.5"
                )}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-5 w-5" aria-label="Open menu" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-black">
              <nav className="mt-8 flex flex-col gap-4" aria-label="Mobile">
                <Link
                  href="/offers"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium uppercase tracking-wide text-white hover:text-gold"
                >
                  Offers
                </Link>
                {OFFERS_DROPDOWN_ITEMS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="pl-4 text-base text-white/80 hover:text-gold"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/webinars"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium uppercase tracking-wide text-white hover:text-gold"
                >
                  Webinars
                </Link>
                {WEBINARS_DROPDOWN_ITEMS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="pl-4 text-base text-white/80 hover:text-gold"
                  >
                    {label}
                  </Link>
                ))}
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium uppercase tracking-wide text-white hover:text-gold"
                  >
                    {label}
                  </Link>
                ))}
                {isLoggedIn && (
                  <>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium uppercase tracking-wide text-white hover:text-gold inline-flex items-center gap-2"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="text-lg font-medium uppercase tracking-wide text-white hover:text-gold inline-flex items-center gap-2 text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </button>
                  </>
                )}
                <Link href="#enroll" onClick={() => setOpen(false)} className="pt-4">
                  <Button className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold uppercase">
                    Enroll Now
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Button
            asChild
            className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold uppercase tracking-wide px-6 max-md:hidden"
          >
            <Link href="#enroll">Enroll Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
