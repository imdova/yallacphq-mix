import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api/route-helpers";
import { publicCoursesResponseSchema } from "@/lib/api/contracts/course";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";
import { getCourseById, getRelatedCourses } from "@/lib/db/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getLimit(req: Request) {
  const url = new URL(req.url);
  const value = Number(url.searchParams.get("limit") ?? "4");
  if (!Number.isFinite(value)) return 4;
  return Math.max(1, Math.min(12, value));
}

export async function GET(
  req: Request,
  ctx: { params: { id: string } }
) {
  const { id } = ctx.params;
  const limit = getLimit(req);

  if (isBackendConfigured()) {
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(
        `${backendUrl}${BACKEND_API_PREFIX}/courses/${encodeURIComponent(id)}/related?limit=${encodeURIComponent(String(limit))}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (res.status === 404 || !res.ok) {
        return jsonError(404, "Not found");
      }
      const parsed = publicCoursesResponseSchema.safeParse(data);
      if (parsed.success) return NextResponse.json(parsed.data);
      return NextResponse.json(data, { status: 200 });
    } catch (err) {
      console.error("Related courses proxy error:", err);
      return NextResponse.json(
        { message: "Failed to load related courses" },
        { status: 502 }
      );
    }
  }

  const course = await getCourseById(id);
  if (!course || (course.status ?? "published") !== "published") {
    return jsonError(404, "Not found");
  }
  const items = await getRelatedCourses(id, limit);
  return jsonOk(publicCoursesResponseSchema.parse({ items }));
}
