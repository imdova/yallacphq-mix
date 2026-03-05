import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PromoCode, PromoCodeDocument } from './schemas/promo-code.schema';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectModel(PromoCode.name)
    private readonly promoModel: Model<PromoCodeDocument>,
  ) {}

  list() {
    return this.promoModel.find().sort({ createdAt: -1 }).exec();
  }

  create(params: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    active?: boolean;
    maxUsageEnabled?: boolean;
    maxUsage?: number | null;
    perCustomerLimitEnabled?: boolean;
    perCustomerLimit?: number | null;
    restrictToProductEnabled?: boolean;
    productId?: string | null;
  }) {
    return this.promoModel.create(params);
  }

  findActiveByCode(code: string) {
    return this.promoModel
      .findOne({
        code: code.trim().toUpperCase(),
        active: true,
      })
      .exec();
  }

  findById(id: string) {
    return this.promoModel.findById(id).exec();
  }

  updateById(id: string, patch: Partial<PromoCode>) {
    return this.promoModel
      .findByIdAndUpdate(id, { $set: patch }, { new: true })
      .exec();
  }

  deleteById(id: string) {
    return this.promoModel.findByIdAndDelete(id).exec();
  }

  async incrementUsageByCode(code: string) {
    const promo = await this.promoModel
      .findOne({ code: code.trim().toUpperCase() })
      .exec();
    if (!promo) return;
    await this.promoModel
      .findByIdAndUpdate(promo.id, { $inc: { usageCount: 1 } })
      .exec();
  }
}
