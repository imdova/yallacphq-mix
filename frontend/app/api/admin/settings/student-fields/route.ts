import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import {
  studentFieldOptionsResponseSchema,
  updateStudentFieldOptionsBodySchema,
} from "@/lib/api/contracts/settings";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/student-field-options";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const res = await fetch(
        `${backendUrl}${BACKEND_API_PREFIX}/admin/settings/student-fields`,
        { headers: { cookie: cookieHeader, "x-request-id": requestId } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        const msg = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, msg, { requestId });
      }
      return jsonOk(studentFieldOptionsResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const options = db.getStudentFieldOptions();
    return jsonOk(studentFieldOptionsResponseSchema.parse(options), { requestId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function PATCH(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const body = updateStudentFieldOptionsBodySchema.parse(await req.json());
      const res = await fetch(
        `${backendUrl}${BACKEND_API_PREFIX}/admin/settings/student-fields`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            cookie: cookieHeader,
            "x-request-id": requestId,
          },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 400)
          return jsonError(400, "Invalid request", { issues: data?.issues, requestId });
        const message = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, message, { requestId });
      }
      return jsonOk(studentFieldOptionsResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const body = updateStudentFieldOptionsBodySchema.parse(await req.json());
    const options = db.updateStudentFieldOptions(body);
    return jsonOk(studentFieldOptionsResponseSchema.parse(options), { requestId });
  } catch (err) {
    if (err instanceof ZodError)
      return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}
