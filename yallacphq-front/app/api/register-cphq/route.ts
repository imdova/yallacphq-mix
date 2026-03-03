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

    const payload = { name, email, phone, specialty, timestamp };
    const bodyStr = JSON.stringify(payload);
    const opts: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyStr,
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    };

    if (!N8N_WEBHOOK_URL) {
      console.error("[register-cphq]", { requestId, message: "Missing N8N_WEBHOOK_URL env var" });
      return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
    }

    let res = await fetch(N8N_WEBHOOK_URL, opts);
    const location = res.headers.get("location");

    // Follow redirect (re-POST to preserve body)
    if (res.status >= 301 && res.status <= 308 && location) {
      const redirectUrl = location.startsWith("http") ? location : new URL(location, N8N_WEBHOOK_URL).href;
      res = await fetch(redirectUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
        signal: AbortSignal.timeout(15000),
      });
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("[register-cphq]", { requestId, status: res.status, text });
      // Still return success so user is not blocked; webhook failure is logged
      return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
    }

    console.info("[register-cphq]", { requestId, ok: true, email });
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  } catch (e) {
    if (e instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(e), requestId });
    console.error("[register-cphq]", { requestId, error: e });
    // Timeout or network error calling n8n: accept registration and log
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  }
}
