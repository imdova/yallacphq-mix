import { Controller, Get, Param, UseGuards, Version } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { quizNullableResponseSchema } from '../../contracts';
import { QuizNullableResponseDto } from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toApiQuiz } from './quiz.mapper';
import { QuizzesService } from './quizzes.service';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get(':id')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(quizNullableResponseSchema)
  @ApiOperation({ summary: 'Get quiz by id for authenticated learners' })
  @ApiAuth()
  @ApiOkResponse({ type: QuizNullableResponseDto })
  async getById(@Param('id') id: string) {
    const quiz = await this.quizzes.findById(id);
    return { quiz: quiz ? toApiQuiz(quiz) : null };
  }
}
