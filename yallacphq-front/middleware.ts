import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionValue } from "@/lib/auth/session";

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
}

function isAuthPage(pathname: string) {
  return pathname === "/auth/login" || pathname === "/auth/signup";
}

function isAdminApi(pathname: string) {
  return pathname.startsWith("/api/admin");
}

function isProtectedApi(pathname: string) {
  return isAdminApi(pathname) || pathname.startsWith("/api/orders") || pathname.startsWith("/api/checkout");
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = cookie ? await verifySessionValue(cookie) : null;
  const requestId = crypto.randomUUID();

  // Redirect authenticated users away from auth pages.
  if (isAuthPage(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // API protection (return JSON instead of redirects).
  if (isProtectedApi(pathname)) {
    if (!session) {
      return NextResponse.json({ message: "UNAUTHENTICATED" }, { status: 401, headers: { "x-request-id": requestId } });
    }
    if (isAdminApi(pathname) && session.role !== "admin") {
      return NextResponse.json({ message: "FORBIDDEN" }, { status: 403, headers: { "x-request-id": requestId } });
    }
    return NextResponse.next();
  }

  // Page protection (redirect to login).
  if (isProtectedPath(pathname)) {
    if (!session) {
      const next = `${pathname}${search || ""}`;
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("next", next);
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/auth/:path*",
    "/api/admin/:path*",
    "/api/orders/:path*",
    "/api/checkout/:path*",
  ],
};

