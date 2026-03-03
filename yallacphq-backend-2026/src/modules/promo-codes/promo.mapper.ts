import type { ApiPromoCode } from '../../contracts';
import type { PromoCodeDocument } from './schemas/promo-code.schema';

export function toApiPromo(p: PromoCodeDocument): ApiPromoCode {
  return {
    id: p.id,
    code: p.code,
    discountType: p.discountType,
    discountValue: p.discountValue,
    active: p.active,
    maxUsageEnabled: p.maxUsageEnabled,
    maxUsage: p.maxUsage,
    perCustomerLimitEnabled: p.perCustomerLimitEnabled,
    perCustomerLimit: p.perCustomerLimit,
    restrictToProductEnabled: p.restrictToProductEnabled,
    productId: p.productId,
    usageCount: p.usageCount ?? 0,
  };
}
