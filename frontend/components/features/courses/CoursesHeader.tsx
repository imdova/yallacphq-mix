"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { OFFERS_DROPDOWN_ITEMS, WEBINARS_DROPDOWN_ITEMS, ROUTES } from "@/constants";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";

const navLinks = [
  { href: "/courses", label: "All Courses" },
  { href: "/#about", label: "About Us" },
];

export function CoursesHeader() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { courseIds } = useCart();
  const { user, status } = useAuth();
  const isLoggedIn = status === "authenticated" && !!user;
  const cartCount = courseIds.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900"
        >
          <Image
            src="/brand/logo-default.png"
            alt="Yalla CPHQ"
            width={220}
            height={48}
            className="h-9 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1 text-sm font-medium text-zinc-600 outline-none transition-colors hover:text-zinc-900",
                pathname.startsWith("/offers") && "text-zinc-900"
              )}
              aria-haspopup="true"
              aria-expanded={undefined}
            >
              Offers
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              <DropdownMenuItem asChild>
                <Link href="/offers">All offers</Link>
              </DropdownMenuItem>
              {OFFERS_DROPDOWN_ITEMS.map(({ href, label }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1 text-sm font-medium text-zinc-600 outline-none transition-colors hover:text-zinc-900",
                pathname.startsWith("/webinars") && "text-zinc-900"
              )}
              aria-haspopup="true"
              aria-expanded={undefined}
            >
              Webinars
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              <DropdownMenuItem asChild>
                <Link href="/webinars">All webinars</Link>
              </DropdownMenuItem>
              {WEBINARS_DROPDOWN_ITEMS.map(({ href, label }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/courses"
                ? pathname === "/courses"
                : pathname.startsWith(href.split("?")[0]);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-zinc-900",
                  isActive ? "text-zinc-900" : "text-zinc-600"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label={cartCount > 0 ? `Cart (${cartCount} items)` : "Cart"}
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-gold-foreground">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-zinc-600">
                <Menu className="h-5 w-5" aria-label="Open menu" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white">
              <nav className="mt-8 flex flex-col gap-4" aria-label="Mobile">
                <Link
                  href="/offers"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-zinc-900 hover:text-gold"
                >
                  Offers
                </Link>
                {OFFERS_DROPDOWN_ITEMS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="pl-4 text-base text-zinc-600 hover:text-gold"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/webinars"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-zinc-900 hover:text-gold"
                >
                  Webinars
                </Link>
                {WEBINARS_DROPDOWN_ITEMS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="pl-4 text-base text-zinc-600 hover:text-gold"
                  >
                    {label}
                  </Link>
                ))}
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-zinc-900 hover:text-gold"
                  >
                    {label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4">
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                  </Link>
                  {!isLoggedIn ? (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link
                        href={ROUTES.SIGNUP}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                      >
                        Sign Up
                      </Link>
                      <Link
                        href={ROUTES.LOGIN}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white",
                          "bg-[#34A853] shadow-sm transition hover:bg-[#2d9249]"
                        )}
                      >
                        Login
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={ROUTES.DASHBOARD}
                      onClick={() => setOpen(false)}
                      className="text-zinc-600 hover:text-zinc-900"
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          {!isLoggedIn ? (
            <div className="hidden items-center gap-4 md:flex">
              <Link
                href={ROUTES.SIGNUP}
                className="text-sm font-semibold text-zinc-700 transition-colors hover:text-zinc-900"
              >
                Sign Up
              </Link>
              <Link
                href={ROUTES.LOGIN}
                className={cn(
                  "inline-flex items-center justify-center rounded-full bg-[#34A853] px-4 py-2 text-sm font-semibold text-white",
                  "shadow-sm transition hover:bg-[#2d9249]"
                )}
              >
                Login
              </Link>
            </div>
          ) : (
            <Link
              href={ROUTES.DASHBOARD}
              className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 md:block"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
