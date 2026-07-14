import type Stripe from "stripe";
import type {
  BillingInterval,
  Subscription,
  SubscriptionStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { recordBillingAudit } from "@/lib/billing/audit";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import {
  activationTokenExpiresAt,
  createPlaceholderPasswordHash,
  generateActivationToken,
  normalizePurchaserEmail,
  resolveCompanyName,
  resolveContactName,
  STAFF_ROLES,
} from "@/lib/stripe/fulfillment/helpers";
import {
  VCIO_MONTHLY_AMOUNT_CENTS,
  VCIO_SERVICE_NAME,
  VCIO_SERVICE_TYPE,
} from "@/lib/vcio/constants";
import { findClientIdByStripeCustomerId } from "@/lib/vcio/stripe-customers";
import { initializeVcioClient } from "@/lib/vcio/initialization";

type SyncResult =
  | {
      outcome: "synced";
      subscription: Subscription;
      clientId: string;
      purchaserEmail: string;
      userId: string | null;
      activationToken?: string;
      manualReview: boolean;
    }
  | { outcome: "pending_client"; reason: string };

type EnsureClientResult = {
  clientId: string;
  userId: string | null;
  purchaserEmail: string;
  activationToken?: string;
  manualReview: boolean;
};

type StripeSubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start?: number | null;
  current_period_end?: number | null;
  trial_start?: number | null;
  trial_end?: number | null;
  canceled_at?: number | null;
  ended_at?: number | null;
};

function dateFromStripeTimestamp(timestamp: number | null | undefined): Date | null {
  return typeof timestamp === "number" ? new Date(timestamp * 1000) : null;
}

function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function normalizeStripeSubscriptionStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "unpaid":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return status;
    default:
      return "unknown";
  }
}

function normalizeBillingInterval(interval: string | null | undefined): BillingInterval {
  if (interval === "month" || interval === "year") return interval;
  return "custom";
}

function getSubscriptionPrice(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price ?? null;
}

function getProductId(price: Stripe.Price | null): string | null {
  if (!price?.product) return null;
  return typeof price.product === "string" ? price.product : price.product.id;
}

function getLatestInvoiceId(subscription: Stripe.Subscription): string | null {
  return stripeId(subscription.latest_invoice as string | { id: string } | null | undefined);
}

async function ensureRecurringService(clientId: string) {
  const existing = await prisma.recurringService.findFirst({
    where: {
      clientId,
      serviceName: VCIO_SERVICE_NAME,
      status: { in: ["pending_activation", "active", "past_due", "cancellation_scheduled"] },
    },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;

  return prisma.recurringService.create({
    data: {
      clientId,
      serviceName: VCIO_SERVICE_NAME,
      description: "Ongoing technology advisory, roadmap management, executive reporting, and quarterly reviews.",
      unitPriceCents: VCIO_MONTHLY_AMOUNT_CENTS,
      billingFrequency: "monthly",
      startDate: new Date(),
      nextBillingDate: new Date(),
      status: "pending_activation",
    },
  });
}

async function createOrMatchClientFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<EnsureClientResult> {
  const rawEmail = session.customer_details?.email ?? session.customer_email;
  if (!rawEmail) throw new Error("vCIO Checkout Session is missing a verified purchaser email");

  const purchaserEmail = normalizePurchaserEmail(rawEmail);
  const contactName = resolveContactName(session.customer_details?.name, purchaserEmail);
  const companyName = resolveCompanyName(session.customer_details?.name);
  const stripeCustomerId = stripeId(session.customer as string | { id: string } | null);

  const existingUser = await prisma.user.findUnique({
    where: { email: purchaserEmail },
    select: { id: true, role: true, clientId: true, isActive: true },
  });

  if (existingUser && STAFF_ROLES.includes(existingUser.role as (typeof STAFF_ROLES)[number])) {
    const client = await prisma.client.create({
      data: {
        companyName,
        primaryContactName: contactName,
        primaryContactEmail: purchaserEmail,
        status: "prospect",
        technologyProfile: { create: {} },
        billingProfile: stripeCustomerId
          ? {
              create: {
                billingCompanyName: companyName,
                billingEmail: purchaserEmail,
                stripeCustomerId,
              },
            }
          : undefined,
      },
    });
    return {
      clientId: client.id,
      userId: null,
      purchaserEmail,
      manualReview: true,
    };
  }

  if (existingUser?.clientId) {
    if (stripeCustomerId) {
      await prisma.clientBillingProfile.upsert({
        where: { clientId: existingUser.clientId },
        create: {
          clientId: existingUser.clientId,
          billingCompanyName: companyName,
          billingEmail: purchaserEmail,
          stripeCustomerId,
        },
        update: { stripeCustomerId, billingEmail: purchaserEmail },
      });
    }
    return {
      clientId: existingUser.clientId,
      userId: existingUser.id,
      purchaserEmail,
      manualReview: false,
    };
  }

  const passwordHash = await createPlaceholderPasswordHash();
  const { rawToken, tokenHash } = generateActivationToken();

  const result = await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        companyName,
        primaryContactName: contactName,
        primaryContactEmail: purchaserEmail,
        status: "active",
        technologyProfile: { create: {} },
        billingProfile: stripeCustomerId
          ? {
              create: {
                billingCompanyName: companyName,
                billingEmail: purchaserEmail,
                stripeCustomerId,
              },
            }
          : undefined,
      },
    });

    const user = existingUser
      ? await tx.user.update({
          where: { id: existingUser.id },
          data: { clientId: client.id, role: "client", invitedAt: new Date() },
        })
      : await tx.user.create({
          data: {
            name: contactName,
            email: purchaserEmail,
            passwordHash,
            role: "client",
            isActive: false,
            invitedAt: new Date(),
            clientId: client.id,
          },
        });

    await tx.accountActivationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: activationTokenExpiresAt(),
      },
    });

    return { client, user };
  });

  return {
    clientId: result.client.id,
    userId: result.user.id,
    purchaserEmail,
    activationToken: rawToken,
    manualReview: false,
  };
}

