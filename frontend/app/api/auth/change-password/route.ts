import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { changePasswordBodySchema, changePasswordResponseSchema } from "@/lib/api/contracts/auth";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const rawBody = await req.text();
      if (!rawBody?.trim()) {
        return jsonError(400, "Request body is required.", {
          issues: [{ message: "Send JSON with currentPassword and newPassword", path: [] }],
          requestId,
        });
      }
      const parsed = JSON.parse(rawBody) as unknown;
      changePasswordBodySchema.parse(parsed);

      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
          "x-request-id": requestId,
        },
        body: rawBody,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof data?.message === "string" ? data.message : "Current password may be incorrect.";
        const issues = Array.isArray(data?.issues) ? data.issues : undefined;
        return jsonError(res.status === 401 ? 401 : 400, message, {
          requestId,
          ...(issues?.length ? { issues } : {}),
        });
      }
      return jsonOk(changePasswordResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError) {
        return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
      }
      if (err instanceof SyntaxError) {
        return jsonError(400, "Invalid JSON body.", { requestId });
      }
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  return jsonError(501, "Change password is only available when backend is configured", {
    requestId,
  });
}
