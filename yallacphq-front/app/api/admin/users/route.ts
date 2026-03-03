import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { createUserBodySchema, listUsersResponseSchema } from "@/lib/api/contracts/user";
import { requireAdmin } from "@/lib/auth/server";
import * as db from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const items = await db.getUsers();
    // Keep response stable and validated (defensive).
    return jsonOk(listUsersResponseSchema.parse({ items }));
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

