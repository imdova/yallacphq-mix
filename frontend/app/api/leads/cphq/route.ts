import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { leadCreateBodySchema, leadSubmitResponseSchema } from "@/lib/api/contracts/leads";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

const JOBOVA_WEBHOOK_URL = "https://aut.jobova.net/webhook/healthcare-lead";

const PRIMARY_WEBHOOK_URL =
  process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
  process.env.N8N_WEBHOOK_URL ||
  process.env.N8N_HEALTHCARE_LEAD_WEBHOOK_URL ||
  "";

const WEBHOOK_URLS = Array.from(
  new Set([PRIMARY_WEBHOOK_URL, JOBOVA_WEBHOOK_URL].filter(Boolean))
);

async function postWebhookJson(url: string, bodyStr: string): Promise<{
  url: string;
  ok: boolean;
  status?: number;
  text?: string;
  error?: string;
}> {
  try {
    const opts: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyStr,
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    };

    let res = await fetch(url, opts);
    const location = res.headers.get("location");

    // Follow redirect (re-POST to preserve body)
    if (res.status >= 301 && res.status <= 308 && location) {
      const redirectUrl = location.startsWith("http") ? location : new URL(location, url).href;
      res = await fetch(redirectUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
        signal: AbortSignal.timeout(15000),
      });
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { url, ok: false, status: res.status, text };
    }

    return { url, ok: true, status: res.status };
  } catch (err) {
    return { url, ok: false, error: err instanceof Error ? err.message : "Unexpected error" };
  }
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  try {
    const body = leadCreateBodySchema.parse(await req.json());
    if (WEBHOOK_URLS.length === 0) {
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

    const bodyStr = JSON.stringify(payload);

    const results = await Promise.all(WEBHOOK_URLS.map((url) => postWebhookJson(url, bodyStr)));
    const anyOk = results.some((r) => r.ok);

    results
      .filter((r) => !r.ok)
      .forEach((r) => {
        console.error("[leads/cphq]", {
          requestId,
          url: r.url,
          status: r.status,
          error: r.error,
          text: r.text,
        });
      });

    if (anyOk) {
      console.info("[leads/cphq]", { requestId, ok: true, email: body.email });
    }
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    console.error("[leads/cphq]", { requestId, error: err });
    return jsonOk(leadSubmitResponseSchema.parse({ success: true }), { requestId });
  }
}

