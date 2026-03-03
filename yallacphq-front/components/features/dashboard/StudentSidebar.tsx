"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Award,
  User,
  ReceiptText,
  Users,
  Settings,
  Lightbulb,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/orders", label: "Orders", icon: ReceiptText },
  { href: "/dashboard/quizzes", label: "Practice Quizzes", icon: HelpCircle },
  { href: "/dashboard/certifications", label: "Certifications", icon: Award },
  { href: "/dashboard/community", label: "Community", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 text-white">
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gold text-gold-foreground">
          <Lightbulb className="h-5 w-5" />
        </span>
        <div className="flex flex-col">
          <span className="font-semibold tracking-tight">Yalla CPHQ</span>
          <span className="text-xs uppercase tracking-wider text-zinc-400">Student Portal</span>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 p-3" aria-label="Main">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <span
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gold text-gold-foreground"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-800 p-3 space-y-3">
        <Button
          asChild
          className="w-full rounded-lg bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
        >
          <Link href="/dashboard/premium">Go Premium</Link>
        </Button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Help Center</p>
          <p className="mt-0.5 text-sm text-zinc-500">Facing issues? Contact support</p>
          <Button
            asChild
            variant="ghost"
            className="mt-2 w-full text-zinc-300 hover:bg-zinc-800 hover:text-white font-medium"
          >
            <Link href="/dashboard/support">Get Support</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
