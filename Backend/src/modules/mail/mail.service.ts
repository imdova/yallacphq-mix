import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly smtpTransport: string | undefined;
  private readonly fromEmail: string | undefined;
  private readonly frontendUrl: string;
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.smtpTransport = this.config.get<string>('SMTP_TRANSPORT')?.trim();
    this.fromEmail = this.config.get<string>('SMTP_DEMO_EMAIL')?.trim();
    this.frontendUrl =
      this.config.get<string>('FRONTEND_URL')?.trim() ||
      this.config.get<string>('APP_URL')?.trim() ||
      'http://localhost:3000';
  }

  isConfigured(): boolean {
    return Boolean(this.smtpTransport && this.fromEmail);
  }

  getAppUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.frontendUrl.replace(/\/$/, '')}${normalizedPath}`;
  }

  private getTransporter(): Transporter | null {
    if (!this.isConfigured()) {
      return null;
    }
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport(this.smtpTransport!);
    }
    return this.transporter;
  }

  private async sendMail(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) {
      this.logger.warn(
        `SMTP not configured. Skipping email "${params.subject}" to ${params.to}.`,
      );
      return false;
    }

    try {
      await transporter.sendMail({
        from: this.fromEmail!,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed sending email "${params.subject}" to ${params.to}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async sendEmailVerification(params: {
    to: string;
    name: string;
    verificationUrl: string;
    otp: string;
    expiresInMinutes: number;
  }): Promise<boolean> {
    const subject = 'Verify your Medicova account';
    const safeName = escapeHtml(params.name);
    const safeUrl = escapeHtml(params.verificationUrl);
    const safeOtp = escapeHtml(params.otp);
    return this.sendMail({
      to: params.to,
      subject,
      text: [
        `Hi ${params.name},`,
        '',
        'Welcome to Medicova.',
        `Verify your email here: ${params.verificationUrl}`,
        `Verification code: ${params.otp}`,
        `This code expires in ${params.expiresInMinutes} minutes.`,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b">
          <h2 style="margin:0 0 16px">Verify your Medicova account</h2>
          <p>Hi ${safeName},</p>
          <p>Thanks for creating your account. Use the button below or enter the verification code to confirm your email address.</p>
          <p>
            <a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#cfa64a;color:#111827;text-decoration:none;border-radius:8px;font-weight:600">
              Verify email
            </a>
          </p>
          <p style="margin:16px 0 8px">Verification code</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:4px;margin:0 0 16px">${safeOtp}</p>
          <p style="color:#52525b">This code expires in ${params.expiresInMinutes} minutes.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(params: {
    to: string;
    name: string;
    resetUrl: string;
    otp: string;
    expiresInMinutes: number;
  }): Promise<boolean> {
    const subject = 'Reset your Medicova password';
    const safeName = escapeHtml(params.name);
    const safeUrl = escapeHtml(params.resetUrl);
    const safeOtp = escapeHtml(params.otp);
    return this.sendMail({
      to: params.to,
      subject,
      text: [
        `Hi ${params.name},`,
        '',
        'We received a request to reset your password.',
        `Reset link: ${params.resetUrl}`,
        `Reset code: ${params.otp}`,
        `This code expires in ${params.expiresInMinutes} minutes.`,
        'If you did not request this, you can ignore this email.',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b">
          <h2 style="margin:0 0 16px">Reset your password</h2>
          <p>Hi ${safeName},</p>
          <p>We received a request to reset your Medicova password. Use the button below or enter the OTP code manually.</p>
          <p>
            <a href="${safeUrl}" style="display:inline-block;padding:12px 20px;background:#cfa64a;color:#111827;text-decoration:none;border-radius:8px;font-weight:600">
              Reset password
            </a>
          </p>
          <p style="margin:16px 0 8px">Reset code</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:4px;margin:0 0 16px">${safeOtp}</p>
          <p style="color:#52525b">This code expires in ${params.expiresInMinutes} minutes.</p>
          <p style="color:#52525b">If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPaymentSuccessEmail(params: {
    to: string;
    name: string;
    courseTitle: string;
    courseNames: string[];
    amount: number;
    currency: string;
    providerLabel: string;
    orderId: string;
  }): Promise<boolean> {
    const subject = 'Your payment was confirmed';
    const safeName = escapeHtml(params.name);
    const safeProvider = escapeHtml(params.providerLabel);
    const safeOrderId = escapeHtml(params.orderId);
    const safeCourseTitle = escapeHtml(params.courseTitle);
    const safeCourseNames = params.courseNames
      .map((name) => `<li>${escapeHtml(name)}</li>`)
      .join('');
    const myCoursesUrl = escapeHtml(this.getAppUrl('/dashboard/courses'));

    return this.sendMail({
      to: params.to,
      subject,
      text: [
        `Hi ${params.name},`,
        '',
        `Your payment has been confirmed via ${params.providerLabel}.`,
        `Order ID: ${params.orderId}`,
        `Amount: ${params.amount} ${params.currency.toUpperCase()}`,
        `Courses: ${params.courseNames.length ? params.courseNames.join(', ') : params.courseTitle}`,
        `Open your courses: ${this.getAppUrl('/dashboard/courses')}`,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b">
          <h2 style="margin:0 0 16px">Payment confirmed</h2>
          <p>Hi ${safeName},</p>
          <p>Your payment has been confirmed via <strong>${safeProvider}</strong> and your enrollment is now active.</p>
          <p><strong>Order ID:</strong> ${safeOrderId}</p>
          <p><strong>Amount:</strong> ${escapeHtml(
            `${params.amount} ${params.currency.toUpperCase()}`,
          )}</p>
          <p><strong>Order summary:</strong> ${safeCourseTitle}</p>
          ${
            safeCourseNames
              ? `<ul style="padding-left:18px;margin:8px 0 16px">${safeCourseNames}</ul>`
              : ''
          }
          <p>
            <a href="${myCoursesUrl}" style="display:inline-block;padding:12px 20px;background:#cfa64a;color:#111827;text-decoration:none;border-radius:8px;font-weight:600">
              Open my courses
            </a>
          </p>
        </div>
      `,
    });
  }
}
