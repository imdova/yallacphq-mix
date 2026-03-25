import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { listWebinarsResponseSchema } from "@/lib/api/contracts/webinar";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  if (!isBackendConfigured()) {
    return jsonOk(listWebinarsResponseSchema.parse({ items: [] }), { requestId });
  }

  const backendUrl = getBackendUrl();

  try {
    const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/webinars`, {
      method: "GET",
      headers: { "x-request-id": requestId },
      next: { revalidate: 30 },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(listWebinarsResponseSchema.parse(data), { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}
