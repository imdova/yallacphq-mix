import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { leadCreateBodySchema, leadSubmitResponseSchema } from "@/lib/api/contracts/leads";
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
    const body = leadCreateBodySchema.parse(await req.json());
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

