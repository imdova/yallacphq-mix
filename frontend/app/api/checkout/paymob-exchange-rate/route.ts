import { jsonOk } from "@/lib/api/route-helpers";

export const dynamic = "force-dynamic";

const CBE_OFFICIAL_EXCHANGE_RATES_URL =
  "https://www.cbe.org.eg/en/economic-research/statistics/cbe-exchange-rates";
const FALLBACK_USD_TO_EGP_RATE =
  Number(process.env.NEXT_PUBLIC_PAYMOB_USD_TO_EGP) || 54.06;
const EXTRA_MARGIN_EGP = Number(process.env.PAYMOB_RATE_EXTRA_EGP) || 2;

function round(value: number, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function htmlToPlainText(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackResponse(reason?: string) {
  return {
    currency: "EGP" as const,
    source: "Fallback configured rate",
    rateDate: null as string | null,
    sourceBuyRate: null as number | null,
    sourceSellRate: null as number | null,
    extraMarginEgp: EXTRA_MARGIN_EGP,
    appliedRate: FALLBACK_USD_TO_EGP_RATE,
    isFallback: true,
    ...(reason ? { fallbackReason: reason } : {}),
  };
}

export async function GET() {
  try {
    const res = await fetch(CBE_OFFICIAL_EXCHANGE_RATES_URL, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return jsonOk(fallbackResponse(`CBE responded with ${res.status}`));
    }

    const html = await res.text();
    const text = htmlToPlainText(html);

    const usdMatch = text.match(
      /US Dollar\s+([0-9]+(?:\.[0-9]+)?)\s+([0-9]+(?:\.[0-9]+)?)/i
    );
    const rateDate =
      text.match(/Rates for Date:\s*([0-9/]+)/i)?.[1] ??
      text.match(/Last Updated:\s*([0-9]{1,2}\s+\w+\s+[0-9]{4})/i)?.[1] ??
      null;

    if (!usdMatch) {
      return jsonOk(fallbackResponse("Could not parse USD row from CBE page"));
    }

    const sourceBuyRate = Number(usdMatch[1]);
    const sourceSellRate = Number(usdMatch[2]);

    if (!Number.isFinite(sourceBuyRate) || !Number.isFinite(sourceSellRate)) {
      return jsonOk(fallbackResponse("CBE returned a non-numeric USD rate"));
    }

    return jsonOk({
      currency: "EGP" as const,
      source: "CBE Official Exchange Rates",
      rateDate,
      sourceBuyRate: round(sourceBuyRate),
      sourceSellRate: round(sourceSellRate),
      extraMarginEgp: EXTRA_MARGIN_EGP,
      appliedRate: round(sourceSellRate + EXTRA_MARGIN_EGP),
      isFallback: false,
    });
  } catch (error) {
    return jsonOk(
      fallbackResponse(error instanceof Error ? error.message : "Unknown error")
    );
  }
}
