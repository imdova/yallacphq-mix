"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function StudentAccountMenu({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const { user, status, logout } = useAuth();

  if (status !== "authenticated" || !user) return null;

  const userName = user.name;
  const initial = (userName?.trim()?.[0] ?? "U").toUpperCase();

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
            "flex items-center gap-2 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2",
            isDark
              ? "hover:bg-white/10 focus:ring-white/20"
              : "hover:bg-zinc-100 focus:ring-zinc-300",
            className
          )}
          aria-label="Account menu"
        >
          <div
            className={cn(
              "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold",
              isDark ? "bg-white/10 text-white/90 ring-1 ring-white/10" : "bg-zinc-200 text-zinc-700"
            )}
            style={
              user.profileImageUrl
                ? {
                    backgroundImage: `url(${user.profileImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!user.profileImageUrl ? initial : null}
          </div>
          <span
            className={cn(
              "hidden items-center gap-1 text-sm font-semibold sm:inline-flex",
              isDark ? "text-white" : "text-zinc-900"
            )}
          >
            {userName}
            <ChevronDown className={cn("h-4 w-4", isDark ? "text-white/70" : "text-zinc-500")} aria-hidden />
          </span>
          <ChevronDown className={cn("h-4 w-4 sm:hidden", isDark ? "text-white/70" : "text-zinc-500")} aria-hidden />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuLabel className="px-2 py-1 text-sm font-semibold text-zinc-900">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-2 py-2 focus:bg-zinc-100 focus:text-zinc-900">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4 text-zinc-500" aria-hidden />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-2 py-2 focus:bg-zinc-100 focus:text-zinc-900">
          <Link href="/dashboard/profile">
            <User className="h-4 w-4 text-zinc-500" aria-hidden />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-2 py-2 focus:bg-zinc-100 focus:text-zinc-900">
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4 text-zinc-500" aria-hidden />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={() => void handleLogout()}
          className="cursor-pointer rounded-lg px-2 py-2 text-zinc-700 focus:bg-zinc-100 focus:text-zinc-900"
        >
          <LogOut className="h-4 w-4 text-zinc-500" aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

