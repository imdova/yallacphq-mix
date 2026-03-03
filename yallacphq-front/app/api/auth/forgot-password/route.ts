import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { forgotPasswordBodySchema } from "@/lib/api/contracts/auth";
import { createResetToken } from "@/lib/auth/store";
import { getUsers } from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = forgotPasswordBodySchema.parse(await req.json());
    const users = await getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === body.email.toLowerCase());

    // Always return success to avoid account enumeration.
    if (!exists) return jsonOk({ success: true });

    const token = await createResetToken(body.email);
    return jsonOk({
      success: true,
      ...(process.env.NODE_ENV === "production" ? {} : { token }),
    });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    return jsonError(500, "Unexpected error");
  }
}

