import type { ApiOrder } from '../../contracts';
import type { OrderDocument } from './schemas/order.schema';

export function toApiOrder(o: OrderDocument): ApiOrder {
  return {
    id: o.id,
    studentName: o.studentName,
    studentEmail: o.studentEmail,
    studentPhone: o.studentPhone,
    courseTitle: o.courseTitle,
    currency: o.currency,
    amount: o.amount,
    discountAmount: o.discountAmount,
    promoCode: o.promoCode,
    provider: o.provider,
    paymentMethod: o.paymentMethod,
    status: o.status,
    transactionId: o.transactionId,
    courseIds: o.courseIds,
    bankTransferProofUrl: o.bankTransferProofUrl,
    createdAt: o.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: o.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    paidAt: o.paidAt,
    refundedAt: o.refundedAt,
  };
}
