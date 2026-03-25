import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  adminDeleteQuizResponseSchema,
  createQuizBodySchema,
  listQuizzesResponseSchema,
  quizNullableResponseSchema,
  quizResponseSchema,
  updateQuizBodySchema,
} from "@/lib/api/contracts/quiz";
import type { CreateQuizInput, AdminStoredQuiz, UpdateQuizInput } from "@/types/quiz";

export async function getAdminQuizzes(): Promise<AdminStoredQuiz[]> {
  const res = await apiGet("/api/admin/quizzes", { schema: listQuizzesResponseSchema });
  return res.items as AdminStoredQuiz[];
}

export async function getAdminQuizById(id: string): Promise<AdminStoredQuiz | null> {
  const res = await apiGet(`/api/admin/quizzes/${encodeURIComponent(id)}`, {
    schema: quizNullableResponseSchema,
  });
  return (res.quiz as AdminStoredQuiz | null) ?? null;
}

export async function getCourseQuizById(id: string): Promise<AdminStoredQuiz | null> {
  const res = await apiGet(`/api/quizzes/${encodeURIComponent(id)}`, {
    schema: quizNullableResponseSchema,
  });
  return (res.quiz as AdminStoredQuiz | null) ?? null;
}

export async function createQuiz(data: CreateQuizInput): Promise<AdminStoredQuiz> {
  const body = createQuizBodySchema.parse(data);
  const res = await apiPost("/api/admin/quizzes", body, { schema: quizResponseSchema });
  return res.quiz as AdminStoredQuiz;
}

export async function updateQuiz(id: string, data: UpdateQuizInput): Promise<AdminStoredQuiz | null> {
  const body = updateQuizBodySchema.parse(data);
  const res = await apiPatch(`/api/admin/quizzes/${encodeURIComponent(id)}`, body, {
    schema: quizResponseSchema,
  });
  return (res.quiz as AdminStoredQuiz) ?? null;
}

export async function deleteQuiz(id: string): Promise<boolean> {
  await apiDelete(`/api/admin/quizzes/${encodeURIComponent(id)}`, {
    schema: adminDeleteQuizResponseSchema,
  });
  return true;
}
