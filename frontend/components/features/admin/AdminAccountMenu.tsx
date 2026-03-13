"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function AdminAccountMenu({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const { user, status, logout } = useAuth();

  if (status !== "authenticated" || !user || user.role !== "admin") return null;

  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const isDark = variant === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2.5 rounded-xl border pl-1.5 pr-2.5 py-1.5 min-w-0 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
            isDark
              ? "border-white/20 bg-white/5 hover:bg-white/10 focus:ring-white/30 focus:ring-offset-black"
              : "border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 focus:ring-gold focus:ring-offset-2",
            className
          )}
          aria-label="My account"
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold",
              isDark ? "bg-white/10 text-white" : "bg-zinc-200 text-zinc-600"
            )}
          >
            {user.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </span>
          <span
            className={cn(
              "truncate max-w-[120px] text-sm font-medium",
              isDark ? "text-white" : "text-zinc-900"
            )}
          >
            {displayName}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0", isDark ? "text-white/70" : "text-zinc-500")}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "w-56 rounded-xl p-2 shadow-lg",
          isDark ? "border-zinc-800 bg-zinc-900 text-white" : "border-zinc-200 bg-white"
        )}
      >
        <div className="px-2 py-1.5">
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              isDark ? "text-zinc-400" : "text-zinc-500"
            )}
          >
            My Account
          </p>
        </div>
        <DropdownMenuSeparator className={isDark ? "bg-zinc-700" : "bg-zinc-100"} />
        <DropdownMenuItem asChild>
          <Link
            href="/admin"
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm",
              isDark
                ? "text-zinc-200 hover:bg-zinc-800 focus:bg-zinc-800"
                : "text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100"
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 text-zinc-500" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/admin/settings"
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm",
              isDark
                ? "text-zinc-200 hover:bg-zinc-800 focus:bg-zinc-800"
                : "text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100"
            )}
          >
            <User className="h-4 w-4 shrink-0 text-zinc-500" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/admin/settings"
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm",
              isDark
                ? "text-zinc-200 hover:bg-zinc-800 focus:bg-zinc-800"
                : "text-zinc-700 hover:bg-zinc-100 focus:bg-zinc-100"
            )}
          >
            <Settings className="h-4 w-4 shrink-0 text-zinc-500" />
            LMS Setting
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className={isDark ? "bg-zinc-700" : "bg-zinc-100"} />
        <DropdownMenuItem
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700",
            isDark && "hover:bg-red-900/20 focus:bg-red-900/20 hover:text-red-400 focus:text-red-400"
          )}
          onSelect={() => void handleLogout()}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
