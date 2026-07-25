import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";

const CHECKOUT_SESSION_ID_PATTERN = /^cs_(test_|live_)?[A-Za-z0-9]+$/;

export function isValidCheckoutSessionId(sessionId: string | undefined): sessionId is string {
  return Boolean(sessionId && CHECKOUT_SESSION_ID_PATTERN.test(sessionId));
}

export async function retrieveCheckoutSession(
  sessionId: string,
  options?: Stripe.Checkout.SessionRetrieveParams,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, options);
}

export function sessionLineItemPriceIds(session: Stripe.Checkout.Session): string[] {
  const lineItems = session.line_items?.data ?? [];
  const ids: string[] = [];
  for (const item of lineItems) {
    const price = item.price;
    if (!price) continue;
    if (typeof price === "string") ids.push(price);
    else if (price.id) ids.push(price.id);
  }
  return ids;
}

export function sessionAmountMajorUnits(session: Stripe.Checkout.Session): number | null {
  if (typeof session.amount_total === "number" && session.amount_total >= 0) {
    return session.amount_total / 100;
  }
  return null;
}

export function subscriptionBillingInterval(
  subscription: Stripe.Subscription | null | undefined,
): "month" | "year" | "other" {
  const interval = subscription?.items?.data?.[0]?.price?.recurring?.interval;
  if (interval === "month" || interval === "year") return interval;
  return "other";
}

export function subscriptionPriceIds(
  subscription: Stripe.Subscription | null | undefined,
): string[] {
  if (!subscription) return [];
  return subscription.items.data
    .map((item) => (typeof item.price === "string" ? item.price : item.price?.id))
    .filter((id): id is string => Boolean(id));
}
