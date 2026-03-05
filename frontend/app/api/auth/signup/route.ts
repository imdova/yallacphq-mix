import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { jsonError, zodIssues } from "@/lib/api/route-helpers";
import { signupBodySchema } from "@/lib/api/contracts/auth";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

const ACCESS_TOKEN_COOKIE = "access_token";

function setAccessTokenCookie(res: NextResponse, token: string) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    try {
      const body = signupBodySchema.parse(await req.json());
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-request-id": requestId },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof data?.message === "string" ? data.message : "Signup failed";
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
      setAccessTokenCookie(nextRes, accessToken);
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

  // Fallback: local auth
  const { getUsers, createUser: dbCreateUser } = await import("@/lib/db/users");
  const { setCredential } = await import("@/lib/auth/store");
  const { createSessionValue } = await import("@/lib/auth/session");
  const { setSessionCookie } = await import("@/lib/auth/cookies");

  try {
    const body = signupBodySchema.parse(await req.json());
    const users = await getUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === body.email.toLowerCase()
    );
    if (exists) return jsonError(409, "Email already in use", { requestId });

    const user = await dbCreateUser({
      email: body.email.toLowerCase(),
      name: body.name,
      role: "student",
      ...(body.speciality?.trim() && { speciality: body.speciality.trim() }),
    });

    await setCredential(user.email, user.id, body.password);

    const sessionValue = await createSessionValue({
      uid: user.id,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 8 * 60 * 60 * 1000,
    });

    const res = NextResponse.json(
      { user },
      { status: 201, headers: { "x-request-id": requestId } }
    );
    setSessionCookie(res, sessionValue, { rememberMe: false });
    return res;
  } catch (err) {
    if (err instanceof ZodError)
      return jsonError(400, "Invalid request", {
        issues: zodIssues(err),
        requestId,
      });
    return jsonError(500, "Unexpected error", { requestId });
  }
}
