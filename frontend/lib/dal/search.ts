import type { User } from "@/types/user";
import type { Course } from "@/types/course";
import type { Order } from "@/types/order";
import { apiGet } from "@/lib/api/client";
import { adminSearchResponseSchema } from "@/lib/api/contracts/search";

export interface AdminSearchResult {
  students: User[];
  courses: Course[];
  orders: Order[];
}

export async function searchAdmin(q: string): Promise<AdminSearchResult> {
  const query = q.trim();
  if (!query) {
    return { students: [], courses: [], orders: [] };
  }
  const res = await apiGet(`/api/admin/search?q=${encodeURIComponent(query)}`, {
    schema: adminSearchResponseSchema,
  });
  return {
    students: res.students as User[],
    courses: res.courses as Course[],
    orders: res.orders as Order[],
  };
}
