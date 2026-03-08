import type { Course, CreateCourseInput, UpdateCourseInput } from "@/types/course";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  adminCourseNullableResponseSchema,
  adminCourseResponseSchema,
  adminDeleteCourseResponseSchema,
  enrollCourseResponseSchema,
  adminEnrollUserResponseSchema,
  publicCourseResponseSchema,
  publicCoursesResponseSchema,
  listCoursesResponseSchema,
} from "@/lib/api/contracts/course";

export async function fetchCourses(): Promise<Course[]> {
  return getCourses();
}

export async function fetchCourseById(id: string): Promise<Course | null> {
  return getCourse(id);
}

export async function createCourse(data: CreateCourseInput): Promise<Course> {
  const res = await apiPost("/api/admin/courses", data, { schema: adminCourseResponseSchema });
  return res.course as Course;
}

export async function updateCourse(id: string, data: UpdateCourseInput): Promise<Course | null> {
  const res = await apiPatch(`/api/admin/courses/${encodeURIComponent(id)}`, data, {
    schema: adminCourseResponseSchema,
  });
  return (res.course as Course) ?? null;
}

export async function removeCourse(id: string): Promise<boolean> {
  return deleteCourse(id);
}

// ---- Phase 3 canonical API (preferred) ----

// Admin CRUD
export async function getCourses(): Promise<Course[]> {
  const res = await apiGet("/api/admin/courses", { schema: listCoursesResponseSchema });
  return res.items as Course[];
}

export async function getCourse(id: string): Promise<Course | null> {
  const res = await apiGet(`/api/admin/courses/${encodeURIComponent(id)}`, {
    schema: adminCourseNullableResponseSchema,
  });
  return (res.course as Course | null) ?? null;
}

export async function deleteCourse(id: string): Promise<boolean> {
  await apiDelete(`/api/admin/courses/${encodeURIComponent(id)}`, { schema: adminDeleteCourseResponseSchema });
  return true;
}

// Public read
export async function getPublicCourses(): Promise<Course[]> {
  const res = await apiGet("/api/courses", { schema: publicCoursesResponseSchema });
  return res.items as Course[];
}

export async function getFeaturedCourses(limit = 12): Promise<Course[]> {
  const res = await apiGet(`/api/courses/featured?limit=${encodeURIComponent(String(limit))}`, {
    schema: publicCoursesResponseSchema,
  });
  return res.items as Course[];
}

export async function getMyCourses(): Promise<Course[]> {
  const res = await apiGet("/api/me/courses", { schema: publicCoursesResponseSchema });
  return (res.items as Course[]) ?? [];
}

export async function getPublicCourse(id: string): Promise<Course | null> {
  try {
    const res = await apiGet(`/api/courses/${encodeURIComponent(id)}`, { schema: publicCourseResponseSchema });
    return res.course as Course;
  } catch {
    return null;
  }
}

export async function getRelatedCourses(courseId: string, limit = 4): Promise<Course[]> {
  try {
    const res = await apiGet(
      `/api/courses/${encodeURIComponent(courseId)}/related?limit=${encodeURIComponent(String(limit))}`,
      { schema: publicCoursesResponseSchema }
    );
    return (res.items as Course[]) ?? [];
  } catch {
    return [];
  }
}

// Enrollment
export async function enrollCourse(courseId: string, userId?: string) {
  return apiPost(`/api/courses/${encodeURIComponent(courseId)}/enroll`, { userId }, { schema: enrollCourseResponseSchema });
}

/** Admin: enroll a user in a course. Returns the updated user when backend is configured. */
export async function enrollUserInCourse(
  courseId: string,
  userId: string
): Promise<{ ok: true; user?: import("@/types/user").User }> {
  const res = await apiPost(
    `/api/admin/courses/${encodeURIComponent(courseId)}/enroll-user`,
    { userId },
    { schema: adminEnrollUserResponseSchema }
  );
  return res as { ok: true; user?: import("@/types/user").User };
}
