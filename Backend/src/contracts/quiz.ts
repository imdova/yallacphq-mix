import { z } from 'zod';
import { apiOkSchema } from './common';

export const quizStatusSchema = z.enum(['active', 'draft']);
export type QuizStatus = z.infer<typeof quizStatusSchema>;

export const quizQuestionTypeSchema = z.enum([
  'multiple-choice',
  'multiple-select',
  'true-false',
  'short-answer',
]);
export type QuizQuestionType = z.infer<typeof quizQuestionTypeSchema>;

export const quizOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  text: z.string().min(1),
});
export type QuizOption = z.infer<typeof quizOptionSchema>;

const quizQuestionBaseSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  points: z.number().int().min(1),
  rationale: z.string().optional(),
});

export const multipleChoiceQuizQuestionSchema = quizQuestionBaseSchema
  .extend({
    questionType: z.literal('multiple-choice'),
    options: z.array(quizOptionSchema).min(2),
    correctOptionId: z.string().min(1),
  })
  .superRefine((question, ctx) => {
    if (!question.options.some((option) => option.id === question.correctOptionId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctOptionId'],
        message: 'Correct option must match one of the question options',
      });
    }
  });

export const multipleSelectQuizQuestionSchema = quizQuestionBaseSchema
  .extend({
    questionType: z.literal('multiple-select'),
    options: z.array(quizOptionSchema).min(2),
    correctOptionIds: z.array(z.string().min(1)).min(1),
  })
  .superRefine((question, ctx) => {
    const optionIds = new Set(question.options.map((option) => option.id));
    if (new Set(question.correctOptionIds).size !== question.correctOptionIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctOptionIds'],
        message: 'Correct answers must be unique',
      });
    }
    question.correctOptionIds.forEach((id, index) => {
      if (!optionIds.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['correctOptionIds', index],
          message: 'Correct answers must match one of the question options',
        });
      }
    });
  });

export const trueFalseQuizQuestionSchema = quizQuestionBaseSchema.extend({
  questionType: z.literal('true-false'),
  correctBoolean: z.boolean(),
});

export const shortAnswerQuizQuestionSchema = quizQuestionBaseSchema
  .extend({
    questionType: z.literal('short-answer'),
    acceptableAnswers: z.array(z.string().min(1)).min(1),
  })
  .transform((question) => ({
    ...question,
    acceptableAnswers: Array.from(
      new Set(question.acceptableAnswers.map((answer) => answer.trim()).filter(Boolean)),
    ),
  }))
  .pipe(
    quizQuestionBaseSchema.extend({
      questionType: z.literal('short-answer'),
      acceptableAnswers: z.array(z.string().min(1)).min(1),
    }),
  );

export const quizQuestionSchema = z.discriminatedUnion('questionType', [
  multipleChoiceQuizQuestionSchema,
  multipleSelectQuizQuestionSchema,
  trueFalseQuizQuestionSchema,
  shortAnswerQuizQuestionSchema,
]);
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const quizMetaSchema = z.object({
  durationMinutes: z.number().int().min(1).max(240),
  passingScorePercent: z.number().int().min(0).max(100),
});
export type QuizMeta = z.infer<typeof quizMetaSchema>;

export const quizSchema = z.object({
  id: z.string(),
  title: z.string(),
  module: z.string(),
  category: z.string(),
  questions: z.number().int().min(0),
  status: quizStatusSchema,
  createdAt: z.string(),
  lastUpdated: z.string(),
  meta: quizMetaSchema,
  questionBank: z.array(quizQuestionSchema).default([]),
});
export type ApiQuiz = z.infer<typeof quizSchema>;

export const createQuizBodySchema = z.object({
  title: z.string().min(3).max(160),
  module: z.string().min(1),
  category: z.string().min(1),
  status: quizStatusSchema,
  meta: quizMetaSchema,
  questionBank: z.array(quizQuestionSchema).default([]),
});
export type CreateQuizBody = z.infer<typeof createQuizBodySchema>;

export const updateQuizBodySchema = createQuizBodySchema.partial();
export type UpdateQuizBody = z.infer<typeof updateQuizBodySchema>;

export const listQuizzesResponseSchema = z.object({
  items: z.array(quizSchema),
});
export type ListQuizzesResponse = z.infer<typeof listQuizzesResponseSchema>;

export const quizResponseSchema = z.object({
  quiz: quizSchema,
});
export type QuizResponse = z.infer<typeof quizResponseSchema>;

export const quizNullableResponseSchema = z.object({
  quiz: quizSchema.nullable(),
});
export type QuizNullableResponse = z.infer<typeof quizNullableResponseSchema>;

export const adminQuizResponseSchema = quizResponseSchema;
export type AdminQuizResponse = z.infer<typeof adminQuizResponseSchema>;

export const adminQuizNullableResponseSchema = quizNullableResponseSchema;
export type AdminQuizNullableResponse = z.infer<typeof adminQuizNullableResponseSchema>;

export const adminDeleteQuizResponseSchema = apiOkSchema;
export type AdminDeleteQuizResponse = z.infer<typeof adminDeleteQuizResponseSchema>;
