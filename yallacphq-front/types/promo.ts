export type PromoDiscountType = "percentage" | "fixed";

export interface PromoCode {
  id: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  active: boolean;
  maxUsageEnabled: boolean;
  maxUsage: number | null;
  perCustomerLimitEnabled: boolean;
  perCustomerLimit: number | null;
  restrictToProductEnabled: boolean;
  productId: string | null;
  usageCount: number;
}

export interface CreatePromoCodeInput {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  active?: boolean;
  maxUsageEnabled?: boolean;
  maxUsage?: number | null;
  perCustomerLimitEnabled?: boolean;
  perCustomerLimit?: number | null;
  restrictToProductEnabled?: boolean;
  productId?: string | null;
}

export type UpdatePromoCodeInput = Partial<CreatePromoCodeInput>;
