import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { createUserBodySchema, listUsersResponseSchema } from "@/lib/api/contracts/user";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    const url = new URL(req.url ?? "", "http://localhost");
    const search = url.searchParams.get("search") ?? "";
    const country = url.searchParams.get("country") ?? "";
    const speciality = url.searchParams.get("speciality") ?? "";
    const enrollment = url.searchParams.get("enrollment") ?? "";
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (country) query.set("country", country);
    if (speciality) query.set("speciality", speciality);
    if (enrollment) query.set("enrollment", enrollment);
    const queryString = query.toString();
    const backendPath = `${backendUrl}${BACKEND_API_PREFIX}/admin/users${queryString ? `?${queryString}` : ""}`;
    try {
      const res = await fetch(backendPath, {
        method: "GET",
        headers: { cookie: cookieHeader, "x-request-id": requestId },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        const msg = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, msg, { requestId });
      }
      return jsonOk(listUsersResponseSchema.parse(data), { requestId });
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, "Invalid response", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    let items = await db.getUsers();
    const url = new URL(req.url ?? "", "http://localhost");
    const search = url.searchParams.get("search")?.trim() ?? "";
    const country = url.searchParams.get("country")?.trim() ?? "";
    const speciality = url.searchParams.get("speciality")?.trim() ?? "";
    const enrollment = url.searchParams.get("enrollment") ?? "";
    if (search || country || speciality || (enrollment && enrollment !== "all")) {
      const q = search.toLowerCase();
      items = items.filter((u) => {
        if (q && !(u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q)))
          return false;
        if (country && (u.country?.trim() ?? "") !== country) return false;
        if (speciality && (u.speciality?.trim() ?? "") !== speciality) return false;
        if (enrollment === "enrolled" && !u.enrolled) return false;
        if (enrollment === "not_enrolled" && u.enrolled) return false;
        return true;
      });
    }
    return jsonOk(listUsersResponseSchema.parse({ items }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const backendUrl = getBackendUrl();
    try {
      const body = createUserBodySchema.parse(await req.json());
      const res = await fetch(`${backendUrl}${BACKEND_API_PREFIX}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
          "x-request-id": requestId,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
        if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
        if (res.status === 400) return jsonError(400, "Invalid request", { issues: data?.issues, requestId });
        const message = typeof data?.message === "string" ? data.message : "Backend error";
        return jsonError(res.status, message, { requestId });
      }
      return jsonOk({ user: data.user }, { status: 201, requestId });
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
      return jsonError(500, "Unexpected error", { requestId });
    }
  }

  try {
    await requireAdmin();
    const body = createUserBodySchema.parse(await req.json());
    const user = await db.createUser(body);
    return jsonOk({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    if (msg === "FORBIDDEN") return jsonError(403, "FORBIDDEN");
    return jsonError(500, "Unexpected error");
  }
}

