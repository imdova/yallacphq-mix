import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { jsonError, zodIssues } from "@/lib/api/route-helpers";
import { signupBodySchema } from "@/lib/api/contracts/auth";
import { getUsers, createUser as dbCreateUser } from "@/lib/db/users";
import { setCredential } from "@/lib/auth/store";
import { createSessionValue } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  try {
    const body = signupBodySchema.parse(await req.json());
    const users = await getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (exists) return jsonError(409, "Email already in use", { requestId });

    const user = await dbCreateUser({
      email: body.email.toLowerCase(),
      name: body.name,
      role: "member",
    });

    await setCredential(user.email, user.id, body.password);

    const sessionValue = await createSessionValue({
      uid: user.id,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 8 * 60 * 60 * 1000,
    });

    const res = NextResponse.json({ user }, { status: 201, headers: { "x-request-id": requestId } });
    setSessionCookie(res, sessionValue, { rememberMe: false });
    return res;
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    return jsonError(500, "Unexpected error", { requestId });
  }
}

