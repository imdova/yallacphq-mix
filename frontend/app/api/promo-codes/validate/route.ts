import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { validatePromoCodeBodySchema, validatePromoCodeResponseSchema } from "@/lib/api/contracts/promo";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getCourses } from "@/lib/db/courses";
import { fetchPromoCodes } from "@/lib/db/promo-codes";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError(400, "Invalid JSON", { requestId });
    }
    const parsed = validatePromoCodeBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "Invalid request", { issues: zodIssues(parsed.error), requestId });
    }
    try {
      const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/promo-codes/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
          "x-request-id": requestId,
        },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = (data?.message as string) ?? "Invalid promo code";
        return jsonError(res.status === 400 ? 400 : 404, message, { requestId });
      }
      const out = validatePromoCodeResponseSchema.safeParse(data);
      if (!out.success) return jsonError(500, "Invalid response", { requestId });
      return jsonOk(out.data, { requestId });
    } catch (e) {
      console.error("[promo-validate]", { requestId, error: e });
      return jsonError(500, "Promo validation failed", { requestId });
    }
  }

  try {
    const body = validatePromoCodeBodySchema.parse(await req.json());
    const code = body.code.trim().toUpperCase();

    const promos = await fetchPromoCodes();
    const promo = promos.find((p) => p.code.toUpperCase() === code);
    if (!promo) {
      console.info("[promo-validate]", { requestId, ok: false, reason: "not_found", code, courseId: body.courseId });
      return jsonError(404, "Promo code not found", { requestId });
    }
    if (!promo.active) {
      console.info("[promo-validate]", { requestId, ok: false, reason: "inactive", code, courseId: body.courseId });
      return jsonError(400, "Promo code is inactive", { requestId });
    }
    if (promo.maxUsageEnabled && promo.maxUsage != null && promo.usageCount >= promo.maxUsage) {
      console.info("[promo-validate]", { requestId, ok: false, reason: "max_usage", code, courseId: body.courseId });
      return jsonError(400, "Promo code usage limit reached", { requestId });
    }
    if (promo.restrictToProductEnabled && promo.productId && promo.productId !== body.courseId) {
      console.info("[promo-validate]", { requestId, ok: false, reason: "wrong_course", code, courseId: body.courseId });
      return jsonError(400, "Promo code is not valid for this course", { requestId });
    }

    const courses = await getCourses();
    const course = courses.find((c) => c.id === body.courseId);
    if (!course) return jsonError(404, "Course not found", { requestId });

    const base = Math.max(0, course.priceSale ?? course.priceRegular ?? 0);
    const discountAmount =
      promo.discountType === "percentage"
        ? Math.max(0, Math.round((base * promo.discountValue) / 100))
        : Math.max(0, Math.round(promo.discountValue));
    const discountedTotal = Math.max(0, base - discountAmount);

    console.info("[promo-validate]", { requestId, ok: true, code, courseId: body.courseId });
    return jsonOk(
      validatePromoCodeResponseSchema.parse({
        ok: true,
        promo,
        discountAmount,
        discountedTotal,
      }),
      { requestId }
    );
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    console.error("[promo-validate]", { requestId, error: err });
    return jsonError(500, "Unexpected error", { requestId });
  }
}

