import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { webinarLeadCreateBodySchema, leadSubmitResponseSchema } from "@/lib/api/contracts/leads";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

const WEBHOOK_URL =
  process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
  process.env.N8N_WEBHOOK_URL ||
  process.env.N8N_HEALTHCARE_LEAD_WEBHOOK_URL ||
  "";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  try {
    const body = webinarLeadCreateBodySchema.parse(await req.json());

    if (isBackendConfigured()) {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/leads/webinar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-request-id": requestId,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 400) {
          return jsonError(400, "Invalid request", { issues: data?.issues, requestId });
        }
        const message = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, message, { requestId });
      }
      return jsonOk(leadSubmitResponseSchema.parse(data), { requestId });
    }

    if (!WEBHOOK_URL) {
      console.error("[leads/webinar]", { requestId, message: "Missing webhook env var" });
      return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
    }

    const payload = {
      ...body,
      timestamp: new Date().toISOString(),
      source: "webinar",
    };

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[leads/webinar]", { requestId, status: res.status, text });
      return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
    }

    console.info("[leads/webinar]", { requestId, ok: true, email: body.email });
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    console.error("[leads/webinar]", { requestId, error: err });
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  }
}

