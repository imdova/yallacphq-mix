import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { validatePromoCodeBodySchema, validatePromoCodeResponseSchema } from "@/lib/api/contracts/promo";
import { getCourses } from "@/lib/db/courses";
import { fetchPromoCodes } from "@/lib/db/promo-codes";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
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

