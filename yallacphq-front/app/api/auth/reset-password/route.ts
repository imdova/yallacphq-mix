import { ZodError } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { resetPasswordBodySchema } from "@/lib/api/contracts/auth";
import { consumeResetToken, setCredential } from "@/lib/auth/store";
import { getUsers } from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = resetPasswordBodySchema.parse(await req.json());
    const email = await consumeResetToken(body.token);
    if (!email) return jsonError(400, "Invalid or expired token");

    const users = await getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return jsonError(400, "Invalid token");

    await setCredential(user.email, user.id, body.newPassword);
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: zodIssues(err) });
    return jsonError(500, "Unexpected error");
  }
}

