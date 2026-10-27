import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AssessmentPurchaseConfirmedTracker } from "@/components/analytics/assessment-purchase-confirmed-tracker";
import { ConfirmationPage } from "@/components/purchase/confirmation-page";
import { BRAND } from "@/lib/branding";
import {
  type AssessmentConfirmationEmailState,
  verifyAssessmentConfirmation,
} from "@/lib/stripe/verify-assessment-confirmation";

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

function SupportContactNote({ preface }: { preface: ReactNode }) {
  return (
    <>
      {preface} For help, contact{" "}
      <Link href={`mailto:${BRAND.email}`} className="text-primary underline-offset-4 hover:underline">
        {BRAND.email}
      </Link>
      .
    </>
  );
}

const FULFILLED_STEPS = [
  {
    title: "Purchase confirmed",
    description: "Your payment has been verified and your Technology Maturity Assessment workspace is being prepared.",
  },
  {
    title: "Activation email sent",
    description:
      "We sent a secure activation email to the address used at checkout. Delivery can take several minutes.",
  },
  {
    title: "Check Spam or Junk",
    description:
      "If you do not see the message in your inbox, open Spam/Junk and mark the StackScore email as Not Spam / Not Junk so future messages arrive normally.",
  },
  {
    title: "Begin the assessment",
    description:
      "After you activate your account, work through the assessment using information about your current technology environment.",
  },
] as const;

const PENDING_FULFILLMENT_STEPS = [
  {
    title: "Payment confirmed",
    description: "Stripe reports this checkout as paid. StackScore is finishing account setup.",
  },
  {
    title: "Access email comes next",
    description:
      "You will receive activation instructions by email after fulfillment completes. This page does not treat setup as finished until that step succeeds.",
  },
] as const;

const MANUAL_REVIEW_STEPS = [
  {
    title: "Payment confirmed",
    description: "Your payment was verified successfully.",
  },
  {
    title: "Account setup needs a short review",
    description:
      "This purchase requires a quick check by our team before automatic activation can complete. We have not sent an activation email yet.",
  },
] as const;

function verifiedCopy(emailState: AssessmentConfirmationEmailState): {
  variant: "success" | "pending";
  eyebrow: string;
  headline: string;
  supportingText: string;
  steps: { title: string; description: string }[];
  supportNote: ReactNode;
} {
  if (emailState === "activation_email_sent") {
    return {
      variant: "success",
      eyebrow: "Assessment purchased",
      headline: "Your Technology Maturity Assessment Is Ready",
      supportingText:
        "Your purchase is confirmed and your activation email has been sent. It may take several minutes to arrive—please check Spam or Junk if you do not see it soon, and mark it as Not Spam if it was filtered.",
      steps: FULFILLED_STEPS.map((step) => ({ ...step })),
      supportNote: (
        <SupportContactNote
          preface="Look for a message from StackScore / Bobkat IT. Marking it as Not Spam helps future messages reach your inbox."
        />
      ),
    };
  }

  if (emailState === "manual_review") {
    return {
      variant: "pending",
      eyebrow: "Purchase received",
      headline: "Payment confirmed — account setup in review",
      supportingText:
        "Your payment succeeded. Because this purchase needs a short staff review, we have not sent an activation email yet. Our team will follow up with next steps.",
      steps: MANUAL_REVIEW_STEPS.map((step) => ({ ...step })),
      supportNote: (
        <SupportContactNote preface="No activation email was sent for this purchase while review is open." />
      ),
    };
  }

  // fulfillment_pending | other
  return {
    variant: "pending",
    eyebrow: "Finishing setup",
    headline: "Payment confirmed — preparing your access",
    supportingText:
      "Your payment is confirmed. StackScore is still completing account setup, so an activation email may not have been sent yet. Refresh this page in a minute or two.",
    steps: PENDING_FULFILLMENT_STEPS.map((step) => ({ ...step })),
    supportNote: (
      <SupportContactNote
        preface="We only confirm that an activation email was sent after fulfillment finishes successfully."
      />
    ),
  };
}

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
          <SupportContactNote preface="If you completed payment, keep your Stripe receipt handy." />
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
          <SupportContactNote preface="If you do not hear from us within a few minutes, check your spam folder." />
        }
        primaryCta={result.primaryCta}
      />
    );
  }

  const copy = verifiedCopy(result.emailState);

  return (
    <ConfirmationPage
      variant={copy.variant}
      eyebrow={copy.eyebrow}
      headline={copy.headline}
      supportingText={copy.supportingText}
      steps={copy.steps}
      supportNote={copy.supportNote}
      primaryCta={result.primaryCta}
      secondaryCta={{ href: "/", label: "Return Home" }}
      tracker={<AssessmentPurchaseConfirmedTracker verified={result.analytics} />}
    />
  );
}
