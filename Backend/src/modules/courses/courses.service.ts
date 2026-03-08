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

  listPublished(limit?: number) {
    const query = this.courseModel
      .find({ status: 'published' })
      .sort({ createdAt: -1 });
    if (limit != null) query.limit(limit);
    return query.exec();
  }

  listFeaturedPublished(limit?: number) {
    const query = this.courseModel
      .find({ status: 'published', featured: true })
      .sort({ featuredOrder: 1, createdAt: -1 });
    if (limit != null) query.limit(limit);
    return query.exec();
  }

  listAll() {
    return this.courseModel.find().sort({ createdAt: -1 }).exec();
  }

  findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.courseModel.findById(id).exec();
  }

  findPublishedById(id: string) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.courseModel.findOne({ _id: id, status: 'published' }).exec();
  }

  async listRelatedPublishedForCourse(
    course: CourseDocument,
    limit = 4,
  ): Promise<CourseDocument[]> {
    const results: CourseDocument[] = [];
    const seen = new Set<string>([course.id]);

    const explicitIds = (course.relatedCourseIds ?? [])
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (explicitIds.length > 0) {
      const explicit = await this.courseModel
        .find({ _id: { $in: explicitIds }, status: 'published' })
        .exec();
      const explicitById = new Map(explicit.map((item) => [item.id, item]));
      for (const id of course.relatedCourseIds ?? []) {
        const related = explicitById.get(id);
        if (!related || seen.has(related.id)) continue;
        seen.add(related.id);
        results.push(related);
        if (results.length >= limit) return results.slice(0, limit);
      }
    }

    if (course.tag?.trim()) {
      const sameTag = await this.courseModel
        .find({
          status: 'published',
          tag: course.tag,
          _id: { $ne: course._id },
        })
        .sort({ createdAt: -1 })
        .limit(limit * 2)
        .exec();

      for (const related of sameTag) {
        if (seen.has(related.id)) continue;
        seen.add(related.id);
        results.push(related);
        if (results.length >= limit) return results.slice(0, limit);
      }
    }

    const fallback = await this.courseModel
      .find({
        status: 'published',
        _id: { $ne: course._id },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 3)
      .exec();

    for (const related of fallback) {
      if (seen.has(related.id)) continue;
      seen.add(related.id);
      results.push(related);
      if (results.length >= limit) break;
    }

    return results.slice(0, limit);
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
      featured: params.featured ?? false,
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
