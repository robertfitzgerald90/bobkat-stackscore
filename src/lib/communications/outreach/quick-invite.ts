import { z } from "zod";
import { prisma } from "@/lib/db";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { findDuplicateByEmail } from "@/lib/communications/outreach/duplicate-detection";
import { createOrUpdateProspectOnly } from "@/lib/communications/outreach/create-prospect";
import { sendAssessmentInvitation } from "@/lib/communications/outreach/send-invitation";
import {
  recordCampaignEvent,
} from "@/lib/communications/outreach/campaign-sync";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

export const quickInviteSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  company: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(40).optional(),
  industry: z.string().trim().max(120).optional(),
  employeeCount: z.coerce.number().int().positive().optional(),
  notes: z.string().trim().max(5000).optional(),
  campaignId: z.string().uuid().optional(),
  templateKey: z.string().default("EMAIL-009"),
  forceResend: z.boolean().optional(),
  skipDuplicateCheck: z.boolean().optional(),
});

export type QuickInviteInput = z.infer<typeof quickInviteSchema> & {
  createdByUserId: string;
};

export type QuickInviteResult = {
  success: true;
  prospectId: string;
  clientId: string | null;
  assessmentId: string | null;
  messageId: string;
  campaignId: string | null;
  recipientId: string | null;
  isNewProspect: boolean;
};

async function resolveOrCreateCampaign(input: {
  campaignId?: string;
  createdByUserId: string;
  company: string;
}) {
  if (input.campaignId) {
    const campaign = await prisma.communicationCampaign.findUnique({
      where: { id: input.campaignId },
    });
    if (!campaign) throw new Error("Campaign not found");
    return campaign;
  }

  return prisma.communicationCampaign.create({
    data: {
      name: `Quick Invite — ${input.company}`,
      description: "Auto-created from Quick Invite",
      templateKey: "EMAIL-009",
      status: "sending",
      createdByUserId: input.createdByUserId,
      startedAt: new Date(),
    },
  });
}

export async function executeQuickInvite(input: QuickInviteInput): Promise<QuickInviteResult> {
  const parsed = quickInviteSchema.parse(input);
  const email = normalizePurchaserEmail(parsed.email);

  if (!parsed.skipDuplicateCheck && !parsed.forceResend) {
    const duplicate = await findDuplicateByEmail(email);
    if (duplicate && duplicate.type !== "prospect") {
      throw new Error(`DUPLICATE:${duplicate.type}:${duplicate.id}`);
    }
  }

  let existingProspectId: string | null = null;
  if (parsed.forceResend) {
    const prospect = await prisma.prospect.findUnique({ where: { email } });
    if (prospect) existingProspectId = prospect.id;
  }

  const campaign = await resolveOrCreateCampaign({
    campaignId: parsed.campaignId,
    createdByUserId: input.createdByUserId,
    company: parsed.company,
  });

  const { prospect, isNewProspect } = await createOrUpdateProspectOnly({
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    company: parsed.company,
    email,
    phone: parsed.phone,
    industry: parsed.industry,
    employeeCount: parsed.employeeCount,
    notes: parsed.notes,
    leadSource: "quick_invite",
    createdByUserId: input.createdByUserId,
    existingProspectId,
  });

  const sendResult = await sendAssessmentInvitation({
    email,
    firstName: parsed.firstName,
    organizationName: parsed.company,
    prospectId: prospect.id,
    campaignId: campaign.id,
    createdByUserId: input.createdByUserId,
    recipientName: `${parsed.firstName} ${parsed.lastName}`.trim(),
    clientId: prospect.clientId,
    userId: null,
    assessmentId: null,
  });

  const invitedAt = new Date();

  const recipient = await withCommunicationDbFallback(
    () =>
      prisma.campaignRecipient.upsert({
        where: {
          campaignId_prospectId: {
            campaignId: campaign.id,
            prospectId: prospect.id,
          },
        },
        create: {
          campaignId: campaign.id,
          prospectId: prospect.id,
          clientId: prospect.clientId,
          communicationMessageId:
            sendResult.messageId !== "untracked" ? sendResult.messageId : null,
          invitedAt,
        },
        update: {
          clientId: prospect.clientId,
          communicationMessageId:
            sendResult.messageId !== "untracked" ? sendResult.messageId : null,
          invitedAt,
        },
      }),
    null,
  );

  await prisma.prospect.update({
    where: { id: prospect.id },
    data: { status: "invited", lastContactAt: invitedAt },
  });

  if (campaign.status === "draft" || campaign.status === "ready") {
    await prisma.communicationCampaign.update({
      where: { id: campaign.id },
      data: { status: "sending", startedAt: campaign.startedAt ?? invitedAt },
    });
  }

  await recordCampaignEvent({
    campaignId: campaign.id,
    eventType: isNewProspect ? "recipient_added" : "invitation_sent",
    title: isNewProspect ? "Recipient added" : "Invitation resent",
    description: `${parsed.firstName} ${parsed.lastName} at ${parsed.company}`,
    actorUserId: input.createdByUserId,
    recipientId: recipient?.id ?? null,
  });

  await recordCampaignEvent({
    campaignId: campaign.id,
    eventType: "invitation_sent",
    title: "Invitation sent",
    description: `Assessment invitation sent to ${email}`,
    actorUserId: input.createdByUserId,
    recipientId: recipient?.id ?? null,
    metadata: { messageId: sendResult.messageId },
  });

  if (prospect.clientId) {
    await recordOrganizationActivity({
      clientId: prospect.clientId,
      category: "COMMUNICATIONS",
      eventType: "invitation_sent",
      title: "Assessment invitation sent",
      description: `Invitation sent to ${email} via Quick Invite.`,
      sourceRecordType: "CommunicationMessage",
      sourceRecordId: sendResult.messageId !== "untracked" ? sendResult.messageId : undefined,
      visibility: "CLIENT_VISIBLE",
      actorUserId: input.createdByUserId,
    });
  }

  return {
    success: true,
    prospectId: prospect.id,
    clientId: prospect.clientId,
    assessmentId: null,
    messageId: sendResult.messageId,
    campaignId: campaign.id,
    recipientId: recipient?.id ?? null,
    isNewProspect,
  };
}

export async function previewQuickInvite(input: {
  firstName?: string;
  company?: string;
}) {
  const { renderCommunicationTemplate } = await import("@/lib/communications/render-template");
  const { PREVIEW_INVITATION_URL } = await import("@/lib/communications/sample-data");
  return renderCommunicationTemplate("EMAIL-009", {
    invitationUrl: PREVIEW_INVITATION_URL,
    firstName: input.firstName,
    organizationName: input.company,
  });
}
