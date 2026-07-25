import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireVcioPriceId } from "@/lib/stripe/config";
import { isStackScoreVcioProduct } from "@/lib/stripe/products";
import {
  isValidCheckoutSessionId,
  retrieveCheckoutSession,
  sessionAmountMajorUnits,
  subscriptionBillingInterval,
  subscriptionPriceIds,
} from "@/lib/stripe/retrieve-checkout-session";
import type Stripe from "stripe";

export type SubscriptionConfirmationPrimaryCta =
  | { kind: "open_stackscore"; href: string; label: "Open StackScore" }
  | { kind: "continue_setup"; href: string; label: "Continue Setup" }
  | { kind: "sign_in"; href: string; label: "Sign In to Continue" }
  | { kind: "return_home"; href: "/"; label: "Return Home" };

export type SubscriptionConfirmationResult =
  | { status: "invalid" }
  | {
      status: "pending";
      primaryCta: SubscriptionConfirmationPrimaryCta;
    }
  | {
      status: "verified";
      primaryCta: SubscriptionConfirmationPrimaryCta;
      analytics: {
        transactionId: string;
        value: number;
        currency: string;
        subscriptionType: "strategic_it_consulting";
        paymentProvider: "stripe";
        billingInterval: "month" | "year" | "other";
      };
    };

function returnHomeCta(): SubscriptionConfirmationPrimaryCta {
  return { kind: "return_home", href: "/", label: "Return Home" };
}

function signInCta(): SubscriptionConfirmationPrimaryCta {
  return {
    kind: "sign_in",
    href: "/login?callbackUrl=%2Fportal%2Fvcio%2Fonboarding",
    label: "Sign In to Continue",
  };
}

function isAcceptableSubscriptionStatus(
  status: Stripe.Subscription.Status | string | null | undefined,
): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Server-side verification for `/subscription-activated`.
 * Never returns Stripe/subscription ids, emails, or company names for UI rendering.
 */
export async function verifySubscriptionConfirmation(
  sessionId: string | undefined,
): Promise<SubscriptionConfirmationResult> {
  if (!isValidCheckoutSessionId(sessionId)) {
    return { status: "invalid" };
  }

  try {
    const expectedPriceId = requireVcioPriceId();
    const session = await retrieveCheckoutSession(sessionId, {
      expand: ["subscription", "subscription.items.data.price", "line_items.data.price"],
    });

    if (!isStackScoreVcioProduct(session.metadata?.productType)) {
      return { status: "invalid" };
    }

    if (session.mode !== "subscription") {
      return { status: "invalid" };
    }

    const currentSession = await auth();
    const metadataUserId = session.metadata?.userId;
    if (
      metadataUserId &&
      currentSession?.user?.id &&
      metadataUserId !== currentSession.user.id
    ) {
      return { status: "invalid" };
    }

    const expandedSubscription =
      typeof session.subscription === "object" && session.subscription
        ? session.subscription
        : null;

    const stripeSubscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : expandedSubscription?.id;

    const priceIds = subscriptionPriceIds(expandedSubscription);
    if (priceIds.length > 0 && !priceIds.includes(expectedPriceId)) {
      return { status: "invalid" };
    }

    if (session.status !== "complete") {
      return { status: "pending", primaryCta: returnHomeCta() };
    }

    const localSubscription = stripeSubscriptionId
      ? await prisma.subscription.findUnique({
          where: { providerSubscriptionId: stripeSubscriptionId },
          select: {
            id: true,
            clientId: true,
            status: true,
            amountCents: true,
            currency: true,
            billingInterval: true,
            vcioOnboarding: { select: { completedAt: true } },
          },
        })
      : null;

    const stripeStatus = expandedSubscription?.status;
    const stripeActive = isAcceptableSubscriptionStatus(stripeStatus);
    const localActive =
      localSubscription &&
      isAcceptableSubscriptionStatus(localSubscription.status);

    if (!stripeActive && !localActive) {
      if (
        stripeStatus === "incomplete" ||
        stripeStatus === "incomplete_expired" ||
        session.payment_status === "unpaid"
      ) {
        return { status: "invalid" };
      }
      return { status: "pending", primaryCta: signInCta() };
    }

    if (!localSubscription) {
      // Checkout complete / Stripe active, webhook sync still catching up.
      return { status: "pending", primaryCta: currentSession?.user ? signInCta() : returnHomeCta() };
    }

    if (!localActive) {
      return { status: "pending", primaryCta: signInCta() };
    }

    let isAuthenticatedOwner = false;
    if (currentSession?.user?.id && currentSession.user.role === "client") {
      const sessionUser = await prisma.user.findUnique({
        where: { id: currentSession.user.id },
        select: { clientId: true, isActive: true },
      });
      isAuthenticatedOwner =
        Boolean(sessionUser?.isActive) &&
        sessionUser?.clientId === localSubscription.clientId;
    }

    const onboardingComplete = Boolean(localSubscription.vcioOnboarding?.completedAt);
    let primaryCta: SubscriptionConfirmationPrimaryCta = signInCta();

    if (isAuthenticatedOwner) {
      primaryCta = onboardingComplete
        ? { kind: "open_stackscore", href: "/dashboard", label: "Open StackScore" }
        : {
            kind: "continue_setup",
            href: `/clients/${localSubscription.clientId}/vcio/onboarding`,
            label: "Continue Setup",
          };
    }

    const valueFromSession = sessionAmountMajorUnits(session);
    const value =
      valueFromSession ??
      (localSubscription.amountCents > 0 ? localSubscription.amountCents / 100 : null);
    if (value === null) {
      return { status: "invalid" };
    }

    const currency = (session.currency || localSubscription.currency || "usd").toUpperCase();
    const billingInterval =
      subscriptionBillingInterval(expandedSubscription) !== "other"
        ? subscriptionBillingInterval(expandedSubscription)
        : localSubscription.billingInterval === "year"
          ? "year"
          : localSubscription.billingInterval === "month"
            ? "month"
            : "other";

    return {
      status: "verified",
      primaryCta,
      analytics: {
        transactionId: session.id,
        value,
        currency,
        subscriptionType: "strategic_it_consulting",
        paymentProvider: "stripe",
        billingInterval,
      },
    };
  } catch {
    return { status: "invalid" };
  }
}
