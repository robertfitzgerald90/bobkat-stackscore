import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripeConfig } from "@/lib/stripe/config";
import { isTechnologyAssessmentProduct } from "@/lib/stripe/products";
import {
  isValidCheckoutSessionId,
  retrieveCheckoutSession,
  sessionAmountMajorUnits,
  sessionLineItemPriceIds,
} from "@/lib/stripe/retrieve-checkout-session";

export type AssessmentConfirmationPrimaryCta =
  | { kind: "begin_assessment"; href: string; label: "Begin Assessment" }
  | { kind: "sign_in"; href: string; label: "Sign In to Continue" }
  | { kind: "return_home"; href: "/"; label: "Return Home" };

export type AssessmentConfirmationResult =
  | { status: "invalid" }
  | { status: "pending"; primaryCta: AssessmentConfirmationPrimaryCta }
  | {
      status: "verified";
      primaryCta: AssessmentConfirmationPrimaryCta;
      analytics: {
        /** Stripe Checkout Session id — used only for GA transaction dedupe, never rendered. */
        transactionId: string;
        value: number;
        currency: string;
        purchaseType: "technology_maturity_assessment";
        paymentProvider: "stripe";
      };
    };

function returnHomeCta(): AssessmentConfirmationPrimaryCta {
  return { kind: "return_home", href: "/", label: "Return Home" };
}

function sessionContainsAssessmentPrice(
  priceIds: string[],
  assessmentPriceId: string,
): boolean {
  return priceIds.includes(assessmentPriceId);
}

/**
 * Server-side verification for `/assessment-purchased`.
 * Returns only UI-safe CTA/status plus analytics payload (no emails, names, or rendered Stripe ids).
 */
export async function verifyAssessmentConfirmation(
  sessionId: string | undefined,
): Promise<AssessmentConfirmationResult> {
  if (!isValidCheckoutSessionId(sessionId)) {
    return { status: "invalid" };
  }

  try {
    const { assessmentPriceId } = getStripeConfig();
    const session = await retrieveCheckoutSession(sessionId, {
      expand: ["line_items.data.price"],
    });

    const productType = session.metadata?.productType ?? session.metadata?.product;
    if (!isTechnologyAssessmentProduct(productType)) {
      return { status: "invalid" };
    }

    if (session.mode !== "payment") {
      return { status: "invalid" };
    }

    const priceIds = sessionLineItemPriceIds(session);
    // Prefer line-item price match; fall back to metadata-only when Stripe omits expanded items.
    if (priceIds.length > 0 && !sessionContainsAssessmentPrice(priceIds, assessmentPriceId)) {
      return { status: "invalid" };
    }

    if (session.status !== "complete") {
      if (session.payment_status === "unpaid") {
        return { status: "invalid" };
      }
      return { status: "pending", primaryCta: returnHomeCta() };
    }

    if (session.payment_status === "unpaid") {
      return { status: "invalid" };
    }

    if (session.payment_status !== "paid") {
      return { status: "pending", primaryCta: returnHomeCta() };
    }

    const purchase = await prisma.assessmentPurchase.findUnique({
      where: { stripeSessionId: session.id },
      select: {
        id: true,
        status: true,
        assessmentId: true,
        userId: true,
        user: { select: { id: true, isActive: true } },
      },
    });

    const value = sessionAmountMajorUnits(session);
    if (value === null) {
      return { status: "invalid" };
    }

    const currency = (session.currency || "usd").toUpperCase();
    const analytics = {
      transactionId: session.id,
      value,
      currency,
      purchaseType: "technology_maturity_assessment" as const,
      paymentProvider: "stripe" as const,
    };

    const currentSession = await auth();
    const isAuthenticatedOwner =
      Boolean(currentSession?.user?.id) &&
      Boolean(purchase?.userId) &&
      currentSession?.user?.id === purchase?.userId &&
      Boolean(purchase?.user?.isActive);

    let primaryCta: AssessmentConfirmationPrimaryCta = returnHomeCta();

    if (isAuthenticatedOwner && purchase?.assessmentId) {
      primaryCta = {
        kind: "begin_assessment",
        href: "/assessment/start",
        label: "Begin Assessment",
      };
    } else if (purchase?.user?.isActive && purchase.assessmentId) {
      primaryCta = {
        kind: "begin_assessment",
        href: "/login?callbackUrl=%2Fassessment%2Fstart",
        label: "Begin Assessment",
      };
    } else if (purchase?.status === "fulfilled" && purchase.user?.isActive) {
      primaryCta = {
        kind: "sign_in",
        href: "/login?callbackUrl=%2Fassessment%2Fstart",
        label: "Sign In to Continue",
      };
    } else if (!currentSession?.user) {
      primaryCta = {
        kind: "sign_in",
        href: "/login",
        label: "Sign In to Continue",
      };
    }

    return {
      status: "verified",
      primaryCta,
      analytics,
    };
  } catch {
    return { status: "invalid" };
  }
}
