import { buildAnalyticsTransactionId } from "@/lib/analytics/ga4-transaction-id";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";
import { isTechnologyAssessmentProduct } from "@/lib/stripe/products";

export type VerifiedAssessmentPurchaseAnalytics = {
  transactionId: string;
  value: number;
  currency: string;
};

export { buildAnalyticsTransactionId };

/**
 * Server-side verification for GA4 `purchase`.
 * Requires Stripe Checkout Session payment_status === "paid" and product type match.
 * Returns null when verification fails — callers must not invent a purchase event.
 */
export async function verifyAssessmentPurchaseForAnalytics(
  sessionId: string | undefined,
): Promise<VerifiedAssessmentPurchaseAnalytics | null> {
  if (!sessionId?.startsWith("cs_")) return null;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const productType = session.metadata?.productType ?? session.metadata?.product;

    if (session.payment_status !== "paid") return null;
    if (!isTechnologyAssessmentProduct(productType)) return null;

    const purchase = await prisma.assessmentPurchase.findUnique({
      where: { stripeSessionId: session.id },
      select: { id: true },
    });

    const amountCents = session.amount_total;
    const value =
      typeof amountCents === "number" && amountCents > 0 ? amountCents / 100 : 1500;
    const currency = (session.currency || "usd").toUpperCase();

    return {
      transactionId: buildAnalyticsTransactionId({
        purchaseId: purchase?.id,
        stripeSessionId: session.id,
      }),
      value,
      currency,
    };
  } catch {
    return null;
  }
}
