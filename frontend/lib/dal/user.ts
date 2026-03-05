import type { User, CreateUserInput, UpdateUserInput } from "@/types/user";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  adminDeleteUserResponseSchema,
  adminUserNullableResponseSchema,
  adminUserResponseSchema,
  currentUserResponseSchema,
  listUsersResponseSchema,
  type UpdateCurrentUserBody,
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
    // Never throw on auth failure; return null so callers can treat as unauthenticated.
    if (getErrorStatus(err) === 401) return null;
    const msg = err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "";
    if (msg === "UNAUTHENTICATED") return null;
    throw err;
  }
}

export async function updateCurrentUser(data: UpdateCurrentUserBody): Promise<User> {
  const res = await apiPatch("/api/me", data, { schema: currentUserResponseSchema });
  return res.user as User;
}

export async function getUsers(params?: {
  search?: string;
  country?: string;
  speciality?: string;
  enrollment?: string;
}): Promise<User[]> {
  const searchParams = new URLSearchParams();
  if (params?.search?.trim()) searchParams.set("search", params.search.trim());
  if (params?.country?.trim() && params.country !== "all") searchParams.set("country", params.country.trim());
  if (params?.speciality?.trim() && params.speciality !== "all") searchParams.set("speciality", params.speciality.trim());
  if (params?.enrollment && params.enrollment !== "all") searchParams.set("enrollment", params.enrollment);
  const query = searchParams.toString();
  const url = `/api/admin/users${query ? `?${query}` : ""}`;
  const res = await apiGet(url, { schema: listUsersResponseSchema });
  return res.items as User[];
}

export async function deleteUser(id: string): Promise<boolean> {
  await apiDelete(`/api/admin/users/${encodeURIComponent(id)}`, { schema: adminDeleteUserResponseSchema });
  return true;
}
