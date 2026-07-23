import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/stripe/app-url";
import { getStripe } from "@/lib/stripe/client";
import { getStripeConfig } from "@/lib/stripe/config";
import { buildAssessmentCheckoutMetadata } from "@/lib/stripe/assessment-checkout";

type CheckoutRequestBody = {
  source?: string;
  prospectId?: string;
  campaignId?: string;
  leadId?: string;
  organizationId?: string;
  invitationId?: string;
};

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const { assessmentPriceId } = getStripeConfig();
    const appUrl = getAppUrl();

    let body: CheckoutRequestBody = {};
    try {
      body = (await request.json()) as CheckoutRequestBody;
    } catch {
      body = {};
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: assessmentPriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/assessment-offer`,
      metadata: buildAssessmentCheckoutMetadata(body),
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to start checkout session", code: "CHECKOUT_URL_MISSING" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[checkout/create-session]", error);
    const message =
      error instanceof Error && error.message.includes("is not configured")
        ? "Payment is not configured yet"
        : "Unable to start checkout";

    return NextResponse.json({ error: message, code: "CHECKOUT_FAILED" }, { status: 500 });
  }
}
