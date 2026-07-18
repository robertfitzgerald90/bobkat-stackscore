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

  const rendered = await renderCommunicationTemplate("EMAIL-010", {
    heroTitle: "Your StackScore vCIO Subscription Is Active",
    heroDescription: "We're preparing your advisory workspace and onboarding profile.",
    previewText: "Complete onboarding to begin your vCIO strategy session.",
    paragraphs: [
      "Thank you for subscribing to StackScore vCIO.",
      "Your subscription includes ongoing technology advisory, quarterly reviews, roadmap management, executive reporting, and direct access to Bobkat IT.",
    ],
    summaryItems: [
      "Activate or sign in to StackScore",
      "Complete your vCIO onboarding",
      "Review your roadmap and priorities",
    ],
    primaryCta: {
      label: input.activationToken ? "Activate StackScore" : "Open vCIO Onboarding",
      href: activationUrl,
    },
    secondaryCta: {
      label: "Open vCIO Dashboard",
      href: `${appUrl}/portal/vcio`,
    },
  });

  return recordAndSendCommunication({
    to: input.to,
    subject: rendered.subject,
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
      ? {
          subject: "Your StackScore vCIO Service Is Active",
          heroTitle: "Your StackScore vCIO Service Is Active",
          heroDescription:
            "Your Bobkat IT relationship is connected to your vCIO planning workspace.",
          paragraphs: [
            "Your organization is already configured, so you can move directly into planning.",
            "Review your roadmap, share current priorities, and complete onboarding so your first strategy session starts with the right context.",
          ],
          summaryItems: [
            "Review your roadmap",
            "Begin quarterly planning",
            "Complete vCIO onboarding",
          ],
          ctaLabel: "Review Roadmap",
          secondaryLabel: "Complete Onboarding",
          secondaryHref: onboardingUrl,
        }
      : input.customerType === "assessment_customer"
        ? {
            subject: "Welcome Back to StackScore vCIO",
            heroTitle: "Welcome Back to StackScore vCIO",
            heroDescription:
              "Your existing assessment is connected and your advisory roadmap is ready.",
            paragraphs: [
              "We connected your technology assessment, recommendations, improvement plan, and active projects.",
              "Complete the quick setup to tell us what has changed since your assessment, then review your roadmap with your Bobkat IT advisor.",
            ],
            summaryItems: [
              `Technology Score: ${input.technologyScore ?? "Available in your dashboard"}`,
              "Recommendations are available",
              "Your roadmap is ready for review",
            ],
            ctaLabel: "Complete Quick Setup",
            secondaryLabel: "Open vCIO Dashboard",
            secondaryHref: dashboardUrl,
          }
        : {
            subject: "Welcome to StackScore vCIO",
            heroTitle: "Welcome to StackScore vCIO",
            heroDescription:
              "Your strategic technology advisory service is active.",
            paragraphs: [
              "StackScore vCIO gives your organization ongoing technology advisory, quarterly planning, roadmap management, executive reporting, and direct access to Bobkat IT.",
              "Activate or sign in, complete onboarding, and we'll prepare your first strategy session with the right context.",
            ],
            summaryItems: [
              "Activate or sign in to StackScore",
              "Complete onboarding",
              "Review your advisory dashboard",
            ],
            ctaLabel: input.activationToken ? "Activate StackScore" : "Complete Onboarding",
            secondaryLabel: "Open vCIO Dashboard",
            secondaryHref: dashboardUrl,
          };

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
      paragraphs: scenario.paragraphs,
      summaryTitle: "Your next steps",
      summaryItems: scenario.summaryItems,
      primaryCta: { label: scenario.ctaLabel, href: primaryHref },
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
    previewText: rendered.previewText,
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
  const rendered = await renderCommunicationTemplate("VCIO-PAYMENT-FAILED", {
    heroTitle: "Payment Action Needed",
    heroDescription: "We couldn't process your latest StackScore vCIO payment.",
    previewText: "Update billing to keep advisory access active.",
    paragraphs: [
      "Your StackScore vCIO subscription payment did not go through.",
      `Advisory access remains available during the ${input.gracePeriodDays}-day grace period. Please update billing to avoid read-only access.`,
    ],
    primaryCta: { label: "Manage Billing", href: billingUrl },
    closingParagraph: `Need help? Contact ${BRAND.email} and we'll assist right away.`,
  });

  await recordAndSendCommunication({
    to: input.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewText: rendered.previewText,
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
  message: string;
  ctaLabel: string;
  ctaHref: string;
  templateKey: string;
  workflow: string;
  eventKey?: string;
  idempotencyKey?: string;
  relatedEntityId?: string | null;
}) {
  const rendered = await renderCommunicationTemplate(input.templateKey, {
    heroTitle: input.subject.replace(/^StackScore vCIO /i, ""),
    heroDescription: input.message,
    previewText: input.message,
    paragraphs: [input.message],
    primaryCta: { label: input.ctaLabel, href: input.ctaHref },
    closingParagraph: `Questions? Contact ${BRAND.email}.`,
  });

  await recordAndSendCommunication({
    to: input.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewText: rendered.previewText,
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
