import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionValue } from "@/lib/auth/session";

/** Cookie set by Next.js login route when using backend auth. */
const ACCESS_TOKEN_COOKIE = "access_token";

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
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifySessionValue(sessionCookie) : null;
  const hasAccessToken = !!req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isAuthenticated = !!session || hasAccessToken;
  const requestId = crypto.randomUUID();

  // Redirect authenticated users away from auth pages.
  if (isAuthPage(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // API protection (return JSON instead of redirects).
  if (isProtectedApi(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.json({ message: "UNAUTHENTICATED" }, { status: 401, headers: { "x-request-id": requestId } });
    }
    // Admin API: forbid non-admin when we have local session; when only access_token, backend validates.
    if (isAdminApi(pathname) && session && session.role !== "admin") {
      return NextResponse.json({ message: "FORBIDDEN" }, { status: 403, headers: { "x-request-id": requestId } });
    }
    return NextResponse.next();
  }

  // Page protection (redirect to login).
  if (isProtectedPath(pathname)) {
    if (!isAuthenticated) {
      const next = `${pathname}${search || ""}`;
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("next", next);
      return NextResponse.redirect(url);
    }
    // Non-admin with local session → dashboard; with access_token only, AdminLayout will redirect if not admin.
    if (pathname.startsWith("/admin") && session && session.role !== "admin") {
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

