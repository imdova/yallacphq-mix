import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { enrollCourseBodySchema, enrollCourseResponseSchema } from "@/lib/api/contracts/course";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireSession } from "@/lib/auth/server";
import { getCourseById, updateCourse } from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  const courseId = ctx.params.id;

  if (isBackendConfigured()) {
    // Forward to backend with cookies (access_token or yalla_session). Backend validates JWT.
    const cookieHeader = req.headers.get("cookie") ?? "";
    try {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        body = {};
      }
      // Ensure we always send a JSON object (never undefined, string, or array)
      const safeBody =
        body != null && typeof body === "object" && !Array.isArray(body)
          ? body
          : {};
      const parsed = enrollCourseBodySchema.safeParse(safeBody);
      if (!parsed.success) {
        return jsonError(400, "Invalid request", {
          issues: parsed.error.issues,
          requestId,
        });
      }
      const res = await fetch(
        `${getBackendUrl()}${BACKEND_API_PREFIX}/courses/${encodeURIComponent(courseId)}/enroll`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: cookieHeader,
            "x-request-id": requestId,
          },
          body: JSON.stringify(parsed.data),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return jsonError(
          res.status === 401 ? 401 : res.status,
          (data?.message as string) ?? "Enroll failed",
          { requestId }
        );
      }
      return jsonOk(
        enrollCourseResponseSchema.parse({ ok: true, enrolledCount: data.enrolledCount }),
        { requestId }
      );
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid request", {
          issues: zodIssues(err),
          requestId,
        });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireSession();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const safeBody =
      body != null && typeof body === "object" && !Array.isArray(body)
        ? body
        : {};
    const parsed = enrollCourseBodySchema.safeParse(safeBody);
    if (!parsed.success) {
      return jsonError(400, "Invalid request", {
        issues: parsed.error.issues,
        requestId,
      });
    }

    const course = await getCourseById(courseId);
    if (!course) return jsonError(404, "Not found", { requestId });
    if ((course.status ?? "published") !== "published") {
      return jsonError(404, "Not found", { requestId });
    }

    const nextCount = (course.enrolledCount ?? 0) + 1;
    const updated = await updateCourse(course.id, { enrolledCount: nextCount });

    return jsonOk(
      enrollCourseResponseSchema.parse({ ok: true, enrolledCount: updated?.enrolledCount ?? nextCount }),
      { requestId }
    );
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED", { requestId });
    return jsonError(500, "Unexpected error", { requestId });
  }
}

