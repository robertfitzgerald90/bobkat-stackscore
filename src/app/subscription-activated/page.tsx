import type { Metadata } from "next";
import Link from "next/link";
import { SubscriptionActivatedTracker } from "@/components/analytics/subscription-activated-tracker";
import { ConfirmationPage } from "@/components/purchase/confirmation-page";
import { BRAND } from "@/lib/branding";
import { STRATEGIC_IT_CONSULTING_CHECKOUT_PATH } from "@/lib/marketing/stackscore-routes";
import { verifySubscriptionConfirmation } from "@/lib/stripe/verify-subscription-confirmation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Subscription Activated | ${BRAND.productName}`,
  description:
    "Your StackScore Strategic IT Consulting subscription is active. Review the onboarding steps and access instructions.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

const SUCCESS_STEPS = [
  {
    title: "Subscription confirmed",
    description: "Your Strategic IT Consulting subscription is active in StackScore.",
  },
  {
    title: "Complete your company profile",
    description: "Finish onboarding so we can tailor priorities to your organization.",
  },
  {
    title: "Review your technology maturity",
    description: "Use assessments and workspace insights to understand your current state.",
  },
  {
    title: "Begin your improvement roadmap",
    description: "Organize recommendations, projects, and progress in one place.",
  },
] as const;

export default async function SubscriptionActivatedPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  const result = await verifySubscriptionConfirmation(sessionId);

  if (result.status === "invalid") {
    return (
      <ConfirmationPage
        variant="invalid"
        eyebrow="Unable to verify"
        headline="We couldn’t verify an active subscription"
        supportingText="If you completed checkout, check your email for confirmation or contact support."
        steps={[]}
        supportNote={
          <>
            Need help getting started? Contact{" "}
            <Link href={`mailto:${BRAND.email}`} className="text-primary underline-offset-4 hover:underline">
              {BRAND.email}
            </Link>
            .
          </>
        }
        primaryCta={{ href: STRATEGIC_IT_CONSULTING_CHECKOUT_PATH, label: "Return to Offer" }}
        secondaryCta={{ href: "/login", label: "Sign In to Continue" }}
      />
    );
  }

  if (result.status === "pending") {
    return (
      <ConfirmationPage
        variant="pending"
        eyebrow="Subscription processing"
        headline="Your subscription is being activated"
        supportingText="We have received your Strategic IT Consulting checkout. StackScore access is being prepared. Check your email for activation or sign-in instructions."
        steps={[
          {
            title: "Checkout received",
            description: "Stripe accepted your subscription checkout and is confirming activation.",
          },
          {
            title: "Workspace access follows",
            description: "Once activation completes, email instructions will point you into StackScore.",
          },
        ]}
        supportNote={
          <>
            Need help getting started? Contact{" "}
            <Link href={`mailto:${BRAND.email}`} className="text-primary underline-offset-4 hover:underline">
              {BRAND.email}
            </Link>
            .
          </>
        }
        primaryCta={result.primaryCta}
      />
    );
  }

  return (
    <ConfirmationPage
      variant="success"
      eyebrow="Subscription activated"
      headline="Your Strategic IT Consulting Subscription Is Active"
      supportingText="Your subscription has been confirmed. You can now continue into StackScore and begin building your technology improvement plan."
      steps={SUCCESS_STEPS.map((step) => ({ ...step }))}
      supportNote={
        <>
          Need help getting started? Contact{" "}
          <Link href={`mailto:${BRAND.email}`} className="text-primary underline-offset-4 hover:underline">
            {BRAND.email}
          </Link>
          .
        </>
      }
      primaryCta={result.primaryCta}
      secondaryCta={{ href: "/", label: "Return Home" }}
      tracker={<SubscriptionActivatedTracker verified={result.analytics} />}
    />
  );
}
