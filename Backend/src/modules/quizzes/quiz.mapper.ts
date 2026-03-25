import type { ApiQuiz } from '../../contracts';
import type { QuizDocument } from './schemas/quiz.schema';

export function toApiQuiz(quiz: QuizDocument): ApiQuiz {
  const questionBank = (quiz.questionBank ?? []).map((question) => {
    const base = {
      id: question.id,
      questionType: question.questionType,
      prompt: question.prompt,
      points: question.points,
      rationale: question.rationale,
    };

    switch (question.questionType) {
      case 'multiple-select':
        return {
          ...base,
          questionType: 'multiple-select' as const,
          options: (question.options ?? []).map((option) => ({
            id: option.id,
            label: option.label,
            text: option.text,
          })),
          correctOptionIds: question.correctOptionIds ?? [],
        };
      case 'true-false':
        return {
          ...base,
          questionType: 'true-false' as const,
          correctBoolean: question.correctBoolean ?? true,
        };
      case 'short-answer':
        return {
          ...base,
          questionType: 'short-answer' as const,
          acceptableAnswers: question.acceptableAnswers ?? [],
        };
      case 'multiple-choice':
      default:
        return {
          ...base,
          questionType: 'multiple-choice' as const,
          options: (question.options ?? []).map((option) => ({
            id: option.id,
            label: option.label,
            text: option.text,
          })),
          correctOptionId: question.correctOptionId ?? '',
        };
    }
  });

  return {
    id: quiz.id,
    title: quiz.title,
    module: quiz.module,
    category: quiz.category,
    questions: quiz.questionBank?.length ?? 0,
    status: quiz.status,
    createdAt:
      (quiz as unknown as { createdAt?: Date }).createdAt?.toISOString?.() ??
      new Date(0).toISOString(),
    lastUpdated:
      (quiz as unknown as { updatedAt?: Date }).updatedAt?.toISOString?.() ??
      (quiz as unknown as { createdAt?: Date }).createdAt?.toISOString?.() ??
      new Date(0).toISOString(),
    meta: {
      durationMinutes: quiz.meta.durationMinutes,
      passingScorePercent: quiz.meta.passingScorePercent,
    },
    questionBank,
  };
}
