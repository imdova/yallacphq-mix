import type { User, CreateUserInput, UpdateUserInput } from "@/types/user";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  adminDeleteUserResponseSchema,
  adminUserNullableResponseSchema,
  adminUserResponseSchema,
  currentUserResponseSchema,
  listUsersResponseSchema,
  updateCurrentUserBodySchema,
  userSchema,
} from "@/lib/api/contracts/user";
import { getErrorStatus } from "@/lib/api/error";

/**
 * Data Access Layer: User.
 * All UI and server code must use these functions instead of importing from /lib/db.
 * Swap implementation here to use real API (fetch, server actions) without changing callers.
 */

export async function fetchUsers(): Promise<User[]> {
  return getUsers();
}

export async function fetchUserById(id: string): Promise<User | null> {
  const res = await apiGet(`/api/admin/users/${encodeURIComponent(id)}`, {
    schema: adminUserNullableResponseSchema,
  });
  return (res.user as User | null) ?? null;
}

export async function createUser(data: CreateUserInput): Promise<User> {
  const res = await apiPost("/api/admin/users", data, { schema: adminUserResponseSchema });
  return res.user as User;
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User | null> {
  const res = await apiPatch(`/api/admin/users/${encodeURIComponent(id)}`, data, {
    schema: adminUserResponseSchema,
  });
  return (res.user as User) ?? null;
}

export async function removeUser(id: string): Promise<boolean> {
  return deleteUser(id);
}

// ---- Phase 2 canonical API (preferred) ----

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await apiGet("/api/me", { schema: currentUserResponseSchema });
    return res.user as User;
  } catch (err) {
    const status = getErrorStatus(err);
    if (status === 401) return null;
    throw err;
  }
}

export async function updateCurrentUser(
  data: z.infer<typeof updateCurrentUserBodySchema>
): Promise<User> {
  const res = await apiPatch("/api/me", data, { schema: currentUserResponseSchema });
  return res.user as User;
}

export async function getUsers(): Promise<User[]> {
  const res = await apiGet("/api/admin/users", { schema: listUsersResponseSchema });
  return res.items as User[];
}

export async function deleteUser(id: string): Promise<boolean> {
  await apiDelete(`/api/admin/users/${encodeURIComponent(id)}`, { schema: adminDeleteUserResponseSchema });
  return true;
}
