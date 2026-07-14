import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import { sendInternalNotificationEmail } from "@/lib/communications/workflows/internal-notify";
import { buildActivationUrls } from "@/lib/email/templates/assessment-purchase";
import { getAppUrl } from "@/lib/stripe/app-url";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import type { VcioCustomerType } from "@/generated/prisma/client";
import { BRAND } from "@/lib/branding";

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;color:#334155;line-height:1.6;">${text}</p>`;
}

function button(label: string, href: string) {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:#082F5B;color:#fff;text-decoration:none;border-radius:8px;padding:12px 18px;font-weight:600;">${label}</a></p>`;
}

function htmlShell(title: string, body: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
      <h1 style="margin:0 0 16px;color:#082F5B;font-size:24px;">${title}</h1>
      ${body}
      <p style="margin-top:28px;color:#64748b;font-size:12px;">Bobkat IT · StackScore</p>
    </div>
  `.trim();
}

export async function sendVcioSubscriptionReceivedEmail(input: {
  clientId: string;
  userId?: string | null;
  to: string;
  activationToken?: string;
}) {
  const appUrl = getAppUrl();
  const onboardingUrl = `${appUrl}/portal/vcio/onboarding`;
  const activationUrl = input.activationToken
    ? buildActivationUrls(input.activationToken).activationUrl
    : onboardingUrl;

  const title = "StackScore vCIO subscription received";
  const html = htmlShell(
    title,
    [
      paragraph("Thank you for subscribing to StackScore vCIO. We are preparing your advisory workspace and onboarding profile."),
      paragraph("Next, activate or open StackScore, complete onboarding, and schedule your initial strategy session."),
      button(input.activationToken ? "Activate StackScore" : "Open vCIO Onboarding", activationUrl),
      paragraph("Your subscription includes ongoing technology advisory, quarterly technology reviews, roadmap and budget management, executive reporting, and direct advisor access."),
    ].join(""),
  );

  await recordAndSendCommunication({
    to: input.to,
    subject: title,
    html,
    text: `${title}\n\nThank you for subscribing to StackScore vCIO. Open onboarding: ${activationUrl}`,
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
}) {
  const appUrl = getAppUrl();
  const onboardingUrl = `${appUrl}/portal/vcio/onboarding`;
  const dashboardUrl = `${appUrl}/portal/vcio`;
  const roadmapUrl = `${appUrl}/portal/roadmap`;
  const strategySessionUrl = SERVICES_CTA_DESTINATIONS.generalConsultation.href;
  const primaryHref = input.activationToken
    ? buildActivationUrls(input.activationToken).activationUrl
    : onboardingUrl;

  const scenario =
    input.customerType === "managed_services_client"
      ? {
          subject: "Your StackScore vCIO Service Is Active",
          heroTitle: "Your StackScore vCIO Service Is Active",
          heroDescription:
            "Welcome back. Your Bobkat IT relationship is already connected to your vCIO planning workspace.",
          paragraphs: [
            "Your organization is already configured, so there is no lengthy setup process.",
            "Next, review your roadmap, share current priorities, and schedule your first strategy session.",
          ],
          summaryItems: [
            "Review your roadmap",
            "Begin quarterly planning",
            "Schedule your strategy session",
          ],
          ctaLabel: "Review Roadmap",
          secondaryLabel: "Schedule Strategy Session",
          secondaryHref: strategySessionUrl,
        }
      : input.customerType === "assessment_customer"
        ? {
            subject: "Welcome Back to StackScore vCIO",
            heroTitle: "Welcome Back to StackScore vCIO",
            heroDescription:
              "Your existing assessment has been connected and your advisory roadmap is ready.",
            paragraphs: [
              "We connected your existing technology assessment, recommendations, improvement plan, and current projects.",
              "Complete the quick setup to tell us what has changed since your assessment, then schedule your first strategy session.",
            ],
            summaryItems: [
              `Technology Score: ${input.technologyScore ?? "Available in your dashboard"}`,
              "Recommendations are available",
              "Your roadmap is ready for review",
            ],
            ctaLabel: "Complete Quick Setup",
            secondaryLabel: "Schedule Strategy Session",
            secondaryHref: strategySessionUrl,
          }
        : {
            subject: "Welcome to StackScore vCIO",
            heroTitle: "Welcome to StackScore vCIO",
            heroDescription:
              "Your strategic technology advisory service is active. Let's prepare your first planning session.",
            paragraphs: [
              "StackScore vCIO gives your organization ongoing technology advisory, quarterly planning, roadmap management, executive reporting, and direct access to Bobkat IT.",
              "Activate or sign in, complete onboarding, and schedule your initial strategy session.",
            ],
            summaryItems: [
              "Activate or sign in to StackScore",
              "Complete onboarding",
              "Schedule your initial strategy session",
            ],
            ctaLabel: input.activationToken ? "Activate StackScore" : "Complete Onboarding",
            secondaryLabel: "Schedule Strategy Session",
            secondaryHref: strategySessionUrl,
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
      strategySessionUrl,
      supportEmail: BRAND.email,
      currentYear: String(new Date().getFullYear()),
      heroTitle: scenario.heroTitle,
      heroDescription: scenario.heroDescription,
      paragraphs: scenario.paragraphs,
      summaryTitle: "Your next steps",
      summaryItems: scenario.summaryItems,
      primaryCta: { label: scenario.ctaLabel, href: primaryHref },
      secondaryCta: { label: scenario.secondaryLabel, href: scenario.secondaryHref },
    },
    { useSampleDefaults: true },
  );

  await recordAndSendCommunication({
    to: input.to,
    subject: scenario.subject,
    html: rendered.html,
    text: rendered.text,
    previewText: rendered.previewText,
    templateKey: "EMAIL-010",
    clientId: input.clientId,
    userId: input.userId ?? null,
    recipientName: input.clientName ?? undefined,
    metadata: {
      workflow: "vcio_welcome",
      customerType: input.customerType,
      templateVersion: "EMAIL-010",
    },
  });
}

export async function sendVcioPaymentFailedEmail(input: {
  clientId: string;
  userId?: string | null;
  to: string;
  gracePeriodDays: number;
}) {
  const billingUrl = `${getAppUrl()}/portal/billing`;
  const title = "Action needed: StackScore vCIO payment failed";
  const html = htmlShell(
    title,
    [
      paragraph("We could not process your latest StackScore vCIO subscription payment."),
      paragraph(`Your advisory access remains available during the ${input.gracePeriodDays}-day grace period. Please update billing to avoid read-only access.`),
      button("Manage Billing", billingUrl),
    ].join(""),
  );

  await recordAndSendCommunication({
    to: input.to,
    subject: title,
    html,
    text: `${title}\n\nManage billing: ${billingUrl}`,
    templateKey: "VCIO-PAYMENT-FAILED",
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
}) {
  const html = htmlShell(
    input.subject,
    [paragraph(input.message), button(input.ctaLabel, input.ctaHref)].join(""),
  );

  await recordAndSendCommunication({
    to: input.to,
    subject: input.subject,
    html,
    text: `${input.subject}\n\n${input.message}\n\n${input.ctaHref}`,
    templateKey: input.templateKey,
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
