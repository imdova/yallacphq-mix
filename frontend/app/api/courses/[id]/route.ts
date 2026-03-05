import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api/route-helpers";
import { publicCourseResponseSchema } from "@/lib/api/contracts/course";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getCourseById } from "@/lib/db/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const { id } = ctx.params;

  if (isBackendConfigured()) {
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/courses/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404 || !res.ok) {
        return jsonError(404, "Not found");
      }
      const parsed = publicCourseResponseSchema.safeParse(data);
      if (parsed.success) return NextResponse.json(parsed.data);
      return NextResponse.json(data, { status: 200 });
    } catch (err) {
      console.error("Course proxy error:", err);
      return NextResponse.json(
        { message: "Failed to load course" },
        { status: 502 }
      );
    }
  }

  const course = await getCourseById(id);
  if (!course) return jsonError(404, "Not found");
  if (
    (course.status ?? "published") !== "published"
  ) {
    return jsonError(404, "Not found");
  }
  return jsonOk(publicCourseResponseSchema.parse({ course }));
}
