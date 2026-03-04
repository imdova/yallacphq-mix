import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { ZodError } from "zod";
import { legacyLeadCreateBodySchema, leadSubmitResponseSchema } from "@/lib/api/contracts/leads";

const N8N_WEBHOOK_URL =
  process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
  process.env.N8N_WEBHOOK_URL ||
  process.env.N8N_HEALTHCARE_LEAD_WEBHOOK_URL ||
  "";

export async function POST(request: Request) {
  const requestId = getRequestIdFromRequest(request) ?? newRequestId();
  try {
    const body = legacyLeadCreateBodySchema.parse(await request.json());
    const name = body.name.trim();
    const email = body.email.trim();
    const phone = body.phone.trim();
    const specialty = body.specialty.trim();

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timestamp = `${day}-${month}-${year} at ${hours}:${minutes}`;

    const payload = {
      name,
      email,
      phone,
      specialty,
      timestamp,
      source: "webinar",
    };
    const bodyStr = JSON.stringify(payload);
    if (!N8N_WEBHOOK_URL) {
      console.error("[webinar-register]", { requestId, message: "Missing N8N_WEBHOOK_URL env var" });
      return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
    }

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyStr,
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });

    const location = res.headers.get("location");
    let finalRes = res;
    if (res.status >= 301 && res.status <= 308 && location) {
      const redirectUrl = location.startsWith("http") ? location : new URL(location, N8N_WEBHOOK_URL).href;
      finalRes = await fetch(redirectUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
        signal: AbortSignal.timeout(15000),
      });
    }

    if (!finalRes.ok) {
      const text = await finalRes.text();
      console.error("[webinar-register]", { requestId, status: finalRes.status, text });
      return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
    }
    console.info("[webinar-register]", { requestId, ok: true, email });
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(e), requestId });
    console.error("[webinar-register]", { requestId, error: e });
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  }
}
