export type OrderStatus = "paid" | "pending" | "failed" | "refunded";

export type PaymentProvider = "paymob" | "stripe" | "manual";

export interface Order {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseTitle: string;
  currency: string;
  amount: number;
  discountAmount?: number;
  promoCode?: string;
  provider: PaymentProvider;
  paymentMethod?: "card" | "wallet" | "cash";
  status: OrderStatus;
  transactionId?: string;
  courseIds?: string[];
  bankTransferProofUrl?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  refundedAt?: string;
}

export interface CreateOrderInput {
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseTitle: string;
  currency?: string;
  amount: number;
  discountAmount?: number;
  promoCode?: string;
  provider?: PaymentProvider;
  paymentMethod?: Order["paymentMethod"];
  status?: OrderStatus;
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  courseIds?: string[];
  bankTransferProofUrl?: string;
}

export type UpdateOrderInput = Partial<CreateOrderInput> & {
  status?: OrderStatus;
};

