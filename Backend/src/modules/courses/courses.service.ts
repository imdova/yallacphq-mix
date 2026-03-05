import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  listPublished() {
    return this.courseModel
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .exec();
  }

  listAll() {
    return this.courseModel.find().sort({ createdAt: -1 }).exec();
  }

  findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.courseModel.findById(id).exec();
  }

  create(
    params: Omit<Partial<Course>, 'createdByUserId'> & {
      createdByUserId?: string;
    },
  ) {
    return this.courseModel.create({
      ...params,
    rating: params.rating ?? 0,
    reviewCount: params.reviewCount ?? 0,
    status: params.status ?? 'draft',
    createdByUserId:
        params.createdByUserId && Types.ObjectId.isValid(params.createdByUserId)
          ? new Types.ObjectId(params.createdByUserId)
          : undefined,
    });
  }

  updateById(id: string, patch: Partial<Course>) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.courseModel
      .findByIdAndUpdate(id, { $set: patch }, { new: true })
      .exec();
  }

  deleteById(id: string) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.courseModel.findByIdAndDelete(id).exec();
  }

  incrementEnrolledCount(courseId: string, delta: number) {
    if (!Types.ObjectId.isValid(courseId)) return Promise.resolve(null);
    return this.courseModel
      .findByIdAndUpdate(
        courseId,
        { $inc: { enrolledCount: delta } },
        { new: true },
      )
      .exec();
  }
}
