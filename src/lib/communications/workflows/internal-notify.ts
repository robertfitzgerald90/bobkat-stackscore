import { getCommunicationWorkflowSettings } from "@/lib/communications/settings/workflow-settings";
import { getEmailConfig } from "@/lib/email/config";
import { sendEmail } from "@/lib/email/send";

export async function sendInternalNotificationEmail(input: {
  subject: string;
  body: string;
  eventType: string;
}) {
  const settings = await getCommunicationWorkflowSettings();
  const recipients = [
    settings.proposalApprovalNotificationEmail,
    ...settings.internalNotificationEmails,
  ].filter(Boolean);

  const unique = [...new Set(recipients.map((email) => email.toLowerCase()))];
  if (unique.length === 0) return;

  const { from } = getEmailConfig();
  const html = `
    <p>${input.body.replace(/\n/g, "<br />")}</p>
    <p style="color:#64748b;font-size:12px;">StackScore notification · ${input.eventType}</p>
  `.trim();

  for (const to of unique) {
    await sendEmail({
      to,
      subject: input.subject,
      html,
      text: `${input.body}\n\nStackScore notification · ${input.eventType}`,
    });
  }

  void from;
}
