import { apiGet, apiPatch } from "@/lib/api/client";
import {
  studentFieldOptionsResponseSchema,
  updateStudentFieldOptionsBodySchema,
} from "@/lib/api/contracts/settings";

export type StudentFieldOptions = {
  countries: string[];
  specialities: string[];
  categories: string[];
  quizCategories: string[];
};

export async function getStudentFieldOptions(): Promise<StudentFieldOptions> {
  const res = await apiGet("/api/admin/settings/student-fields", {
    schema: studentFieldOptionsResponseSchema,
  });
  return res;
}

/** Public: get countries and specialities for signup/registration (no auth). */
export async function getPublicStudentFieldOptions(): Promise<StudentFieldOptions> {
  try {
    const url =
      typeof window !== "undefined"
        ? "/api/settings/student-fields"
        : `${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000"}/api/settings/student-fields`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { countries: [], specialities: [], categories: [], quizCategories: [] };
    const parsed = studentFieldOptionsResponseSchema.safeParse(data);
    return parsed.success
      ? parsed.data
      : { countries: [], specialities: [], categories: [], quizCategories: [] };
  } catch {
    return { countries: [], specialities: [], categories: [], quizCategories: [] };
  }
}

export async function updateStudentFieldOptions(
  data: { countries?: string[]; specialities?: string[]; categories?: string[]; quizCategories?: string[] }
): Promise<StudentFieldOptions> {
  const body = updateStudentFieldOptionsBodySchema.parse(data);
  const res = await apiPatch("/api/admin/settings/student-fields", body, {
    schema: studentFieldOptionsResponseSchema,
  });
  return res;
}
