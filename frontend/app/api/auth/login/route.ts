import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { jsonError, zodIssues } from "@/lib/api/route-helpers";
import { loginBodySchema } from "@/lib/api/contracts/auth";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

const ACCESS_TOKEN_COOKIE = "access_token";

function setAccessTokenCookie(
  res: NextResponse,
  token: string,
  options: { rememberMe?: boolean } = {}
) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: options.rememberMe ? 60 * 60 * 24 * 30 : undefined,
  });
}

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    try {
      const body = loginBodySchema.parse(await req.json());
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-request-id": requestId },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof data?.message === "string"
            ? data.message
            : "Invalid email or password";
        return NextResponse.json(
          { message, ...(data?.issues && { issues: data.issues }) },
          { status: res.status, headers: { "x-request-id": requestId } }
        );
      }

      const accessToken = data?.accessToken;
      const user = data?.user;
      if (!accessToken || !user) {
        return jsonError(502, "Invalid backend response", { requestId });
      }

      const nextRes = NextResponse.json(
        { user },
        { status: 201, headers: { "x-request-id": requestId } }
      );
      // Forward all Set-Cookie from backend (access_token + refresh_token)
      const setCookies = res.headers.getSetCookie?.();
      if (setCookies?.length) {
        for (const c of setCookies) nextRes.headers.append("Set-Cookie", c);
      } else {
        setAccessTokenCookie(nextRes, accessToken, {
          rememberMe: Boolean(body.rememberMe),
        });
      }
      return nextRes;
    } catch (err) {
      if (err instanceof ZodError) {
        return jsonError(400, "Invalid request", {
          issues: zodIssues(err),
          requestId,
        });
      }
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    const body = loginBodySchema.parse(await req.json());
    const { verifyCredential } = await import("@/lib/auth/store");
    const { createSessionValue } = await import("@/lib/auth/session");
    const { setSessionCookie } = await import("@/lib/auth/cookies");
    const { getUserById } = await import("@/lib/db/users");

    const userId = await verifyCredential(body.email, body.password);
    if (!userId) return jsonError(401, "Invalid email or password", { requestId });

    const user = await getUserById(userId);
    if (!user) return jsonError(401, "Invalid email or password", { requestId });

    const ttlMs = (body.rememberMe ? 30 * 24 : 8) * 60 * 60 * 1000;
    const sessionValue = await createSessionValue({
      uid: user.id,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + ttlMs,
    });

    const res = NextResponse.json({ user }, { headers: { "x-request-id": requestId } });
    setSessionCookie(res, sessionValue, { rememberMe: Boolean(body.rememberMe) });
    return res;
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    return jsonError(500, "Unexpected error", { requestId });
  }
}

