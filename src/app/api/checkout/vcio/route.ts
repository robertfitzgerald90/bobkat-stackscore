import { NextResponse } from "next/server";
import { resolveSessionUserFromDb } from "@/lib/auth/resolve-session-user";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/stripe/app-url";
import { getStripe } from "@/lib/stripe/client";
import { requireVcioPriceId } from "@/lib/stripe/config";
import {
  STACKSCORE_VCIO_PRODUCT_TYPE,
  STACKSCORE_VCIO_SERVICE_TYPE,
} from "@/lib/stripe/products";
import { isStaffRole } from "@/lib/api/access";
import { findBlockingVcioSubscription } from "@/lib/vcio/subscriptions";
import { getOrCreateStripeCustomerForClient } from "@/lib/vcio/stripe-customers";
import {
  VCIO_CHECKOUT_SOURCE,
  VCIO_CHECKOUT_SOURCE_BOBKAT,
} from "@/lib/vcio/constants";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import {
  STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,
  VCIO_OFFER_SUCCESS_PATH,
} from "@/lib/marketing/stackscore-routes";

function resolveCheckoutSource(raw: unknown): string {
  if (typeof raw !== "string") return VCIO_CHECKOUT_SOURCE;
  const normalized = raw.trim();
  if (normalized === VCIO_CHECKOUT_SOURCE_BOBKAT) return VCIO_CHECKOUT_SOURCE_BOBKAT;
  if (normalized === VCIO_CHECKOUT_SOURCE) return VCIO_CHECKOUT_SOURCE;
  return VCIO_CHECKOUT_SOURCE;
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const priceId = requireVcioPriceId();
    const appUrl = getAppUrl();
    const user = await resolveSessionUserFromDb();

    let requestBody: { source?: string } = {};
    try {
      requestBody = (await request.json()) as { source?: string };
    } catch {
      requestBody = {};
    }

    const checkoutSource = resolveCheckoutSource(requestBody.source);

    let clientId: string | undefined;
    let userId: string | undefined;
    let purchaserEmail: string | undefined;
    let stripeCustomerId: string | undefined;

    if (user?.role === "client" && user.clientId) {
      const blockingSubscription = await findBlockingVcioSubscription(user.clientId);
      if (blockingSubscription) {
        return NextResponse.json({
          alreadyActive: true,
          url: `${appUrl}/clients/${user.clientId}/billing?subscription=active`,
          message: "Your StackScore vCIO subscription is already active or pending.",
        });
      }

      const client = await prisma.client.findUnique({
        where: { id: user.clientId },
        select: { id: true, primaryContactEmail: true },
      });
      if (!client) {
        return NextResponse.json(
          { error: "Unable to resolve your client workspace.", code: "CLIENT_NOT_FOUND" },
          { status: 400 },
        );
      }

      clientId = client.id;
      userId = user.id;
      purchaserEmail = client.primaryContactEmail;
      stripeCustomerId = await getOrCreateStripeCustomerForClient(client.id);
    } else if (user && isStaffRole(user.role)) {
      // Staff can test the public flow, but subscriptions are not attached to staff accounts.
      purchaserEmail = user.email;
    }

    const environment = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "test";
    const metadata = {
      productType: STACKSCORE_VCIO_PRODUCT_TYPE,
      service: "strategic_it_consulting",
      serviceType: STACKSCORE_VCIO_SERVICE_TYPE,
      platform: "stackscore",
      source: checkoutSource,
      environment,
      ...(clientId ? { clientId } : {}),
      ...(userId ? { userId } : {}),
      ...(purchaserEmail ? { purchaserEmail } : {}),
    };

    const cancelUrl =
      checkoutSource === VCIO_CHECKOUT_SOURCE_BOBKAT
        ? BOBKAT_IT_URLS.strategicItConsulting
        : `${appUrl}${STRATEGIC_IT_CONSULTING_CHECKOUT_PATH}?checkout=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : undefined,
      billing_address_collection: "auto",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}${VCIO_OFFER_SUCCESS_PATH}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata,
      subscription_data: {
        metadata,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to start checkout session", code: "CHECKOUT_URL_MISSING" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[checkout/vcio]", error);
    const message =
      error instanceof Error && error.message.includes("is not configured")
        ? "StackScore vCIO checkout is not configured yet."
        : "We could not start Checkout. Please try again.";

    return NextResponse.json({ error: message, code: "VCIO_CHECKOUT_FAILED" }, { status: 500 });
  }
}
