import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { resendVerificationBodySchema } from "@/lib/api/contracts/auth";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isBackendConfigured()) {
    return jsonError(501, "Verification email requires the backend");
  }

  try {
    const body = resendVerificationBodySchema.parse(await req.json());
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        typeof data?.message === "string" ? data.message : "Resend failed";
      return Response.json(
        { message, ...(data?.issues && { issues: data.issues }) },
        { status: res.status }
      );
    }

    return jsonOk({ success: true as const });
  } catch (err) {
    if (err instanceof ZodError)
      return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    return jsonError(500, "Unexpected error");
  }
}
