import {
  recordAndSendCommunication,
  type OutboundCommunicationResult,
} from "@/lib/communications/tracking/record-outbound";
import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import { sendInternalNotificationEmail } from "@/lib/communications/workflows/internal-notify";
import { buildActivationUrls } from "@/lib/email/templates/assessment-purchase";
import { getAppUrl } from "@/lib/stripe/app-url";
import type { VcioCustomerType } from "@/generated/prisma/client";
import { BRAND } from "@/lib/branding";
import {
  formatAssessmentWelcomeSummaryItems,
  VCIO_CUSTOMER_EMAIL_COPY,
} from "@/lib/vcio/customer-email-copy";

export async function sendVcioSubscriptionReceivedEmail(input: {
  clientId: string;
  userId?: string | null;
  to: string;
  activationToken?: string;
}): Promise<OutboundCommunicationResult> {
  const appUrl = getAppUrl();
  const onboardingUrl = `${appUrl}/portal/vcio/onboarding`;
  const activationUrl = input.activationToken
    ? buildActivationUrls(input.activationToken).activationUrl
    : onboardingUrl;
  const copy = VCIO_CUSTOMER_EMAIL_COPY.subscriptionReceived;

  const rendered = await renderCommunicationTemplate("EMAIL-010", {
    heroTitle: copy.heroTitle,
    heroDescription: copy.previewText,
    previewText: copy.previewText,
    paragraphs: [...copy.paragraphs],
    summaryItems: [...copy.summaryItems],
    primaryCta: {
      label: input.activationToken ? copy.primaryCtaActivation : copy.primaryCtaOnboarding,
      href: activationUrl,
    },
    secondaryCta: {
      label: copy.secondaryCta,
      href: `${appUrl}/portal/vcio`,
    },
  });

  return recordAndSendCommunication({
    to: input.to,
    subject: VCIO_CUSTOMER_EMAIL_COPY.welcome.subject,
    html: rendered.html,
    text: rendered.text,
    previewText: rendered.previewText,
    templateKey: "VCIO-SUBSCRIPTION-RECEIVED",
    clientId: input.clientId,
    userId: input.userId ?? null,
    metadata: { workflow: "vcio_subscription_received" },
  });
}

export async function sendVcioWelcomeEmail(input: {
  clientId: string;
  userId?: string | null;
  to: string;
  clientName?: string | null;
  organizationName: string;
  customerType: VcioCustomerType;
  technologyScore?: string | null;
  activationToken?: string;
  onboardingUrl?: string;
  dashboardUrl?: string;
  roadmapUrl?: string;
  strategySessionUrl?: string;
  isTest?: boolean;
  createdByUserId?: string | null;
  idempotencyKey?: string;
}) {
  const appUrl = getAppUrl();
  const onboardingUrl = input.onboardingUrl ?? `${appUrl}/portal/vcio/onboarding`;
  const dashboardUrl = input.dashboardUrl ?? `${appUrl}/portal/vcio`;
  const roadmapUrl = input.roadmapUrl ?? `${appUrl}/portal/roadmap`;
  const primaryHref = input.activationToken
    ? buildActivationUrls(input.activationToken).activationUrl
    : onboardingUrl;

  const scenario =
    input.customerType === "managed_services_client"
      ? (() => {
          const copy = VCIO_CUSTOMER_EMAIL_COPY.welcomeManagedServices;
          return {
            subject: copy.subject,
            previewText: VCIO_CUSTOMER_EMAIL_COPY.welcome.previewText,
            heroTitle: copy.heroTitle,
            heroDescription: copy.heroDescription,
            paragraphs: [...copy.paragraphs],
            summaryItems: [...copy.summaryItems],
            ctaLabel: copy.primaryCta,
            secondaryLabel: copy.secondaryCta,
            secondaryHref: onboardingUrl,
            primaryHref: roadmapUrl,
          };
        })()
      : input.customerType === "assessment_customer"
        ? (() => {
            const copy = VCIO_CUSTOMER_EMAIL_COPY.welcomeAssessmentCustomer;
            return {
              subject: copy.subject,
              previewText: VCIO_CUSTOMER_EMAIL_COPY.welcome.previewText,
              heroTitle: copy.heroTitle,
              heroDescription: copy.heroDescription,
              paragraphs: [...copy.paragraphs],
              summaryItems: formatAssessmentWelcomeSummaryItems(input.technologyScore),
              ctaLabel: copy.primaryCta,
              secondaryLabel: copy.secondaryCta,
              secondaryHref: dashboardUrl,
              primaryHref,
            };
          })()
        : (() => {
            const copy = VCIO_CUSTOMER_EMAIL_COPY.welcome;
            return {
              subject: copy.subject,
              previewText: copy.previewText,
              heroTitle: copy.heroTitle,
              heroDescription: copy.heroDescription,
              paragraphs: [...copy.paragraphs],
              summaryTitle: copy.summaryTitle,
              summaryItems: [...copy.summaryItems],
              ctaLabel: input.activationToken ? "Activate StackScore" : copy.primaryCta,
              secondaryLabel: copy.secondaryCta,
              secondaryHref: dashboardUrl,
              primaryHref,
            };
          })();

  const rendered = await renderCommunicationTemplate(
    "EMAIL-010",
    {
      clientName: input.clientName ?? "there",
      organizationName: input.organizationName,
      technologyScore: input.technologyScore ?? "",
      roadmapUrl,
      dashboardUrl,
      onboardingUrl,
      strategySessionUrl: onboardingUrl,
      supportEmail: BRAND.email,
      currentYear: String(new Date().getFullYear()),
      heroTitle: scenario.heroTitle,
      heroDescription: scenario.heroDescription,
      previewText: scenario.previewText,
      paragraphs: scenario.paragraphs,
      summaryTitle: "summaryTitle" in scenario ? scenario.summaryTitle : "What happens next",
      summaryItems: scenario.summaryItems,
      primaryCta: { label: scenario.ctaLabel, href: scenario.primaryHref },
      secondaryCta: { label: scenario.secondaryLabel, href: scenario.secondaryHref },
      closingParagraph: `Questions? Contact ${BRAND.email} and our team will help you get oriented.`,
    },
    { useSampleDefaults: true },
  );

  return recordAndSendCommunication({
    to: input.to,
    subject: input.isTest ? `[TEST] ${scenario.subject}` : scenario.subject,
    html: rendered.html,
    text: rendered.text,
    previewText: scenario.previewText,
    templateKey: "EMAIL-010",
    clientId: input.clientId,
    userId: input.userId ?? null,
    recipientName: input.clientName ?? undefined,
    isTest: input.isTest ?? false,
    createdByUserId: input.createdByUserId ?? null,
    metadata: {
      workflow: "vcio_welcome",
      customerType: input.customerType,
      templateVersion: "EMAIL-010",
      idempotencyKey: input.idempotencyKey,
      testMode: input.isTest ?? false,
    },
  });
}

