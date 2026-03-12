import { Injectable, Logger } from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';
import { MailService } from '../mail/mail.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { UsersService } from '../users/users.service';
import type { OrderDocument } from './schemas/order.schema';

@Injectable()
export class OrderCompletionService {
  private readonly logger = new Logger(OrderCompletionService.name);

  constructor(
    private readonly users: UsersService,
    private readonly courses: CoursesService,
    private readonly promoCodes: PromoCodesService,
    private readonly mail: MailService,
  ) {}

  async handlePaidOrder(
    order: OrderDocument,
    options?: { providerLabel?: string },
  ): Promise<void> {
    if (order.promoCode?.trim()) {
      await this.promoCodes.incrementUsageByCode(order.promoCode.trim());
    }

    const courseNames: string[] = [];

    if (order.userId && order.courseIds?.length) {
      for (const courseId of order.courseIds) {
        const [newlyAdded, course] = await Promise.all([
          this.users.addEnrolledCourse(order.userId, courseId),
          this.courses.findById(courseId),
        ]);

        if (course?.title) {
          courseNames.push(course.title);
        }

        if (newlyAdded) {
          await this.courses.incrementEnrolledCount(courseId, 1);
        }
      }
    }

    try {
      await this.mail.sendPaymentSuccessEmail({
        to: order.studentEmail,
        name: order.studentName,
        courseTitle: order.courseTitle,
        courseNames,
        amount: order.amount,
        currency: order.currency,
        providerLabel: options?.providerLabel ?? this.getProviderLabel(order.provider),
        orderId: order.id,
      });
    } catch (error) {
      this.logger.warn(
        `Paid order ${order.id} completed but confirmation email failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }

  private getProviderLabel(provider: string): string {
    switch (provider) {
      case 'paymob':
        return 'Paymob';
      case 'manual':
        return 'Bank Transfer';
      default:
        return 'Card Payment';
    }
  }
}
