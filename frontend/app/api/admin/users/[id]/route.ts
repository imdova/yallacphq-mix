import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import {
  adminDeleteUserResponseSchema,
  adminUpdateUserBodySchema,
  adminUserNullableResponseSchema,
  adminUserResponseSchema,
} from "@/lib/api/contracts/user";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: { id: string } }
) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/users/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: { cookie: cookieHeader, "x-request-id": requestId },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        const msg = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, msg, { requestId });
      }
      return jsonOk(adminUserNullableResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const user = await db.getUserById(id);
    if (!user) return jsonError(404, "Not found");
    return jsonOk({ user });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } }
) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const raw = await req.json();
      // Normalize: body might be double-encoded (string) from some clients
      const bodyObj =
        typeof raw === "string" ? (JSON.parse(raw) as Record<string, unknown>) : raw;
      if (typeof bodyObj !== "object" || bodyObj === null) {
        return jsonError(400, "Invalid request", {
          issues: [{ message: "Body must be a JSON object", path: [] }],
          requestId,
        });
      }
      const parsed = adminUpdateUserBodySchema.parse(bodyObj);
      // Build plain object and send as JSON string (avoid any non-string serialization)
      const payload: Record<string, unknown> = {};
      if (parsed.name !== undefined) payload.name = parsed.name;
      if (parsed.email !== undefined) payload.email = parsed.email;
      if (parsed.role !== undefined) payload.role = parsed.role;
      if (parsed.phone !== undefined) payload.phone = parsed.phone;
      if (parsed.course !== undefined) payload.course = parsed.course;
      if (parsed.country !== undefined) payload.country = parsed.country;
      if (parsed.speciality !== undefined) payload.speciality = parsed.speciality;
      if (parsed.enrolled !== undefined) payload.enrolled = parsed.enrolled;

      const bodyString = JSON.stringify(payload);
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
          "x-request-id": requestId,
        },
        body: bodyString,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        if (res.status === 400) {
          const message =
            typeof data?.message === "string"
              ? data.message
              : Array.isArray(data?.issues) && data.issues.length > 0
                ? "Validation error"
                : "Invalid request";
          return jsonError(400, message, { issues: data?.issues, requestId });
        }
        const msg = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, msg, { requestId });
      }
      return jsonOk(adminUserResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const body = adminUpdateUserBodySchema.parse(await req.json());
    const updated = await db.updateUser(id, body);
    if (!updated) return jsonError(404, "Not found");
    return jsonOk({ user: updated });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const id = ctx.params.id;
  const requestId = getRequestIdFromRequest(_req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = _req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { cookie: cookieHeader, "x-request-id": requestId },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 404) return jsonError(404, "Not found", { requestId });
        const msg = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, msg, { requestId });
      }
      return jsonOk(adminDeleteUserResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const ok = await db.deleteUser(id);
    if (!ok) return jsonError(404, "Not found");
    return jsonOk({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

