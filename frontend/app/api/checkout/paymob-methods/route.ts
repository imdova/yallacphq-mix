import { jsonOk } from "@/lib/api/route-helpers";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isBackendConfigured()) {
    try {
      const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/checkout/paymob-methods`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const data = await res.json().catch(() => []);
      const filtered = Array.isArray(data)
        ? data.filter(
            (
              m
            ): m is {
              type: "card" | "ewallet" | "kiosk";
              label: string;
            } =>
              !!m &&
              typeof m === "object" &&
              "type" in m &&
              "label" in m &&
              typeof m.type === "string" &&
              typeof m.label === "string" &&
              ["card", "ewallet", "kiosk"].includes(m.type)
          )
        : [];
      return jsonOk(filtered);
    } catch {
      return jsonOk([]);
    }
  }
  return jsonOk([]);
}
