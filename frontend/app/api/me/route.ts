import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { updateCurrentUserBodySchema, currentUserResponseSchema } from "@/lib/api/contracts/user";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/auth/me`, {
        method: "GET",
        headers: { cookie: cookieHeader, "x-request-id": requestId },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return jsonError(401, "UNAUTHENTICATED", { requestId });
      }
      if (data?.user == null) {
        return jsonError(401, "UNAUTHENTICATED", { requestId });
      }
      return jsonOk(currentUserResponseSchema.parse({ user: data.user }), { requestId });
    } catch {
      return jsonError(401, "UNAUTHENTICATED", { requestId });
    }
  }

  try {
    const { requireCurrentUser } = await import("@/lib/auth/getCurrentUser");
    const user = await requireCurrentUser();
    return jsonOk(currentUserResponseSchema.parse({ user }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    return jsonError(500, "Unexpected error");
  }
}

export async function PATCH(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const body = await req.json();
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
          "x-request-id": requestId,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return jsonError(res.status === 401 ? 401 : 400, "Update failed", { requestId });
      }
      return jsonOk(currentUserResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    const { requireCurrentUser } = await import("@/lib/auth/getCurrentUser");
    const current = await requireCurrentUser();
    const body = updateCurrentUserBodySchema.parse(await req.json());
    const { updateUser } = await import("@/lib/db/users");
    const updated = await updateUser(current.id, body);
    if (!updated) return jsonError(404, "Not found");
    return jsonOk(currentUserResponseSchema.parse({ user: updated }));
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    return jsonError(500, "Unexpected error");
  }
}

