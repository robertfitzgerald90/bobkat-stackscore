import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import { buildInvitationLandingUrl } from "@/lib/communications/links/build-protected-url";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";

export type SendAssessmentInvitationInput = {
  email: string;
  firstName?: string;
  organizationName?: string;
  prospectId: string;
  campaignId?: string | null;
  createdByUserId: string;
  recipientName?: string;
  clientId?: string | null;
  userId?: string | null;
  assessmentId?: string | null;
};

export async function sendAssessmentInvitation(input: SendAssessmentInvitationInput) {
  const invitationUrl = buildInvitationLandingUrl({
    prospectId: input.prospectId,
    campaignId: input.campaignId ?? undefined,
    recipientFirstName: input.firstName,
  });

  const rendered = await renderCommunicationTemplate("EMAIL-009", {
    invitationUrl,
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
    clientId: input.clientId ?? null,
    userId: input.userId ?? null,
    assessmentId: input.assessmentId ?? null,
    campaignId: input.campaignId ?? null,
    createdByUserId: input.createdByUserId,
    metadata: {
      workflow: "assessment_invitation",
      campaignId: input.campaignId ?? null,
      prospectId: input.prospectId,
    },
  });
}
