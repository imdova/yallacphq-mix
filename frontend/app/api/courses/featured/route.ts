import { NextResponse } from "next/server";
import { jsonOk } from "@/lib/api/route-helpers";
import { publicCoursesResponseSchema } from "@/lib/api/contracts/course";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";
import { getFeaturedCourses } from "@/lib/db/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getLimit(req: Request) {
  const url = new URL(req.url);
  const value = Number(url.searchParams.get("limit") ?? "12");
  if (!Number.isFinite(value)) return 12;
  return Math.max(1, Math.min(24, value));
}

export async function GET(req: Request) {
  const limit = getLimit(req);

  if (isBackendConfigured()) {
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/courses/featured?limit=${encodeURIComponent(String(limit))}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
      }
      const parsed = publicCoursesResponseSchema.safeParse(data);
      if (parsed.success) return NextResponse.json(parsed.data);
      return NextResponse.json(data, { status: 200 });
    } catch (err) {
      console.error("Featured courses proxy error:", err);
      return NextResponse.json(
        { message: "Failed to load featured courses" },
        { status: 502 }
      );
    }
  }

  const items = await getFeaturedCourses(limit);
  return jsonOk(publicCoursesResponseSchema.parse({ items }));
}
