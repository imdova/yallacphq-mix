/**
 * Admin quiz drafts persisted in localStorage until a backend exists.
 */

import type { AdminStoredQuiz } from "@/types/quiz";

export const ADMIN_QUIZZES_STORAGE_KEY = "yalla-admin-quizzes-v1";
export type { AdminStoredQuiz, DraftOption, DraftQuestion } from "@/types/quiz";

export function loadAdminQuizzes(): AdminStoredQuiz[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADMIN_QUIZZES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AdminStoredQuiz[];
  } catch {
    return [];
  }
}

export function saveAdminQuizzes(rows: AdminStoredQuiz[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ADMIN_QUIZZES_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // quota / private mode
  }
}

export function getAdminQuiz(id: string): AdminStoredQuiz | undefined {
  return loadAdminQuizzes().find((q) => q.id === id);
}

export function deleteAdminQuiz(id: string): void {
  const all = loadAdminQuizzes();
  saveAdminQuizzes(all.filter((q) => q.id !== id));
}

/** Insert or replace by id (used for create + update). */
export function upsertAdminQuiz(quiz: AdminStoredQuiz): void {
  const all = loadAdminQuizzes();
  const i = all.findIndex((q) => q.id === quiz.id);
  if (i >= 0) {
    const next = [...all];
    next[i] = quiz;
    saveAdminQuizzes(next);
  } else {
    saveAdminQuizzes([quiz, ...all]);
  }
}
