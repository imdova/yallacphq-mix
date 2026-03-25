import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { webinarResponseSchema } from "@/lib/api/contracts/webinar";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: { slug: string } }) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  if (!isBackendConfigured()) {
    return jsonError(404, "Not found", { requestId });
  }

  const backendUrl = getBackendUrl();

  try {
    const res = await fetch(
      `${backendUrl}${BACKEND_API_PREFIX}/webinars/${encodeURIComponent(ctx.params.slug)}`,
      {
        method: "GET",
        headers: { "x-request-id": requestId },
        next: { revalidate: 30 },
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) return jsonError(404, "Not found", { requestId });
      const message = typeof data?.message === "string" ? data.message : "Backend error";
      return jsonError(res.status, message, { requestId });
    }
    return jsonOk(webinarResponseSchema.parse(data), { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
    }
    return jsonError(500, "Unexpected error", { requestId });
  }
}
