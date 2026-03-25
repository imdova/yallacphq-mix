import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Version,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { Role as AppRole } from '../../common/auth/role';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import {
  adminDeleteQuizResponseSchema,
  adminQuizNullableResponseSchema,
  adminQuizResponseSchema,
  createQuizBodySchema,
  listQuizzesResponseSchema,
  updateQuizBodySchema,
} from '../../contracts';
import type { CreateQuizBody } from '../../contracts';
import {
  ApiOkDto,
  CreateQuizBodyDto,
  ListQuizzesResponseDto,
  QuizNullableResponseDto,
  QuizResponseDto,
} from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toApiQuiz } from './quiz.mapper';
import { QuizzesService } from './quizzes.service';

@ApiTags('admin', 'quizzes')
@Controller('admin/quizzes')
export class AdminQuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listQuizzesResponseSchema)
  @ApiOperation({ summary: 'Admin: list quizzes' })
  @ApiAuth()
  @ApiOkResponse({ type: ListQuizzesResponseDto })
  async list() {
    const items = await this.quizzes.listAll();
    return { items: items.map(toApiQuiz) };
  }

  @Post()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminQuizResponseSchema)
  @ApiOperation({ summary: 'Admin: create quiz' })
  @ApiAuth()
  @ApiBody({ type: CreateQuizBodyDto })
  @ApiCreatedResponse({ type: QuizResponseDto })
  async create(
    @Body(new ZodValidationPipe(createQuizBodySchema))
    body: CreateQuizBody,
    @CurrentUser() user: RequestUser,
  ) {
    const created = await this.quizzes.create({
      ...body,
      createdByUserId: user.sub,
    });
    return { quiz: toApiQuiz(created) };
  }

  @Get(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminQuizNullableResponseSchema)
  @ApiOperation({ summary: 'Admin: get quiz by id' })
  @ApiAuth()
  @ApiOkResponse({ type: QuizNullableResponseDto })
  async getById(@Param('id') id: string) {
    const quiz = await this.quizzes.findById(id);
    return { quiz: quiz ? toApiQuiz(quiz) : null };
  }

  @Patch(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminQuizResponseSchema)
  @ApiOperation({ summary: 'Admin: update quiz' })
  @ApiAuth()
  @ApiOkResponse({ type: QuizResponseDto })
  async update(@Param('id') id: string, @Req() req: Request) {
    const raw = req.body;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: [
          { message: 'Body must be a JSON object', path: [], code: 'invalid_type' },
        ],
      });
    }
    const parsed = updateQuizBodySchema.safeParse(raw);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues,
      });
    }
    const updated = await this.quizzes.updateById(id, parsed.data);
    if (!updated) throw new NotFoundException('Quiz not found');
    return { quiz: toApiQuiz(updated) };
  }

  @Delete(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminDeleteQuizResponseSchema)
  @ApiOperation({ summary: 'Admin: delete quiz' })
  @ApiAuth()
  @ApiOkResponse({ type: ApiOkDto })
  async remove(@Param('id') id: string) {
    const deleted = await this.quizzes.deleteById(id);
    if (!deleted) throw new NotFoundException('Quiz not found');
    return { ok: true };
  }
}
