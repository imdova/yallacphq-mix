import { jsonOk } from "@/lib/api/route-helpers";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isBackendConfigured()) {
    try {
      const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/checkout/paymob-methods`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const data = await res.json().catch(() => []);
      if (Array.isArray(data) && data.every((m: unknown) => m && typeof m === "object" && "type" in m && "label" in m)) {
        return jsonOk(data);
      }
      return jsonOk([]);
    } catch {
      return jsonOk([]);
    }
  }
  return jsonOk([]);
}
