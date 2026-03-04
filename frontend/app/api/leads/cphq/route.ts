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
      // don't block UX if webhook isn't configured
      console.error("[leads/cphq]", { requestId, message: "Missing webhook env var" });
      return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
    }

    const now = new Date();
    const payload = {
      ...body,
      timestamp: now.toISOString(),
      source: "offer",
    };

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      // keep same UX behavior as existing lead routes (accept, log)
      const text = await res.text().catch(() => "");
      console.error("[leads/cphq]", { requestId, status: res.status, text });
      return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
    }

    console.info("[leads/cphq]", { requestId, ok: true, email: body.email });
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    console.error("[leads/cphq]", { requestId, error: err });
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  }
}

