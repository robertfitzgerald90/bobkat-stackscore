import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { requireStripeWebhookSecret } from "@/lib/stripe/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let webhookSecret: string;

  try {
    webhookSecret = requireStripeWebhookSecret();
  } catch (error) {
    console.error("[webhooks/stripe] Missing STRIPE_WEBHOOK_SECRET", error);
    return NextResponse.json(
      { error: "Webhook secret is not configured", code: "WEBHOOK_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature", code: "MISSING_SIGNATURE" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[webhooks/stripe] Signature verification failed", error);
    return NextResponse.json(
      { error: "Invalid webhook signature", code: "INVALID_SIGNATURE" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.info("[webhooks/stripe] checkout.session.completed", {
      sessionId: session.id,
      customerEmail: session.customer_details?.email ?? session.customer_email,
      paymentStatus: session.payment_status,
      metadata: session.metadata,
    });
  } else {
    console.info("[webhooks/stripe] Received event", { type: event.type, id: event.id });
  }

  return NextResponse.json({ received: true });
}
