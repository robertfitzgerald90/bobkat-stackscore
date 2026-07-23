export const VCIO_SERVICE_NAME = "StackScore vCIO";
/** Display / reporting amount for Strategic IT Consulting (StackScore vCIO). Stripe Price ID is authoritative. */
export const VCIO_MONTHLY_AMOUNT_CENTS = 50_000;
export const VCIO_SERVICE_TYPE = "stackscore_vcio" as const;
export const VCIO_STRIPE_SERVICE_TYPE = "STACKSCORE_VCIO" as const;
export const VCIO_CHECKOUT_SOURCE = "vcio-offer" as const;
export const VCIO_CHECKOUT_SOURCE_BOBKAT = "bobkat_it_website" as const;

export const VCIO_ACTIVE_OR_PENDING_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "incomplete",
] as const;

export function getVcioPaymentGracePeriodDays(): number {
  const raw = process.env.VCIO_PAYMENT_GRACE_PERIOD_DAYS?.trim();
  if (!raw) return 7;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 7;
}
