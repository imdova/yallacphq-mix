import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { updateCurrentUserBodySchema, currentUserResponseSchema } from "@/lib/api/contracts/user";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { updateUser } from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    return jsonOk(currentUserResponseSchema.parse({ user }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    return jsonError(500, "Unexpected error");
  }
}

export async function PATCH(req: Request) {
  try {
    const current = await requireCurrentUser();
    const body = updateCurrentUserBodySchema.parse(await req.json());
    const updated = await updateUser(current.id, body);
    if (!updated) return jsonError(404, "Not found");
    return jsonOk(currentUserResponseSchema.parse({ user: updated }));
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    const msg = err instanceof Error ? err.message : "Unexpected error";
    if (msg === "UNAUTHENTICATED") return jsonError(401, "UNAUTHENTICATED");
    return jsonError(500, "Unexpected error");
  }
}

