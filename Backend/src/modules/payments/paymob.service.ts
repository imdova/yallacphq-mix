import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';

export interface PaymobBillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  city: string;
  country: string;
}

export interface PaymobIntentionResponse {
  id: string;
  intention_order_id?: number;
  payment_keys?: Array<{
    integration: number;
    key: string;
    gateway_type: string;
    order_id: number;
    redirection_url: string;
  }>;
  client_secret: string;
  status: string;
  amount: number;
  currency: string;
  special_reference?: string;
  [key: string]: unknown;
}

@Injectable()
export class PaymobService {
  private readonly logger = new Logger(PaymobService.name);
  private readonly secretKey: string | undefined;
  private readonly baseUrl: string;
  private readonly hmacSecret: string | undefined;
  private readonly integrationId: number;
  /** All integration IDs to send in payment_methods (card + ewallet + kiosk). */
  private readonly paymentMethodIds: number[];
  /** Map integration type to ID for dynamic frontend selection. */
  private readonly integrationIdsByType: Record<'card' | 'ewallet' | 'kiosk', number>;
  private readonly publicKey: string | undefined;
  private readonly unifiedCheckoutBaseUrl: string;
  private readonly callbackUrl: string;
  private readonly successRedirectUrl: string;
  private readonly skipHmacVerification: boolean;
  /** Currency required by Paymob for this integration (e.g. EGP). From Developers → Payment Integrations. */
  private readonly paymobCurrency: string;
  /** If true, send amount in main unit (EGP); if false, send in smallest unit (piastres). */
  private readonly amountInMainUnit: boolean;
  private readonly client: ReturnType<typeof axios.create>;

