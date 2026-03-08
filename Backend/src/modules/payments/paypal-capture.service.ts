import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaypalCaptureService {
  constructor(private readonly config: ConfigService) {}

  private getPaypalApiBase(): string {
    return this.config.get<string>('PAYPAL_API_BASE') ?? 'https://api.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const clientId = this.config.get<string>('PAYPAL_CLIENT_ID');
    const secret = this.config.get<string>('PAYPAL_SECRET');
    if (!clientId?.trim() || !secret?.trim()) {
      throw new Error('PAYPAL_CLIENT_ID and PAYPAL_SECRET must be set to capture PayPal orders');
    }
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const base = this.getPaypalApiBase();
    const res = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PayPal OAuth failed: ${res.status} ${text}`);
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new Error('PayPal OAuth response missing access_token');
    }
    return data.access_token;
  }

  async captureOrder(paypalOrderId: string): Promise<void> {
    const token = await this.getAccessToken();
    const base = this.getPaypalApiBase();
    const res = await fetch(`${base}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PayPal capture failed: ${res.status} ${text}`);
    }
  }
}
