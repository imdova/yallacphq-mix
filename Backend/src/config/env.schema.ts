import { z } from 'zod';

const mongoUriSchema = z
  .string()
  .min(1)
  .refine((v) => /^mongodb(\+srv)?:\/\//i.test(v), {
    message: 'MONGODB_URI must start with mongodb:// or mongodb+srv://',
  });

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  MONGODB_URI: mongoUriSchema,

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN: z.string().min(1).default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('7d'),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  // AWS S3 (optional – required only for image uploads)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY: z.string().optional(),
  AWS_SECRET_KEY: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),

  // App / email links
  FRONTEND_URL: z.string().url().optional(),
  APP_URL: z.string().url().optional(),

  // SMTP / email
  SMTP_TRANSPORT: z.string().optional(),
  SMTP_DEMO_EMAIL: z.string().email().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // PayPal (optional – required only for server-side capture on checkout confirm)
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_SECRET: z.string().optional(),
  PAYPAL_API_BASE: z.string().url().optional(),

  // Paymob (optional – required only when using Paymob at checkout)
  PAYMOB_SECRET_KEY: z.string().optional(),
  PAYMOB_HMAC_SECRET: z.string().optional(),
  PAYMOB_PUBLIC_KEY: z.string().optional(),
  PAYMOB_INTEGRATION_ID: z.coerce.number().int().optional(),
  /** Optional: ewallet integration (e.g. 5514086). Shown with card on Unified Checkout. */
  PAYMOB_EWALLET_INTEGRATION_ID: z.coerce.number().int().optional(),
  /** Optional: Accept Kiosk integration ID. */
  PAYMOB_KIOSK_INTEGRATION_ID: z.coerce.number().int().optional(),
  PAYMOB_BASE_URL: z.string().url().optional(),
  PAYMOB_UNIFIED_CHECKOUT_BASE_URL: z.string().url().optional(),
  PAYMOB_CALLBACK_URL: z.string().url().optional(),
  PAYMOB_SUCCESS_REDIRECT_URL: z.string().url().optional(),
  PAYMOB_SKIP_HMAC_VERIFICATION: z.string().optional(),
  /** Currency required by your Paymob integration (e.g. EGP). Must match Integration ID in Paymob dashboard. */
  PAYMOB_CURRENCY: z.string().min(1).optional(),
  /** If true, send amount in main unit (e.g. EGP). If false (default), send in smallest unit (piastres for EGP). Set true if Paymob charges 100x too much. */
  PAYMOB_AMOUNT_IN_MAIN_UNIT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.') || 'env'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${message}`);
  }
  return parsed.data;
}
