import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { CreateWebinarBody, UpdateWebinarBody } from '../../contracts';
import { Webinar, WebinarDocument } from './schemas/webinar.schema';

@Injectable()
export class WebinarsService {
  constructor(
    @InjectModel(Webinar.name)
    private readonly webinarModel: Model<WebinarDocument>,
  ) {}

  listAll() {
    return this.webinarModel.find().sort({ startsAt: 1, createdAt: -1 }).exec();
  }

  listPublished() {
    return this.webinarModel
      .find({ status: 'published' })
      .sort({ startsAt: 1, createdAt: -1 })
      .exec();
  }

  findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.webinarModel.findById(id).exec();
  }

  findPublishedBySlug(slug: string) {
    return this.webinarModel.findOne({ slug, status: 'published' }).exec();
  }

  async create(params: CreateWebinarBody) {
    await this.ensureUniqueSlug(params.slug);
    return this.webinarModel.create(this.toPersistence(params));
  }

  async updateById(id: string, patch: UpdateWebinarBody) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    if (patch.slug) {
      await this.ensureUniqueSlug(patch.slug, id);
    }
    const update = this.toPersistencePatch(patch);
    return this.webinarModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .exec();
  }

  deleteById(id: string) {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.webinarModel.findByIdAndDelete(id).exec();
  }

  private async ensureUniqueSlug(slug: string, excludeId?: string) {
    const existing = await this.webinarModel.findOne({ slug }).exec();
    if (!existing) return;
    if (excludeId && existing.id === excludeId) return;
    throw new BadRequestException('Webinar slug already exists');
  }

  private toPersistence(params: CreateWebinarBody) {
    return {
      ...params,
      startsAt: new Date(params.startsAt),
    };
  }

  private toPersistencePatch(patch: UpdateWebinarBody) {
    if (patch.startsAt) {
      return {
        ...patch,
        startsAt: new Date(patch.startsAt),
      };
    }
    return patch;
  }
}
