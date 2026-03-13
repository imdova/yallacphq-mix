import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudentFieldOptions } from './schemas/student-field-options.schema';

const DEFAULT_KEY = 'default';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(StudentFieldOptions.name)
    private readonly model: Model<StudentFieldOptions>,
  ) {}

  async getStudentFieldOptions(): Promise<{
    countries: string[];
    specialities: string[];
    categories: string[];
    quizCategories: string[];
  }> {
    const doc = await this.model.findOne({ key: DEFAULT_KEY }).exec();
    if (!doc) {
      return { countries: [], specialities: [], categories: [], quizCategories: [] };
    }
    const d = doc as unknown as {
      countries?: string[];
      specialities?: string[];
      categories?: string[];
      quizCategories?: string[];
    };
    return {
      countries: Array.isArray(d.countries) ? [...d.countries] : [],
      specialities: Array.isArray(d.specialities) ? [...d.specialities] : [],
      categories: Array.isArray(d.categories) ? [...d.categories] : [],
      quizCategories: Array.isArray(d.quizCategories) ? [...d.quizCategories] : [],
    };
  }

  async updateStudentFieldOptions(update: {
    countries?: string[];
    specialities?: string[];
    categories?: string[];
    quizCategories?: string[];
  }): Promise<{
    countries: string[];
    specialities: string[];
    categories: string[];
    quizCategories: string[];
  }> {
    const sanitize = (arr: unknown): string[] =>
      Array.isArray(arr)
        ? arr.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean)
        : [];
    const countries = update.countries !== undefined ? sanitize(update.countries) : undefined;
    const specialities =
      update.specialities !== undefined ? sanitize(update.specialities) : undefined;
    const categories =
      update.categories !== undefined ? sanitize(update.categories) : undefined;
    const quizCategories =
      update.quizCategories !== undefined ? sanitize(update.quizCategories) : undefined;
    const doc = await this.model.findOneAndUpdate(
      { key: DEFAULT_KEY },
      {
        $set: {
          key: DEFAULT_KEY,
          ...(countries !== undefined && { countries }),
          ...(specialities !== undefined && { specialities }),
          ...(categories !== undefined && { categories }),
          ...(quizCategories !== undefined && { quizCategories }),
        },
      },
      { new: true, upsert: true },
    ).exec();
    const d = doc as unknown as {
      countries?: string[];
      specialities?: string[];
      categories?: string[];
      quizCategories?: string[];
    };
    return {
      countries: Array.isArray(d?.countries) ? [...d.countries] : [],
      specialities: Array.isArray(d?.specialities) ? [...d.specialities] : [],
      categories: Array.isArray(d?.categories) ? [...d.categories] : [],
      quizCategories: Array.isArray(d?.quizCategories) ? [...d.quizCategories] : [],
    };
  }
}
