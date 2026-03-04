"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const LOGIN_PATH = "/auth/login";

/**
 * Wraps content that requires authentication. Redirects to login when not
 * authenticated and preserves the intended URL in ?next= for after login.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useAuth();

  React.useEffect(() => {
    if (status !== "unauthenticated") return;
    const next = pathname ? `${pathname}` : "/dashboard";
    const search = next ? `?next=${encodeURIComponent(next)}` : "";
    router.replace(`${LOGIN_PATH}${search}`);
  }, [status, pathname, router]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-zinc-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-zinc-600">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
