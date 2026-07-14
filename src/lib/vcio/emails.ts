import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { sendInternalNotificationEmail } from "@/lib/communications/workflows/internal-notify";
import { buildActivationUrls } from "@/lib/email/templates/assessment-purchase";
import { getAppUrl } from "@/lib/stripe/app-url";

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
