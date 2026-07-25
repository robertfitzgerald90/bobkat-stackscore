import { createHash } from "node:crypto";

/**
 * Build a non-sensitive analytics transaction id (server-only).
 * Prefer the internal AssessmentPurchase UUID; otherwise a one-way hash of the
 * Stripe session id (never send cs_… or customer ids to GA4).
 */
export function buildAnalyticsTransactionId(input: {
  purchaseId?: string | null;
  stripeSessionId: string;
}): string {
  if (input.purchaseId) return input.purchaseId;
  const digest = createHash("sha256").update(input.stripeSessionId).digest("hex").slice(0, 32);
  return `tma_${digest}`;
}
