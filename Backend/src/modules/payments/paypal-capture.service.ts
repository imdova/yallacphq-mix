import { Injectable } from '@nestjs/common';

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE ?? 'https://api.paypal.com';

@Injectable()
export class PaypalCaptureService {
  private async getAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    if (!clientId || !secret) {
      throw new Error('PAYPAL_CLIENT_ID and PAYPAL_SECRET must be set to capture PayPal orders');
    }
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
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
    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
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
