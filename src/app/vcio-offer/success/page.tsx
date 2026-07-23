import Link from "next/link";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";
import { isStackScoreVcioProduct } from "@/lib/stripe/products";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import {
  STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,
} from "@/lib/marketing/stackscore-routes";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { buttonVariants } from "@/components/ui/button";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { MARKETING_AUTH_SHELL, MARKETING_PANEL } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

function StatusPanel({
  icon,
  title,
  message,
  children,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <PublicPageShell variant="auth">
      <main className={MARKETING_AUTH_SHELL}>
      <div className={cn(MARKETING_PANEL, "mx-auto max-w-2xl p-8 text-center")}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{message}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Subscription activation may take a few moments while payment confirmation is processed.
        </p>
        {children ? <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">{children}</div> : null}
      </div>
      </main>
    </PublicPageShell>
  );
}

export default async function VcioCheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) {
    return (
      <StatusPanel
        icon={<AlertCircle className="h-7 w-7" aria-hidden />}
        title="We could not verify this Checkout Session"
        message="The success link is missing a Checkout Session ID. Please contact Bobkat IT if this issue continues."
      >
        <Link href={STRATEGIC_IT_CONSULTING_CHECKOUT_PATH} className={buttonVariants({ variant: "outline" })}>
          Return to Strategic IT Consulting Checkout
        </Link>
      </StatusPanel>
    );
  }

  const stripe = getStripe();
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
  } catch {
    return (
      <StatusPanel
        icon={<AlertCircle className="h-7 w-7" aria-hidden />}
        title="We could not verify this Checkout Session"
        message="This Checkout Session could not be retrieved securely. Please contact Bobkat IT if this issue continues."
      >
        <Link href={STRATEGIC_IT_CONSULTING_CHECKOUT_PATH} className={buttonVariants({ variant: "outline" })}>
          Return to Strategic IT Consulting Checkout
        </Link>
      </StatusPanel>
    );
  }

  if (!isStackScoreVcioProduct(session.metadata?.productType)) {
    return (
      <StatusPanel
        icon={<AlertCircle className="h-7 w-7" aria-hidden />}
        title="Invalid Checkout Session"
        message="This Checkout Session is not associated with StackScore vCIO."
      >
        <a href={BOBKAT_IT_URLS.services} className={buttonVariants({ variant: "outline" })}>
          Learn about Bobkat IT Services
        </a>
      </StatusPanel>
    );
  }

  const currentSession = await auth();
  const metadataUserId = session.metadata?.userId;
  if (metadataUserId && currentSession?.user?.id && metadataUserId !== currentSession.user.id) {
    return (
      <StatusPanel
        icon={<AlertCircle className="h-7 w-7" aria-hidden />}
        title="Invalid Checkout Session"
        message="This Checkout Session is associated with a different StackScore account."
      />
    );
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  const localSubscription = subscriptionId
    ? await prisma.subscription.findUnique({
        where: { providerSubscriptionId: subscriptionId },
        include: { vcioOnboarding: true },
      })
    : null;

  if (!localSubscription) {
    return (
      <StatusPanel
        icon={<Clock className="h-7 w-7" aria-hidden />}
        title="Strategic IT Consulting subscription received"
        message="Your subscription has been received and StackScore access is being prepared. Check your email for account activation or login instructions. If the email does not arrive within a few minutes, check spam or contact Bobkat IT."
      >
        <Link href="/vcio-offer" className={buttonVariants({ variant: "outline" })}>
          Return to Offer Page
        </Link>
        <a
          href={SERVICES_CTA_DESTINATIONS.generalConsultation.href}
          className={buttonVariants({ variant: "default" })}
        >
          Schedule Initial Strategy Session
          <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
        </a>
      </StatusPanel>
    );
  }

  const onboardingComplete = Boolean(localSubscription.vcioOnboarding?.completedAt);
  const isActive = localSubscription.status === "active" || localSubscription.status === "trialing";

  return (
    <StatusPanel
      icon={<CheckCircle2 className="h-7 w-7" aria-hidden />}
      title="Strategic IT Consulting is ready"
      message={
        isActive
          ? "Your subscription is active and StackScore access is ready. Check your email for any remaining activation steps, then continue onboarding."
          : "Your subscription is being processed. Check your email for access instructions while Stripe confirms payment."
      }
    >
      <Link
        href={`/clients/${localSubscription.clientId}/technology-profile`}
        className={buttonVariants({ variant: "default" })}
      >
        Open StackScore
      </Link>
      <Link
        href={`/clients/${localSubscription.clientId}/vcio/onboarding`}
        className={buttonVariants({ variant: onboardingComplete ? "outline" : "default" })}
      >
        {onboardingComplete ? "Review Onboarding" : "Complete Onboarding"}
      </Link>
      <a
        href={SERVICES_CTA_DESTINATIONS.generalConsultation.href}
        className={buttonVariants({ variant: "outline" })}
      >
        Schedule Initial Strategy Session
        <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
      </a>
      <Link
        href={`/clients/${localSubscription.clientId}/billing`}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Manage Subscription
      </Link>
    </StatusPanel>
  );
}
