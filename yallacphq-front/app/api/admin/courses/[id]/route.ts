import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { updateCourseBodySchema } from "@/lib/api/contracts/course";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();
    const course = await db.getCourseById(ctx.params.id);
    if (!course) return jsonError(404, "Not found");
    return jsonOk({ course });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = updateCourseBodySchema.parse(await req.json());
    const updated = await db.updateCourse(ctx.params.id, body);
    if (!updated) return jsonError(404, "Not found");
    return jsonOk({ course: updated });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    await requireAdmin();
    const ok = await db.deleteCourse(ctx.params.id);
    if (!ok) return jsonError(404, "Not found");
    return jsonOk({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

