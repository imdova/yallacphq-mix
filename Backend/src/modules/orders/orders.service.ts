import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Order,
  OrderDocument,
  type OrderStatus,
  type PaymentProvider,
} from './schemas/order.schema';
import type { CreateOrderBody, UpdateOrderBody } from '../../contracts';

export type CreatePendingOrderParams = {
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseTitle: string;
  currency: string;
  amount: number;
  discountAmount?: number;
  promoCode?: string;
  provider: PaymentProvider;
  userId?: string;
  courseIds?: string[];
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async createPending(params: CreatePendingOrderParams) {
    return this.orderModel.create({
      ...params,
      status: 'pending',
    });
  }

  listForStudentEmail(studentEmail: string) {
    return this.orderModel
      .find({ studentEmail: studentEmail.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .exec();
  }

  listAll() {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  findById(id: string) {
    return this.orderModel.findById(id).exec();
  }

  async createFromContract(body: CreateOrderBody) {
    return this.orderModel.create({
      studentName: body.studentName,
      studentEmail: body.studentEmail.toLowerCase(),
      studentPhone: body.studentPhone,
      courseTitle: body.courseTitle,
      currency: body.currency ?? 'usd',
      amount: body.amount,
      discountAmount: body.discountAmount,
      promoCode: body.promoCode,
      provider: body.provider ?? 'manual',
      paymentMethod: body.paymentMethod,
      status: body.status ?? 'pending',
      transactionId: body.transactionId,
      paidAt: body.paidAt,
      refundedAt: body.refundedAt,
    });
  }

  updateById(id: string, patch: UpdateOrderBody) {
    return this.orderModel
      .findByIdAndUpdate(id, { $set: patch }, { new: true })
      .exec();
  }

  deleteById(id: string) {
    return this.orderModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(params: {
    orderId: string;
    status: OrderStatus;
    transactionId?: string;
  }) {
    return this.orderModel
      .findByIdAndUpdate(
        params.orderId,
        {
          status: params.status,
          transactionId: params.transactionId,
          paidAt:
            params.status === 'paid' ? new Date().toISOString() : undefined,
          refundedAt:
            params.status === 'refunded' ? new Date().toISOString() : undefined,
        },
        { new: true },
      )
      .exec();
  }
}