export async function sendVcioPaymentFailedEmail(input: {
  clientId: string;
  userId?: string | null;
  to: string;
  gracePeriodDays: number;
  idempotencyKey?: string;
  relatedEntityId?: string | null;
}) {
  const billingUrl = `${getAppUrl()}/portal/billing`;
  const copy = VCIO_CUSTOMER_EMAIL_COPY.paymentFailed;
  const rendered = await renderCommunicationTemplate("VCIO-PAYMENT-FAILED", {
    heroTitle: copy.heroTitle,
    heroDescription: copy.previewText,
    previewText: copy.previewText,
    paragraphs: [...copy.paragraphs],
    primaryCta: { label: copy.primaryCta, href: billingUrl },
    closingParagraph: `Need help? Contact ${BRAND.email} and we'll assist right away.`,
  });

  await recordAndSendCommunication({
    to: input.to,
    subject: copy.subject,
    html: rendered.html,
    text: rendered.text,
    previewText: copy.previewText,
    templateKey: "VCIO-PAYMENT-FAILED",
    eventKey: "VCIO_PAYMENT_FAILED",
    sendType: "AUTOMATED",
    idempotencyKey: input.idempotencyKey ?? null,
    triggeredBy: "Stripe invoice.payment_failed",
    relatedEntityType: "SubscriptionInvoice",
    relatedEntityId: input.relatedEntityId ?? null,
    clientId: input.clientId,
    userId: input.userId ?? null,
    metadata: { workflow: "vcio_payment_failed" },
  });
}

export async function sendVcioLifecycleEmail(input: {
  clientId: string;
  userId?: string | null;
  to: string;
  subject: string;
  heroTitle: string;
  message?: string;
  previewText?: string;
  paragraphs?: string[];
  ctaLabel: string;
  ctaHref: string;
  templateKey: string;
  workflow: string;
  eventKey?: string;
  idempotencyKey?: string;
  relatedEntityId?: string | null;
}) {
  const fallbackMessage = input.message ?? input.paragraphs?.[0] ?? input.previewText ?? input.heroTitle;
  const rendered = await renderCommunicationTemplate(input.templateKey, {
    heroTitle: input.heroTitle,
    heroDescription: input.previewText ?? fallbackMessage,
    previewText: input.previewText ?? fallbackMessage,
    paragraphs: input.paragraphs ?? (input.message ? [input.message] : undefined),
    primaryCta: { label: input.ctaLabel, href: input.ctaHref },
    closingParagraph: `Questions? Contact ${BRAND.email}.`,
  });

  await recordAndSendCommunication({
    to: input.to,
    subject: input.subject,
    html: rendered.html,
    text: rendered.text,
    previewText: input.previewText ?? rendered.previewText,
    templateKey: input.templateKey,
    eventKey: input.eventKey ?? null,
    sendType: "AUTOMATED",
    idempotencyKey: input.idempotencyKey ?? null,
    triggeredBy: "Stripe subscription synchronization service",
    relatedEntityType: "Subscription",
    relatedEntityId: input.relatedEntityId ?? null,
    clientId: input.clientId,
    userId: input.userId ?? null,
    metadata: { workflow: input.workflow },
  });
}

export async function sendVcioAdminNotification(input: {
  subject: string;
  body: string;
  eventType: string;
}) {
  await sendInternalNotificationEmail(input);
}
