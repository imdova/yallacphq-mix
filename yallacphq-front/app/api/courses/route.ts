import { jsonOk } from "@/lib/api/route-helpers";
import { publicCoursesResponseSchema } from "@/lib/api/contracts/course";
import { getCourses } from "@/lib/db/courses";

export const revalidate = 60;

export async function GET() {
  const all = await getCourses();
  const items = all.filter((c) => (c.visibility ?? "public") === "public" && (c.status ?? "published") === "published");
  return jsonOk(publicCoursesResponseSchema.parse({ items }));
}

