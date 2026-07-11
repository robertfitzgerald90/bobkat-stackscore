import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { buildActivationUrls } from "@/lib/email/templates/assessment-purchase";

export type SendAssessmentInvitationInput = {
  email: string;
  firstName?: string;
  organizationName?: string;
  activationToken: string;
  clientId: string;
  userId: string;
  assessmentId: string;
  campaignId?: string | null;
  createdByUserId: string;
  recipientName?: string;
};

export async function sendAssessmentInvitation(input: SendAssessmentInvitationInput) {
  const urls = buildActivationUrls(input.activationToken);
  const rendered = await renderCommunicationTemplate("EMAIL-009", {
    invitationUrl: urls.activationUrl,
    firstName: input.firstName,
    organizationName: input.organizationName,
  });

  return recordAndSendCommunication({
    to: input.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewText: rendered.previewText,
    templateKey: "EMAIL-009",
    recipientName: input.recipientName,
    clientId: input.clientId,
    userId: input.userId,
    assessmentId: input.assessmentId,
    campaignId: input.campaignId ?? null,
    createdByUserId: input.createdByUserId,
    metadata: {
      workflow: "assessment_invitation",
      campaignId: input.campaignId ?? null,
    },
  });
}
