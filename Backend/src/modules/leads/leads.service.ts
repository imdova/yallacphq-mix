import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './schemas/lead.schema';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
  ) {}

  create(params: {
    name: string;
    email: string;
    phone: string;
    specialty?: string;
    source?: 'general' | 'cphq' | 'webinar';
    webinarId?: string;
    webinarSlug?: string;
    webinarTitle?: string;
  }) {
    return this.leadModel.create({
      ...params,
      source: params.source ?? 'general',
    });
  }

  list() {
    return this.leadModel.find().sort({ createdAt: -1 }).exec();
  }
}
