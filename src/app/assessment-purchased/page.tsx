import type { Metadata } from "next";
import Link from "next/link";
import { AssessmentPurchaseConfirmedTracker } from "@/components/analytics/assessment-purchase-confirmed-tracker";
import { ConfirmationPage } from "@/components/purchase/confirmation-page";
import { BRAND } from "@/lib/branding";
import { verifyAssessmentConfirmation } from "@/lib/stripe/verify-assessment-confirmation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Assessment Purchased | ${BRAND.productName}`,
  description:
    "Your StackScore Technology Maturity Assessment purchase is complete. Review the next steps and access instructions.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

const SUCCESS_STEPS = [
  {
    title: "Purchase confirmed",
    description: "Your payment has been verified and your Technology Maturity Assessment is ready.",
  },
  {
    title: "Complete your organization profile",
    description:
      "Use the secure link in your email to activate access and finish any required account setup.",
  },
  {
    title: "Begin the assessment",
    description:
      "Work through the assessment using information about your current technology environment.",
  },
  {
    title: "Review your results and recommendations",
    description:
      "When finished, StackScore organizes findings into a maturity score, recommendations, and next steps.",
  },
] as const;

export default async function AssessmentPurchasedPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  const result = await verifyAssessmentConfirmation(sessionId);

  if (result.status === "invalid") {
    return (
      <ConfirmationPage
        variant="invalid"
        eyebrow="Unable to verify"
        headline="We couldn’t verify this purchase"
        supportingText="If you completed payment, check your email for confirmation or contact support. Do not share checkout links with others."
        steps={[]}
        supportNote={
          <>
            For help, contact{" "}
            <Link href={`mailto:${BRAND.email}`} className="text-primary underline-offset-4 hover:underline">
              {BRAND.email}
            </Link>
            .
          </>
        }
        primaryCta={{ href: "/assessment-offer", label: "Return to Assessment Offer" }}
        secondaryCta={{ href: "/login", label: "Sign In to Continue" }}
      />
    );
  }

  if (result.status === "pending") {
    return (
      <ConfirmationPage
        variant="pending"
        eyebrow="Payment processing"
        headline="Your payment is processing"
        supportingText="Stripe is still confirming this payment. You will receive email instructions after confirmation completes. This page will not treat the purchase as complete until payment is verified."
        steps={[
          {
            title: "Payment received by Stripe",
            description: "Your checkout completed, and Stripe is finishing payment confirmation.",
          },
          {
            title: "Access follows confirmation",
            description: "Once payment succeeds, StackScore emails secure access instructions.",
          },
        ]}
        supportNote={
          <>
            If you do not hear from us within a few minutes, check your spam folder. For help, contact{" "}
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
      eyebrow="Assessment purchased"
      headline="Your Technology Maturity Assessment Is Ready"
      supportingText="Your purchase has been confirmed. Check your email for your receipt and instructions for beginning the assessment."
      steps={SUCCESS_STEPS.map((step) => ({ ...step }))}
      supportNote={
        <>
          If the invitation does not arrive within a few minutes, check your spam folder. For help,
          contact{" "}
          <Link href={`mailto:${BRAND.email}`} className="text-primary underline-offset-4 hover:underline">
            {BRAND.email}
          </Link>
          .
        </>
      }
      primaryCta={result.primaryCta}
      secondaryCta={{ href: "/", label: "Return Home" }}
      tracker={<AssessmentPurchaseConfirmedTracker verified={result.analytics} />}
    />
  );
}
