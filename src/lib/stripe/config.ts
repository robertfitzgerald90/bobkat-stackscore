export type StripeConfig = {
  secretKey: string;
  webhookSecret: string | undefined;
  assessmentPriceId: string;
  vcioPriceId: string | undefined;
};

export function getStripeConfig(): StripeConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const assessmentPriceId = process.env.STRIPE_ASSESSMENT_PRICE_ID?.trim();
  if (!assessmentPriceId) {
    throw new Error("STRIPE_ASSESSMENT_PRICE_ID is not configured");
  }

  return {
    secretKey,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined,
    assessmentPriceId,
    vcioPriceId: process.env.STRIPE_VCIO_PRICE_ID?.trim() || undefined,
  };
}

export function requireStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

export function requireVcioPriceId(): string {
  const priceId = process.env.STRIPE_VCIO_PRICE_ID?.trim();
  if (!priceId) {
    throw new Error("STRIPE_VCIO_PRICE_ID is not configured");
  }
  return priceId;
}
