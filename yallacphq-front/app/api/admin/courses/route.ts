import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { createCourseBodySchema, listCoursesResponseSchema } from "@/lib/api/contracts/course";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const items = await db.getCourses();
    return jsonOk(listCoursesResponseSchema.parse({ items }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = createCourseBodySchema.parse(await req.json());
    const course = await db.createCourse(body);
    return jsonOk({ course }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

