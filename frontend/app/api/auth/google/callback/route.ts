import { NextResponse } from "next/server";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";
import { googleExchangeCodeResponseSchema } from "@/lib/api/contracts/auth";

export const dynamic = "force-dynamic";

const ACCESS_TOKEN_COOKIE = "access_token";

function isLocalHost(host: string): boolean {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host.trim());
}

function getAppOrigin(req: Request): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "";
  const url = new URL(req.url);
  const forwardedProto = req.headers.get("x-forwarded-proto")?.trim() || url.protocol.replace(":", "");
  const forwardedHost =
    req.headers.get("x-forwarded-host")?.trim() ||
    req.headers.get("host")?.trim() ||
    url.host;

  if (explicit) {
    try {
      const explicitUrl = new URL(explicit);
      if (!isLocalHost(explicitUrl.host)) return explicitUrl.origin;
    } catch {
      // Ignore invalid explicit origin and continue with request-derived origin.
    }
  }

  if (forwardedHost && !isLocalHost(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      // Ignore invalid explicit origin and continue with request-derived origin.
    }
  }

  return url.origin;
}

function setAccessTokenCookie(res: NextResponse, token: string) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

function forwardSetCookie(from: Response, to: NextResponse) {
  const setCookies = from.headers.getSetCookie?.();
  if (setCookies?.length) {
    for (const cookie of setCookies) to.headers.append("Set-Cookie", cookie);
    return true;
  }
  return false;
}

function redirectToLogin(req: Request, message: string) {
  const url = new URL("/auth/login", getAppOrigin(req));
  url.searchParams.set("oauth_error", message);
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (error) {
    return redirectToLogin(req, "Google sign-in was cancelled or failed");
  }

  if (!code || !state) {
    return redirectToLogin(req, "Missing Google login response");
  }

  if (!isBackendConfigured()) {
    return redirectToLogin(req, "Google login requires backend configuration");
  }

  try {
    const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/auth/google/exchange-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, state }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof data?.message === "string" ? data.message : "Google login failed";
      return redirectToLogin(req, message);
    }

    const parsed = googleExchangeCodeResponseSchema.safeParse(data);
    if (!parsed.success) {
      return redirectToLogin(req, "Invalid Google login response");
    }

    const nextRes = NextResponse.redirect(new URL(parsed.data.next, getAppOrigin(req)));
    const forwarded = forwardSetCookie(res, nextRes);
    if (!forwarded) {
      setAccessTokenCookie(nextRes, parsed.data.accessToken);
    }
    return nextRes;
  } catch {
    return redirectToLogin(req, "Google login failed");
  }
}
