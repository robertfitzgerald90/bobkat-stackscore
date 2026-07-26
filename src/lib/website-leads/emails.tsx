import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import { STACKSCORE_PUBLIC_ROUTES } from "@/lib/marketing/stackscore-routes";
import { buildAppUrl } from "@/lib/url/base-url";
import { getCommunicationBrandSettings } from "@/lib/communications/brand-settings";
import { getCommunicationWorkflowSettings } from "@/lib/communications/settings/workflow-settings";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { sendEmail } from "@/lib/email/send";
import { WorkflowNotificationEmail } from "@/emails/templates/workflow-notification";
import { renderEmailTemplate } from "@/emails/render-email";
import { escapeHtml, parseFirstName } from "@/lib/website-leads/sanitize";
import { formatDisplayDate } from "@/lib/display";
import type { WebsiteLeadSource } from "@/generated/prisma/client";
import { formatWebsiteLeadSource } from "@/lib/website-leads/display";

async function resolveInternalRecipients(): Promise<string[]> {
  const configured = process.env.BOBKAT_NOTIFICATION_EMAIL?.trim();
  const envRecipients = configured ? [configured] : [];
  const settings = await getCommunicationWorkflowSettings();
  const workflowRecipients = [
    settings.proposalApprovalNotificationEmail,
    ...settings.internalNotificationEmails,
  ].filter(Boolean);

  return [...new Set([...envRecipients, ...workflowRecipients].map((email) => email.toLowerCase()))];
}

export async function sendWebsiteLeadConfirmationEmail(input: {
  leadId: string;
  email: string;
  name: string;
}): Promise<{ sent: boolean; error?: string }> {
  const firstName = parseFirstName(input.name);
  const snapshotUrl = buildAppUrl(STACKSCORE_PUBLIC_ROUTES.technologySnapshot);
  const servicesUrl = BOBKAT_IT_URLS.services;
  const brand = await getCommunicationBrandSettings();

  const subject = "Thanks for reaching out!";
  const { html, text } = await renderEmailTemplate(
    WorkflowNotificationEmail({
      brand,
      heroTitle: `Hey ${firstName}!`,
      previewText: "Thanks for reaching out to Bobkat IT.",
      paragraphs: [
        "Thanks for reaching out to Bobkat IT. We received your message and will be in touch as soon as we can.",
        "We appreciate you taking the time to connect with us.",
        "In the meantime, here are a couple of ways to get a head start:",
      ],
      primaryCta: {
        label: "Take the free Technology Snapshot",
        href: snapshotUrl,
      },
      secondaryCta: {
        label: "Explore our services",
        href: servicesUrl,
      },
      founderClosing: true,
    }),
  );

  try {
    await recordAndSendCommunication({
      to: input.email,
      subject,
      html,
      text,
      templateKey: "WEBSITE-LEAD-CONFIRMATION",
      eventKey: "WEBSITE_LEAD_CONFIRMATION",
      sendType: "AUTOMATED",
      idempotencyKey: `website-lead-confirmation:${input.leadId}`,
      relatedEntityType: "WebsiteLead",
      relatedEntityId: input.leadId,
      metadata: { workflow: "website_lead_confirmation" },
    });
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed";
    console.warn("[website-leads] confirmation email failed", {
      leadId: input.leadId,
      error: message,
    });
    return { sent: false, error: message };
  }
}

export async function sendWebsiteLeadInternalNotification(input: {
  leadId: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string;
  source: WebsiteLeadSource;
  submittedAt: Date;
}): Promise<void> {
  const recipients = await resolveInternalRecipients();
  if (recipients.length === 0) {
    console.warn("[website-leads] no internal notification recipients configured");
    return;
  }

  const leadUrl = buildAppUrl(`/website-leads/${input.leadId}`);
  const submittedLabel = formatDisplayDate(input.submittedAt);

  const bodyLines = [
    "A new website lead was received.",
    "",
    `Name: ${input.name}`,
    `Company: ${input.company ?? "—"}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone ?? "—"}`,
    `Source: ${formatWebsiteLeadSource(input.source)}`,
    `Submitted: ${submittedLabel}`,
    "",
    "Message:",
    input.message,
    "",
    `View in StackScore: ${leadUrl}`,
  ];

  const html = `
    <p>A new website lead was received.</p>
    <table style="border-collapse:collapse;width:100%;max-width:640px;">
      <tr><td style="padding:4px 8px;font-weight:600;">Name</td><td style="padding:4px 8px;">${escapeHtml(input.name)}</td></tr>
      <tr><td style="padding:4px 8px;font-weight:600;">Company</td><td style="padding:4px 8px;">${escapeHtml(input.company ?? "—")}</td></tr>
      <tr><td style="padding:4px 8px;font-weight:600;">Email</td><td style="padding:4px 8px;">${escapeHtml(input.email)}</td></tr>
      <tr><td style="padding:4px 8px;font-weight:600;">Phone</td><td style="padding:4px 8px;">${escapeHtml(input.phone ?? "—")}</td></tr>
      <tr><td style="padding:4px 8px;font-weight:600;">Source</td><td style="padding:4px 8px;">${escapeHtml(formatWebsiteLeadSource(input.source))}</td></tr>
      <tr><td style="padding:4px 8px;font-weight:600;">Submitted</td><td style="padding:4px 8px;">${escapeHtml(submittedLabel)}</td></tr>
    </table>
    <p style="margin-top:16px;font-weight:600;">Message</p>
    <p style="white-space:pre-wrap;">${escapeHtml(input.message)}</p>
    <p style="margin-top:16px;"><a href="${escapeHtml(leadUrl)}">View lead in StackScore</a></p>
    <p style="color:#64748b;font-size:12px;">StackScore notification · website_lead_received</p>
  `.trim();

  for (const to of recipients) {
    await sendEmail({
      to,
      subject: `New website lead: ${input.name}`,
      html,
      text: bodyLines.join("\n"),
    });
  }
}
