import { NextResponse } from "next/server";
import { jsonOk } from "@/lib/api/route-helpers";
import { publicCoursesResponseSchema } from "@/lib/api/contracts/course";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getCourses } from "@/lib/db/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (isBackendConfigured()) {
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/courses`, {
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
      console.error("Courses proxy error:", err);
      return NextResponse.json(
        { message: "Failed to load courses" },
        { status: 502 }
      );
    }
  }

  const all = await getCourses();
  const items = all.filter(
    (c) => (c.status ?? "published") === "published"
  );
  return jsonOk(publicCoursesResponseSchema.parse({ items }));
}