  constructor(
    private readonly config: ConfigService,
    private readonly orders: OrdersService,
    private readonly users: UsersService,
    private readonly courses: CoursesService,
    private readonly promoCodes: PromoCodesService,
  ) {
    this.secretKey = this.config.get<string>('PAYMOB_SECRET_KEY');
    this.baseUrl =
      this.config.get<string>('PAYMOB_BASE_URL') ?? 'https://accept.paymob.com';
    this.hmacSecret = this.config.get<string>('PAYMOB_HMAC_SECRET');
    this.integrationId =
      this.config.get<number>('PAYMOB_INTEGRATION_ID') ?? 0;
    const ewalletId = this.config.get<number>('PAYMOB_EWALLET_INTEGRATION_ID') ?? 0;
    const kioskId = this.config.get<number>('PAYMOB_KIOSK_INTEGRATION_ID') ?? 0;
    this.paymentMethodIds = [this.integrationId, ewalletId, kioskId].filter(
      (id) => id > 0,
    );
    this.integrationIdsByType = {
      card: this.integrationId,
      ewallet: ewalletId,
      kiosk: kioskId,
    };
    this.publicKey = this.config.get<string>('PAYMOB_PUBLIC_KEY');
    this.unifiedCheckoutBaseUrl =
      this.config.get<string>('PAYMOB_UNIFIED_CHECKOUT_BASE_URL') ??
      'https://accept.paymob.com';
    this.callbackUrl =
      this.config.get<string>('PAYMOB_CALLBACK_URL') ?? '';
    this.successRedirectUrl =
      this.config.get<string>('PAYMOB_SUCCESS_REDIRECT_URL') ?? '';
    this.skipHmacVerification =
      this.config.get<string>('PAYMOB_SKIP_HMAC_VERIFICATION')?.toLowerCase() === 'true';
    this.paymobCurrency =
      this.config.get<string>('PAYMOB_CURRENCY')?.trim()?.toUpperCase() || 'EGP';
    this.amountInMainUnit =
      this.config.get<string>('PAYMOB_AMOUNT_IN_MAIN_UNIT')?.toLowerCase() === 'true';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Expect: '', // avoid 417 Expectation Failed from some gateways
        ...(this.secretKey
          ? { Authorization: `Token ${this.secretKey}` }
          : {}),
      },
    });
  }

  isConfigured(): boolean {
    return !!(
      this.secretKey?.trim() &&
      this.hmacSecret?.trim() &&
      this.publicKey?.trim() &&
      this.integrationId > 0 &&
      this.callbackUrl.trim()
    );
  }

  /** Returns which Paymob integration types are configured (for frontend dropdown). */
  getAvailablePaymobMethods(): Array<{ type: 'card' | 'ewallet' | 'kiosk'; label: string }> {
    const map: Array<{ type: 'card' | 'ewallet' | 'kiosk'; label: string }> = [
      { type: 'card', label: 'Card (Visa/Mastercard)' },
      { type: 'ewallet', label: 'E-Wallet' },
      // { type: 'kiosk', label: 'Accept Kiosk' },
    ];
    return map.filter((m) => this.integrationIdsByType[m.type] > 0);
  }

  private getIntegrationIdsForType(type: 'card' | 'ewallet' | 'kiosk'): number[] {
    const id = this.integrationIdsByType[type];
    return id > 0 ? [id] : [];
  }

  toSmallestUnit(amount: number, currency: string): number {
    // Round to 2 decimals first to avoid floating-point drift, then convert to smallest unit (piastres for EGP).
    const rounded = Math.round(amount * 100) / 100;
    return Math.round(rounded * 100);
  }

  async createIntention(
    orderId: string,
    amount: number,
    currency: string,
    courseTitle: string,
    billingData: PaymobBillingData,
    paymobIntegrationType?: 'card' | 'ewallet' | 'kiosk',
  ): Promise<{ intentionId: string; unifiedCheckoutUrl: string }> {
    if (!this.isConfigured()) {
      throw new BadRequestException(
        'Paymob is not configured. Set PAYMOB_SECRET_KEY, PAYMOB_HMAC_SECRET, PAYMOB_PUBLIC_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_CALLBACK_URL.',
      );
    }
    const currencyUpper = currency.trim().toUpperCase();
    if (currencyUpper !== this.paymobCurrency) {
      throw new BadRequestException(
        `Paymob integration is configured for ${this.paymobCurrency} only. This order is in ${currencyUpper}. Use Card/PayPal or Bank Transfer, or use ${this.paymobCurrency} for Paymob.`,
      );
    }
    const amountSmallest = this.toSmallestUnit(amount, currency);
    const amountForPayload = this.amountInMainUnit
      ? Math.round(amount * 100) / 100
      : amountSmallest;
    let paymentMethodIds: number[];
    if (paymobIntegrationType) {
      paymentMethodIds = this.getIntegrationIdsForType(paymobIntegrationType);
      if (paymentMethodIds.length === 0) {
        const envKey =
          paymobIntegrationType === 'card'
            ? 'PAYMOB_INTEGRATION_ID'
            : `PAYMOB_${paymobIntegrationType.toUpperCase()}_INTEGRATION_ID`;
        throw new BadRequestException(
          `Paymob integration "${paymobIntegrationType}" is not configured. Set ${envKey} or use another method.`,
        );
      }
    } else {
      paymentMethodIds = this.paymentMethodIds.length > 0 ? this.paymentMethodIds : [this.integrationId];
    }
    const payload = {
      amount: amountForPayload,
      currency: this.paymobCurrency,
      payment_methods: paymentMethodIds,
      items: [
        {
          name: 'yallaCphq',
          amount: amountForPayload,
          quantity: 1,
          description: courseTitle,
        },
      ],
      billing_data: {
        first_name: billingData.first_name,
        last_name: billingData.last_name,
        email: billingData.email,
        phone_number: billingData.phone_number,
        city: billingData.city || 'Cairo',
        country: billingData.country || 'EGY',
        apartment: 'N/A',
        floor: 'N/A',
        street: 'N/A',
        building: 'N/A',
        state: 'N/A',
        postal_code: '00000',
        shipping_method: 'PKG',
      },
      notification_url: this.callbackUrl,
      ...(this.successRedirectUrl && { redirection_url: this.successRedirectUrl }),
      special_reference: orderId,
    };

    try {
      const { data } = await this.client.post<PaymobIntentionResponse>(
        '/v1/intention/',
        payload,
      );
      if (!data.id || !data.client_secret) {
        throw new BadRequestException('Invalid Paymob intention response');
      }
      const unifiedCheckoutUrl = `${this.unifiedCheckoutBaseUrl.replace(
        /\/$/,
        '',
      )}/unifiedcheckout/?publicKey=${encodeURIComponent(
        this.publicKey!,
      )}&clientSecret=${encodeURIComponent(data.client_secret)}`;
      return { intentionId: data.id, unifiedCheckoutUrl };
    } catch (err: unknown) {
      const ax = err as { response?: { status: number; data?: unknown } };
      const status = ax.response?.status;
      const body = ax.response?.data;
      this.logger.warn(`Paymob intention failed: ${status} ${JSON.stringify(body)}`);
      const msg =
        body && typeof body === 'object' && body !== null
          ? (('message' in body && typeof (body as { message: unknown }).message === 'string')
              ? (body as { message: string }).message
              : ('detail' in body && typeof (body as { detail: unknown }).detail === 'string')
                ? (body as { detail: string }).detail
                : Array.isArray((body as { errors?: unknown }).errors)
                  ? (body as { errors: string[] }).errors.join('; ')
                  : JSON.stringify(body))
          : `Paymob API error (${status ?? 'unknown'})`;
      throw new BadRequestException(msg);
    }
  }

  verifyHmac(obj: Record<string, unknown>, receivedHmac: string): boolean {
    if (!this.hmacSecret) return false;
    const keys = Object.keys(obj).filter((k) => k !== 'hmac').sort();
    const concat = keys.map((k) => `${obj[k]}`).join('');
    const computed = crypto
      .createHmac('sha512', this.hmacSecret)
      .update(concat)
      .digest('hex');
    return computed === receivedHmac;
  }

  private verifyHmacNewFormat(
    body: Record<string, unknown>,
    receivedHmac: string,
  ): boolean {
    if (!this.hmacSecret) return false;
    const { hmac: _hmac, ...rest } = body;
    const payload = JSON.stringify(rest);
    const computed = crypto
      .createHmac('sha512', this.hmacSecret)
      .update(payload)
      .digest('hex');
    return computed === receivedHmac;
  }

  async handleCallback(
    body: Record<string, unknown>,
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log(`Paymob webhook: ${JSON.stringify(body).slice(0, 500)}`);
    const receivedHmac = body.hmac as string | undefined;
    if (!receivedHmac) {
      throw new BadRequestException('Missing hmac');
    }

    const intentionPayload = body.intention as Record<string, unknown> | undefined;
    const transactionPayload = body.transaction as Record<string, unknown> | undefined;
    const isNewFormat =
      intentionPayload &&
      typeof intentionPayload === 'object' &&
      transactionPayload &&
      typeof transactionPayload === 'object';

    let orderId: string | undefined;
    let success: boolean;
    let transactionId: string | undefined;

    if (isNewFormat) {
      if (
        !this.skipHmacVerification &&
        !this.verifyHmacNewFormat(body, receivedHmac)
      ) {
        throw new BadRequestException('Invalid HMAC');
      }
      orderId = intentionPayload.special_reference as string | undefined;
      success = transactionPayload.success === true;
      transactionId =
        transactionPayload.id != null
          ? String(transactionPayload.id)
          : undefined;
    } else {
      const obj = body.obj;
      const parsedObj =
        typeof obj === 'string'
          ? (() => {
              try {
                return JSON.parse(obj) as Record<string, unknown>;
              } catch {
                throw new BadRequestException('Invalid obj');
              }
            })()
          : obj;
      if (!parsedObj || typeof parsedObj !== 'object') {
        throw new BadRequestException('Missing obj');
      }
      if (
        !this.skipHmacVerification &&
        !this.verifyHmac(parsedObj as Record<string, unknown>, receivedHmac)
      ) {
        throw new BadRequestException('Invalid HMAC');
      }
      success = body.success === true;
      orderId =
        (body.intention_id as string) ??
        (parsedObj as Record<string, unknown>).intention_id as string | undefined;
      transactionId = body.id as string | undefined;
      if (!orderId && (body.order_id ?? (parsedObj as Record<string, unknown>).order_id)) {
        orderId = String(body.order_id ?? (parsedObj as Record<string, unknown>).order_id);
      }
    }

    if (!orderId) {
      this.logger.warn('Paymob callback: no order id in payload');
      return { success: false, message: 'Missing order reference' };
    }

    const order = await this.orders.findById(orderId);
    if (!order) {
      this.logger.warn(`Paymob callback: order not found ${orderId}`);
      return { success: false, message: 'Order not found' };
    }
    if (order.status !== 'pending') {
      this.logger.log(`Paymob callback: order ${orderId} already ${order.status}`);
      return { success, message: 'Order already processed' };
    }

    if (success) {
      const updated = await this.orders.updateStatus({
        orderId: order.id,
        status: 'paid',
        transactionId,
      });
      if (updated?.promoCode?.trim()) {
        await this.promoCodes.incrementUsageByCode(updated.promoCode.trim());
      }
      if (updated?.userId && updated.courseIds?.length) {
        for (const courseId of updated.courseIds) {
          const added = await this.users.addEnrolledCourse(
            updated.userId!,
            courseId,
          );
          if (added) {
            await this.courses.incrementEnrolledCount(courseId, 1);
          }
        }
      }
      this.logger.log(`Paymob order ${orderId} marked paid`);
    } else {
      await this.orders.updateStatus({
        orderId: order.id,
        status: 'failed',
        transactionId,
      });
    }

    return {
      success,
      message: success ? 'Payment recorded' : 'Payment failed',
    };
  }
}
