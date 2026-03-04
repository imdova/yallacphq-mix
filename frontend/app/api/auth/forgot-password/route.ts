import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { forgotPasswordBodySchema } from "@/lib/api/contracts/auth";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (isBackendConfigured()) {
    try {
      const body = forgotPasswordBodySchema.parse(await req.json());
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof data?.message === "string"
            ? data.message
            : "Request failed";
        return Response.json(
          { message, ...(data?.issues && { issues: data.issues }) },
          { status: res.status }
        );
      }

      return jsonOk({
        success: true as const,
        ...(data?.token !== undefined && { token: data.token }),
      });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid request", { issues: zodIssues(err) });
      return jsonError(500, "Unexpected error");
    }
  }

  const { createResetToken } = await import("@/lib/auth/store");
  const { getUsers } = await import("@/lib/db/users");

  try {
    const body = forgotPasswordBodySchema.parse(await req.json());
    const users = await getUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === body.email.toLowerCase()
    );

    if (!exists) return jsonOk({ success: true });

    const token = await createResetToken(body.email);
    return jsonOk({
      success: true,
      ...(process.env.NODE_ENV === "production" ? {} : { token }),
    });
  } catch (err) {
    if (err instanceof ZodError)
      return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    return jsonError(500, "Unexpected error");
  }
}
