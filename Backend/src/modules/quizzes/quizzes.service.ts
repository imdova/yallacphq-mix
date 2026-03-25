import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  listAll() {
    return this.quizModel.find().sort({ createdAt: -1 }).exec();
  }

  findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.quizModel.findById(id).exec();
  }

  create(
    params: Omit<Partial<Quiz>, 'createdByUserId'> & {
      createdByUserId?: string;
    },
  ) {
    return this.quizModel.create({
      ...params,
      status: params.status ?? 'draft',
      questionBank: params.questionBank ?? [],
      createdByUserId:
        params.createdByUserId && Types.ObjectId.isValid(params.createdByUserId)
          ? new Types.ObjectId(params.createdByUserId)
          : undefined,
    });
  }

  updateById(id: string, patch: Partial<Quiz>) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.quizModel
      .findByIdAndUpdate(id, { $set: patch }, { new: true })
      .exec();
  }

  deleteById(id: string) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.quizModel.findByIdAndDelete(id).exec();
  }
}