async function resolveClientIdForSubscription(
  subscription: Stripe.Subscription,
  checkoutSession?: Stripe.Checkout.Session,
): Promise<EnsureClientResult | { clientId: string; userId: null; purchaserEmail: string; manualReview: false } | null> {
  const metadataClientId = subscription.metadata?.clientId ?? checkoutSession?.metadata?.clientId;
  if (metadataClientId) {
    const client = await prisma.client.findUnique({
      where: { id: metadataClientId },
      select: { id: true, primaryContactEmail: true },
    });
    if (client) {
      return {
        clientId: client.id,
        userId: null,
        purchaserEmail: client.primaryContactEmail,
        manualReview: false,
      };
    }
  }

  const customerId = stripeId(subscription.customer as string | { id: string } | null);
  if (customerId) {
    const clientId = await findClientIdByStripeCustomerId(customerId);
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { primaryContactEmail: true },
      });
      return {
        clientId,
        userId: null,
        purchaserEmail: client?.primaryContactEmail ?? "",
        manualReview: false,
      };
    }
  }

  if (checkoutSession) {
    return createOrMatchClientFromCheckoutSession(checkoutSession);
  }

  return null;
}

export async function syncVcioSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  options: {
    checkoutSession?: Stripe.Checkout.Session;
    stripeEventCreatedAt?: Date;
  } = {},
): Promise<SyncResult> {
  const resolved = await resolveClientIdForSubscription(subscription, options.checkoutSession);
  if (!resolved) {
    return { outcome: "pending_client", reason: "No local client could be resolved yet" };
  }

  const customerId = stripeId(subscription.customer as string | { id: string } | null);
  if (!customerId) {
    return { outcome: "pending_client", reason: "Stripe subscription is missing a customer" };
  }

  const price = getSubscriptionPrice(subscription);
  const subWithPeriods = subscription as StripeSubscriptionWithPeriods;
  const status = normalizeStripeSubscriptionStatus(subscription.status);
  const recurringService = await ensureRecurringService(resolved.clientId);
  const previousSubscription = await prisma.subscription.findUnique({
    where: { providerSubscriptionId: subscription.id },
    select: { status: true, cancelAtPeriodEnd: true },
  });

  const localSubscription = await prisma.subscription.upsert({
    where: { providerSubscriptionId: subscription.id },
    create: {
      clientId: resolved.clientId,
      recurringServiceId: recurringService.id,
      provider: "stripe",
      providerCustomerId: customerId,
      providerSubscriptionId: subscription.id,
      providerPriceId: price?.id ?? "",
      providerProductId: getProductId(price),
      serviceType: VCIO_SERVICE_TYPE,
      billingInterval: normalizeBillingInterval(price?.recurring?.interval),
      amountCents: price?.unit_amount ?? VCIO_MONTHLY_AMOUNT_CENTS,
      currency: price?.currency ?? "usd",
      status,
      rawStatus: subscription.status,
      currentPeriodStart: dateFromStripeTimestamp(subWithPeriods.current_period_start),
      currentPeriodEnd: dateFromStripeTimestamp(subWithPeriods.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
      canceledAt: dateFromStripeTimestamp(subWithPeriods.canceled_at),
      endedAt: dateFromStripeTimestamp(subWithPeriods.ended_at),
      trialStart: dateFromStripeTimestamp(subWithPeriods.trial_start),
      trialEnd: dateFromStripeTimestamp(subWithPeriods.trial_end),
      latestInvoiceProviderId: getLatestInvoiceId(subscription),
      lastStripeEventCreatedAt: options.stripeEventCreatedAt ?? null,
    },
    update: {
      recurringServiceId: recurringService.id,
      providerCustomerId: customerId,
      providerPriceId: price?.id ?? "",
      providerProductId: getProductId(price),
      billingInterval: normalizeBillingInterval(price?.recurring?.interval),
      amountCents: price?.unit_amount ?? VCIO_MONTHLY_AMOUNT_CENTS,
      currency: price?.currency ?? "usd",
      status,
      rawStatus: subscription.status,
      currentPeriodStart: dateFromStripeTimestamp(subWithPeriods.current_period_start),
      currentPeriodEnd: dateFromStripeTimestamp(subWithPeriods.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
      canceledAt: dateFromStripeTimestamp(subWithPeriods.canceled_at),
      endedAt: dateFromStripeTimestamp(subWithPeriods.ended_at),
      trialStart: dateFromStripeTimestamp(subWithPeriods.trial_start),
      trialEnd: dateFromStripeTimestamp(subWithPeriods.trial_end),
      latestInvoiceProviderId: getLatestInvoiceId(subscription),
      lastStripeEventCreatedAt: options.stripeEventCreatedAt ?? null,
    },
  });

  await prisma.recurringService.update({
    where: { id: recurringService.id },
    data: {
      status:
        status === "active" || status === "trialing"
          ? "active"
          : status === "past_due"
            ? "past_due"
            : status === "canceled"
              ? "canceled"
              : status === "paused"
                ? "paused"
                : "pending_activation",
      paymentMethodStatus: status,
      renewalDate: localSubscription.currentPeriodEnd,
      nextBillingDate: localSubscription.currentPeriodEnd,
      lastInvoiceDate: localSubscription.lastPaymentAt ?? undefined,
    },
  });

  await recordBillingAudit({
    clientId: resolved.clientId,
    action:
      status === "active" || status === "trialing"
        ? "recurring_service_activated"
        : status === "canceled"
          ? "recurring_service_canceled"
          : "recurring_service_paused",
    metadata: {
      serviceType: VCIO_SERVICE_TYPE,
      stripeSubscriptionId: subscription.id,
      status,
    },
  });

  if (
    (status === "active" || status === "trialing") &&
    previousSubscription?.status !== "active" &&
    previousSubscription?.status !== "trialing"
  ) {
    await initializeVcioClient({
      organizationId: resolved.clientId,
      subscriptionId: localSubscription.id,
      source: "STRIPE",
      sendWelcomeEmail: !("manualReview" in resolved && resolved.manualReview),
      welcomeRecipientEmail: resolved.purchaserEmail || undefined,
      activationToken: "activationToken" in resolved ? resolved.activationToken : undefined,
      initializationIdempotencyKey: `vcio-onboarding:${resolved.clientId}:${localSubscription.id}`,
      welcomeIdempotencyKey: `vcio-welcome:${resolved.clientId}:${localSubscription.id}:1`,
    });
  }

  await recordOrganizationActivity({
    clientId: resolved.clientId,
    category: "BILLING",
    eventType: "vcio_subscription_synced",
    title: "StackScore vCIO subscription updated",
    description: `StackScore vCIO subscription status is ${status}.`,
    sourceRecordType: "Subscription",
    sourceRecordId: localSubscription.id,
    visibility: "INTERNAL",
    metadata: {
      status,
      stripeSubscriptionId: subscription.id,
      manualReview: "manualReview" in resolved ? resolved.manualReview : false,
    },
  });

  const clientContact = await prisma.client.findUnique({
    where: { id: resolved.clientId },
    select: {
      companyName: true,
      primaryContactName: true,
      primaryContactEmail: true,
      technologyProfile: { select: { overallStackScore: true } },
      vcioOnboarding: { select: { customerType: true } },
      users: { select: { id: true }, take: 1 },
    },
  });

  if (clientContact?.primaryContactEmail) {
    const { sendVcioAdminNotification, sendVcioLifecycleEmail } = await import(
      "@/lib/vcio/emails"
    );
    const appUrl = (await import("@/lib/stripe/app-url")).getAppUrl();
    const userId = clientContact.users[0]?.id ?? null;

    if (localSubscription.cancelAtPeriodEnd && !previousSubscription?.cancelAtPeriodEnd) {
      await sendVcioLifecycleEmail({
        clientId: resolved.clientId,
        userId,
        to: clientContact.primaryContactEmail,
        subject: "StackScore vCIO cancellation scheduled",
        message:
          "Your StackScore vCIO subscription is scheduled to cancel at the end of the current paid period. Access continues until that date.",
        ctaLabel: "Manage Subscription",
        ctaHref: `${appUrl}/portal/billing`,
        templateKey: "VCIO-CANCELLATION-SCHEDULED",
        workflow: "vcio_cancellation_scheduled",
      });
      await sendVcioAdminNotification({
        subject: "StackScore vCIO cancellation scheduled",
        eventType: "vcio_cancellation_scheduled",
        body: `A StackScore vCIO cancellation was scheduled for client ${resolved.clientId}.`,
      });
    }

    if (status === "canceled" && previousSubscription?.status !== "canceled") {
      await sendVcioLifecycleEmail({
        clientId: resolved.clientId,
        userId,
        to: clientContact.primaryContactEmail,
        subject: "StackScore vCIO subscription ended",
        message:
          "Your StackScore vCIO subscription has ended. Historical records are preserved, and ongoing advisory features may be read-only.",
        ctaLabel: "Reactivate StackScore vCIO",
        ctaHref: `${appUrl}/vcio-offer`,
        templateKey: "VCIO-SUBSCRIPTION-ENDED",
        workflow: "vcio_subscription_ended",
      });
    }
  }

  return {
    outcome: "synced",
    subscription: localSubscription,
    clientId: resolved.clientId,
    purchaserEmail: resolved.purchaserEmail,
    userId: resolved.userId,
    activationToken: "activationToken" in resolved ? resolved.activationToken : undefined,
    manualReview: "manualReview" in resolved ? resolved.manualReview : false,
  };
}

export async function fulfillVcioCheckoutSession(session: Stripe.Checkout.Session) {
  if (!session.subscription) {
    throw new Error("vCIO Checkout Session is missing a subscription");
  }

  const { getStripe } = await import("@/lib/stripe/client");
  const stripe = getStripe();
  const subscriptionId = stripeId(session.subscription as string | { id: string } | null);
  if (!subscriptionId) throw new Error("Unable to resolve vCIO Stripe subscription ID");

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product", "latest_invoice"],
  });

  const result = await syncVcioSubscriptionFromStripe(subscription, { checkoutSession: session });
  if (result.outcome === "synced") {
    const { sendVcioAdminNotification } = await import(
      "@/lib/vcio/emails"
    );

    await sendVcioAdminNotification({
      subject: "New StackScore vCIO subscription",
      eventType: "vcio_subscription_created",
      body: `A StackScore vCIO subscription was received for client ${result.clientId}. Manual review: ${result.manualReview ? "yes" : "no"}.`,
    });
  }
  return result;
}

export async function findBlockingVcioSubscription(clientId: string) {
  return prisma.subscription.findFirst({
    where: {
      clientId,
      serviceType: VCIO_SERVICE_TYPE,
      status: { in: ["active", "trialing", "past_due", "incomplete"] },
    },
    orderBy: { updatedAt: "desc" },
  });
}
