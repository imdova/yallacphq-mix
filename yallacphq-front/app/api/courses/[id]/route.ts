import { jsonError, jsonOk } from "@/lib/api/route-helpers";
import { publicCourseResponseSchema } from "@/lib/api/contracts/course";
import { getCourseById } from "@/lib/db/courses";

export const revalidate = 60;

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const course = await getCourseById(ctx.params.id);
  if (!course) return jsonError(404, "Not found");
  if ((course.visibility ?? "public") !== "public" || (course.status ?? "published") !== "published") {
    return jsonError(404, "Not found");
  }
  return jsonOk(publicCourseResponseSchema.parse({ course }));
}

