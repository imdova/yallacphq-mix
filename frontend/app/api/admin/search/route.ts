import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { adminSearchResponseSchema } from "@/lib/api/contracts/search";
import { listCoursesResponseSchema } from "@/lib/api/contracts/course";
import { listOrdersResponseSchema } from "@/lib/api/contracts/order";
import { listUsersResponseSchema } from "@/lib/api/contracts/user";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireAdmin } from "@/lib/auth/server";
import * as dbUsers from "@/lib/db/users";
import * as dbCourses from "@/lib/db/courses";
import * as dbOrders from "@/lib/db/orders";

export const dynamic = "force-dynamic";

const MAX_PER_SECTION = 5;

function filterCoursesByQuery(items: { title?: string; tag?: string; instructorName?: string }[], q: string): typeof items {
  if (!q) return items.slice(0, MAX_PER_SECTION);
  const lower = q.toLowerCase();
  return items
    .filter(
      (c) =>
        c.title?.toLowerCase().includes(lower) ||
        c.tag?.toLowerCase().includes(lower) ||
        c.instructorName?.toLowerCase().includes(lower)
    )
    .slice(0, MAX_PER_SECTION);
}

function filterOrdersByQuery(
  items: { studentName?: string; studentEmail?: string; courseTitle?: string }[],
  q: string
): typeof items {
  if (!q) return items.slice(0, MAX_PER_SECTION);
  const lower = q.toLowerCase();
  return items
    .filter(
      (o) =>
        o.studentName?.toLowerCase().includes(lower) ||
        o.studentEmail?.toLowerCase().includes(lower) ||
        o.courseTitle?.toLowerCase().includes(lower)
    )
    .slice(0, MAX_PER_SECTION);
}

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();
  const url = new URL(req.url ?? "", "http://localhost");
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const [usersRes, coursesRes, ordersRes] = await Promise.all([
        fetch(
          `${backendUrl}${BACKEND_API_PREFIX}/admin/users${q ? `?search=${encodeURIComponent(q)}` : ""}`,
          { headers: { cookie: cookieHeader, "x-request-id": requestId } }
        ),
        fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/courses`, {
          headers: { cookie: cookieHeader, "x-request-id": requestId },
        }),
        fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/orders`, {
          headers: { cookie: cookieHeader, "x-request-id": requestId },
        }),
      ]);
      const [usersData, coursesData, ordersData] = await Promise.all([
        usersRes.json().catch(() => ({ items: [] })),
        coursesRes.json().catch(() => ({ items: [] })),
        ordersRes.json().catch(() => ({ items: [] })),
      ]);
      const students = usersRes.ok ? listUsersResponseSchema.parse(usersData).items : [];
      const allCourses = coursesRes.ok ? listCoursesResponseSchema.parse(coursesData).items : [];
      const allOrders = ordersRes.ok ? listOrdersResponseSchema.parse(ordersData).items : [];
      const courses = filterCoursesByQuery(allCourses, q);
      const orders = filterOrdersByQuery(allOrders, q);
      const payload = adminSearchResponseSchema.parse({
        students: students.slice(0, MAX_PER_SECTION),
        courses,
        orders,
      });
      return jsonOk(payload, { requestId });
    } catch (err) {
      if (err instanceof ZodError)
        return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    let students: Awaited<ReturnType<typeof dbUsers.getUsers>> = [];
    let courses: Awaited<ReturnType<typeof dbCourses.getCourses>> = [];
    let orders: Awaited<ReturnType<typeof dbOrders.fetchOrders>> = [];
    const lower = q.toLowerCase();
    [students, courses, orders] = await Promise.all([
      dbUsers.getUsers().then((list) =>
        q
          ? list.filter(
              (u) =>
                u.name?.toLowerCase().includes(lower) ||
                u.email?.toLowerCase().includes(lower) ||
                u.phone?.toLowerCase().includes(lower)
            )
          : list
      ),
      dbCourses.getCourses(),
      dbOrders.fetchOrders(),
    ]);
    const filteredCourses = filterCoursesByQuery(courses, q);
    const filteredOrders = filterOrdersByQuery(orders, q);
    const payload = adminSearchResponseSchema.parse({
      students: students.slice(0, MAX_PER_SECTION),
      courses: filteredCourses,
      orders: filteredOrders,
    });
    return jsonOk(payload, { requestId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    if (err instanceof ZodError) return jsonError(400, "Invalid response", { issues: zodIssues(err) });
    return jsonError(500, "Unexpected error");
  }
}
