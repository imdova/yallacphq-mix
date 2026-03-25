import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum QuizStatusDto {
  active = 'active',
  draft = 'draft',
}

export enum QuizQuestionTypeDto {
  multipleChoice = 'multiple-choice',
  multipleSelect = 'multiple-select',
  trueFalse = 'true-false',
  shortAnswer = 'short-answer',
}

export class ApiQuizOptionDto {
  @ApiProperty({ example: 'opt_a' })
  id!: string;

  @ApiProperty({ example: 'A' })
  label!: string;

  @ApiProperty({ example: 'Reduce medication errors' })
  text!: string;
}

export class ApiQuizQuestionDto {
  @ApiProperty({ example: 'question_1' })
  id!: string;

  @ApiProperty({ enum: QuizQuestionTypeDto, example: QuizQuestionTypeDto.multipleChoice })
  questionType!: QuizQuestionTypeDto;

  @ApiProperty({ example: 'Which intervention should be prioritized first?' })
  prompt!: string;

  @ApiProperty({ type: [ApiQuizOptionDto], required: false })
  options?: ApiQuizOptionDto[];

  @ApiProperty({ example: 'opt_a', required: false })
  correctOptionId?: string;

  @ApiProperty({ example: ['opt_a', 'opt_c'], required: false, type: [String] })
  correctOptionIds?: string[];

  @ApiProperty({ example: true, required: false })
  correctBoolean?: boolean;

  @ApiProperty({ example: ['pdsa', 'plan do study act'], required: false, type: [String] })
  acceptableAnswers?: string[];

  @ApiProperty({ example: 1, minimum: 1 })
  points!: number;

  @ApiProperty({ example: 'This option addresses the highest-risk issue first.', required: false })
  rationale?: string;
}

export class ApiQuizMetaDto {
  @ApiProperty({ example: 15, minimum: 1, maximum: 240 })
  durationMinutes!: number;

  @ApiProperty({ example: 70, minimum: 0, maximum: 100 })
  passingScorePercent!: number;
}

export class ApiQuizDto {
  @ApiProperty({ example: '65f3c77b0f6d1b5a3d1d9a10' })
  id!: string;

  @ApiProperty({ example: 'Patient Safety Protocol Midterm' })
  title!: string;

  @ApiProperty({ example: 'Category · Patient Safety' })
  module!: string;

  @ApiProperty({ example: 'patient-safety' })
  category!: string;

  @ApiProperty({ example: 12, minimum: 0 })
  questions!: number;

  @ApiProperty({ enum: QuizStatusDto, example: QuizStatusDto.active })
  status!: QuizStatusDto;

  @ApiProperty({ example: '2026-03-17T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-18T08:30:00.000Z' })
  lastUpdated!: string;

  @ApiProperty({ type: ApiQuizMetaDto })
  meta!: ApiQuizMetaDto;

  @ApiProperty({ type: [ApiQuizQuestionDto] })
  questionBank!: ApiQuizQuestionDto[];
}

export class CreateQuizBodyDto {
  @ApiProperty({ example: 'Patient Safety Protocol Midterm', minLength: 3, maxLength: 160 })
  title!: string;

  @ApiProperty({ example: 'Category · Patient Safety' })
  module!: string;

  @ApiProperty({ example: 'patient-safety' })
  category!: string;

  @ApiProperty({ enum: QuizStatusDto, example: QuizStatusDto.draft })
  status!: QuizStatusDto;

  @ApiProperty({ type: ApiQuizMetaDto })
  meta!: ApiQuizMetaDto;

  @ApiProperty({ type: [ApiQuizQuestionDto], required: false })
  questionBank?: ApiQuizQuestionDto[];
}

export class UpdateQuizBodyDto extends PartialType(CreateQuizBodyDto) {}

export class ListQuizzesResponseDto {
  @ApiProperty({ type: [ApiQuizDto] })
  items!: ApiQuizDto[];
}

export class QuizResponseDto {
  @ApiProperty({ type: ApiQuizDto })
  quiz!: ApiQuizDto;
}

export class QuizNullableResponseDto {
  @ApiProperty({ type: ApiQuizDto, nullable: true })
  quiz!: ApiQuizDto | null;
}
