import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { resetPasswordBodySchema } from "@/lib/api/contracts/auth";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (isBackendConfigured()) {
    try {
      const body = resetPasswordBodySchema.parse(await req.json());
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof data?.message === "string"
            ? data.message
            : "Reset failed";
        return Response.json(
          { message, ...(data?.issues && { issues: data.issues }) },
          { status: res.status }
        );
      }

      return jsonOk({ ok: true });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid request", { issues: zodIssues(err) });
      return jsonError(500, "Unexpected error");
    }
  }

  const { consumeResetToken, setCredential } = await import("@/lib/auth/store");
  const { getUsers } = await import("@/lib/db/users");

  try {
    const body = resetPasswordBodySchema.parse(await req.json());
    const email = await consumeResetToken(body.token);
    if (!email) return jsonError(400, "Invalid or expired token");

    const users = await getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) return jsonError(400, "Invalid token");

    await setCredential(user.email, user.id, body.newPassword);
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof ZodError)
      return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    return jsonError(500, "Unexpected error");
  }
}
