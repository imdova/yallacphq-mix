import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { jsonError, zodIssues } from "@/lib/api/route-helpers";
import { loginBodySchema } from "@/lib/api/contracts/auth";
import { verifyCredential } from "@/lib/auth/store";
import { createSessionValue } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { getUserById } from "@/lib/db/users";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  try {
    const body = loginBodySchema.parse(await req.json());
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

