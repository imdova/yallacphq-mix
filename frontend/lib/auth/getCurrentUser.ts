import { getUserById } from "@/lib/db/users";
import { getSession } from "@/lib/auth/server";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return getUserById(session.uid);
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

