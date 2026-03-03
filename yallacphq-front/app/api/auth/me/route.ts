import { jsonOk } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/auth/server";
import { getUserById } from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonOk({ user: null });
  const user = await getUserById(session.uid);
  return jsonOk({ user });
}

