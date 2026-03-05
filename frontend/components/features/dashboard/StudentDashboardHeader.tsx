"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function StudentDashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isCoursesPage = pathname?.startsWith("/dashboard/courses");
  const searchPlaceholder = isCoursesPage ? "Search my courses..." : "Search for topics...";
  const userName = user?.name ?? "Guest";
  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "student" ? "Student" : "Member";

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white px-4 md:px-6">
      <div className="flex-1 flex justify-center max-w-xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hidden sm:flex items-center gap-2 rounded-lg px-2 py-1.5 text-right hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              aria-label="Account menu"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900 flex items-center justify-end gap-1.5">
                  {userName}
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                      roleLabel === "Admin"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-zinc-100 text-zinc-600"
                    )}
                  >
                    {roleLabel}
                  </span>
                </p>
                <p className="text-xs text-zinc-500">{user?.email ?? ""}</p>
              </div>
              <div
                className="h-9 w-9 shrink-0 rounded-full bg-zinc-200 bg-cover bg-center"
                style={
                  user?.profileImageUrl
                    ? { backgroundImage: `url(${user.profileImageUrl})` }
                    : undefined
                }
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => void handleLogout()} className="text-zinc-700 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="sm:hidden rounded-lg text-zinc-600"
          onClick={() => void handleLogout()}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
