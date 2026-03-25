export type DraftOption = {
  id: string;
  label: string;
  text: string;
};

export type QuizQuestionType =
  | "multiple-choice"
  | "multiple-select"
  | "true-false"
  | "short-answer";

type DraftQuestionBase = {
  id: string;
  prompt: string;
  points: number;
  rationale?: string;
};

export type MultipleChoiceDraftQuestion = DraftQuestionBase & {
  questionType: "multiple-choice";
  options: DraftOption[];
  correctOptionId: string;
};

export type MultipleSelectDraftQuestion = DraftQuestionBase & {
  questionType: "multiple-select";
  options: DraftOption[];
  correctOptionIds: string[];
};

export type TrueFalseDraftQuestion = DraftQuestionBase & {
  questionType: "true-false";
  correctBoolean: boolean;
};

export type ShortAnswerDraftQuestion = DraftQuestionBase & {
  questionType: "short-answer";
  acceptableAnswers: string[];
};

export type DraftQuestion =
  | MultipleChoiceDraftQuestion
  | MultipleSelectDraftQuestion
  | TrueFalseDraftQuestion
  | ShortAnswerDraftQuestion;

export type AdminStoredQuiz = {
  id: string;
  title: string;
  module: string;
  category: string;
  questions: number;
  status: "active" | "draft";
  createdAt?: string;
  lastUpdated: string;
  meta?: {
    durationMinutes: number;
    passingScorePercent: number;
  };
  questionBank?: DraftQuestion[];
};

export type CreateQuizInput = {
  title: string;
  module: string;
  category: string;
  status: "active" | "draft";
  meta: {
    durationMinutes: number;
    passingScorePercent: number;
  };
  questionBank?: DraftQuestion[];
};

export type UpdateQuizInput = Partial<CreateQuizInput>;
