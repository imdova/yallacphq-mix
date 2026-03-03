import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { enrollCourseBodySchema, enrollCourseResponseSchema } from "@/lib/api/contracts/course";
import { requireSession } from "@/lib/auth/server";
import { getCourseById, updateCourse } from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    await requireSession();
    enrollCourseBodySchema.parse(await req.json().catch(() => ({})));

    const course = await getCourseById(ctx.params.id);
    if (!course) return jsonError(404, "Not found");
    if ((course.visibility ?? "public") !== "public" || (course.status ?? "published") !== "published") {
      return jsonError(404, "Not found");
    }

    const nextCount = (course.enrolledCount ?? 0) + 1;
    const updated = await updateCourse(course.id, { enrolledCount: nextCount });

    return jsonOk(enrollCourseResponseSchema.parse({ ok: true, enrolledCount: updated?.enrolledCount ?? nextCount }));
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    return jsonError(500, "Unexpected error");
  }
}

