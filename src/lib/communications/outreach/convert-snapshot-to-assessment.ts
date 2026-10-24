import { randomBytes } from "node:crypto";
import { CONTINUE_SNAPSHOT_PUBLIC_MESSAGE } from "@/lib/communications/outreach/continue-snapshot-messages";
import { buildProtectedAppUrl } from "@/lib/communications/links/build-protected-url";
import { recordCampaignEvent } from "@/lib/communications/outreach/campaign-sync";
import { provisionInviteWorkspace } from "@/lib/communications/outreach/provisioning";
import { ensurePrimaryContactFromClient } from "@/lib/communications/contacts/service";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { prisma } from "@/lib/db";
import {
  buildActivationEmail,
  buildActivationUrls,
  buildAssessmentReadyEmail,
} from "@/lib/email/templates/assessment-purchase";
import {
  activationTokenExpiresAt,
  generateActivationToken,
  normalizePurchaserEmail,
} from "@/lib/stripe/fulfillment/helpers";

export { CONTINUE_SNAPSHOT_PUBLIC_MESSAGE } from "@/lib/communications/outreach/continue-snapshot-messages";

export type ContinueSnapshotPublicResult = {
  ok: true;
  message: string;
};

function splitContactName(contactName: string): { firstName: string; lastName: string } {
  const parts = contactName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "Prospect", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

async function resolveProvisionerUserId(prospectId: string | null | undefined): Promise<string> {
  if (prospectId) {
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
      select: { createdByUserId: true },
    });
    if (prospect?.createdByUserId) return prospect.createdByUserId;
  }

  const admin = await prisma.user.findFirst({
    where: { role: "admin", isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) throw new Error("No active administrator available to provision assessment access");
  return admin.id;
}

/** Always mint a fresh hashed activation token for email delivery (never return raw token to clients). */
export async function issueFreshActivationToken(
  userId: string,
): Promise<{ rawToken: string; tokenHash: string }> {
  const { rawToken, tokenHash } = generateActivationToken();
  await prisma.accountActivationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: activationTokenExpiresAt(),
    },
  });
  return { rawToken, tokenHash };
}

async function assertEmailDelivered(result: { delivered: boolean }): Promise<void> {
  if (!result.delivered) {
    throw new Error("Unable to send continuation email. Please try again shortly.");
  }
}

async function sendContinuationActivationEmail(input: {
  email: string;
  firstName: string;
  organizationName: string;
  rawActivationToken: string;
  tokenHash: string;
  userId: string;
  clientId: string;
  assessmentId: string;
  leadId: string;
}): Promise<void> {
  const urls = buildActivationUrls(input.rawActivationToken);
  const content = await buildActivationEmail({
    activationUrl: urls.activationUrl,
    firstName: input.firstName,
    organizationName: input.organizationName,
  });

  const result = await recordAndSendCommunication({
    to: input.email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    templateKey: "EMAIL-001",
    eventKey: "ACCOUNT_ACTIVATION_CREATED",
    sendType: "AUTOMATED",
    idempotencyKey: `snapshot-continue-activation:${input.leadId}:${input.tokenHash.slice(0, 24)}`,
    triggeredBy: "Technology Snapshot continue-assessment",
    relatedEntityType: "TechnologySnapshotLead",
    relatedEntityId: input.leadId,
    clientId: input.clientId,
    userId: input.userId,
    assessmentId: input.assessmentId,
    metadata: {
      workflow: "snapshot_continue_activation",
      leadId: input.leadId,
      assessmentId: input.assessmentId,
    },
  });

  await assertEmailDelivered(result);
}

async function sendContinuationLoginEmail(input: {
  email: string;
  firstName: string;
  organizationName: string;
  userId: string;
  clientId: string;
  assessmentId: string | null;
  leadId: string;
}): Promise<void> {
  const startPath = input.assessmentId
    ? `/assessments/${input.assessmentId}`
    : "/dashboard";
  const loginUrl = buildProtectedAppUrl(startPath);
  const startUrl = buildProtectedAppUrl(startPath);

  const content = await buildAssessmentReadyEmail({
    loginUrl,
    startUrl,
    firstName: input.firstName,
    organizationName: input.organizationName,
  });

  const result = await recordAndSendCommunication({
    to: input.email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    templateKey: "LEGACY-ASSESSMENT-READY",
    eventKey: "ASSESSMENT_READY",
    sendType: "AUTOMATED",
    idempotencyKey: `snapshot-continue-ready:${input.leadId}:${randomBytes(8).toString("hex")}`,
    triggeredBy: "Technology Snapshot continue-assessment",
    relatedEntityType: "TechnologySnapshotLead",
    relatedEntityId: input.leadId,
    clientId: input.clientId,
    userId: input.userId,
    assessmentId: input.assessmentId,
    metadata: {
      workflow: "snapshot_continue_existing_account",
      leadId: input.leadId,
    },
  });

  await assertEmailDelivered(result);
}

function publicSuccess(): ContinueSnapshotPublicResult {
  return { ok: true, message: CONTINUE_SNAPSHOT_PUBLIC_MESSAGE };
}

/**
 * Continues a Technology Snapshot into a full assessment workspace.
 * Raw activation tokens and private resource IDs are never returned to the caller;
 * continuation instructions are emailed to the lead address only.
 */
export async function continueSnapshotToFullAssessment(
  snapshotLeadId: string,
): Promise<ContinueSnapshotPublicResult> {
  const lead = await prisma.technologySnapshotLead.findUnique({
    where: { id: snapshotLeadId },
    include: { prospect: true },
  });
  if (!lead) throw new Error("Technology Snapshot not found");

  const email = normalizePurchaserEmail(lead.email);
  const { firstName, lastName } = splitContactName(lead.contactName);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true, clientId: true },
  });

  if (existingUser?.isActive && existingUser.clientId) {
    const assessment = await prisma.assessment.findFirst({
      where: {
        clientId: existingUser.clientId,
        status: "draft",
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    await prisma.technologySnapshotLead.update({
      where: { id: lead.id },
      data: { status: "assessment_interested", prospectId: lead.prospectId ?? undefined },
    });

    try {
      await sendContinuationLoginEmail({
        email,
        firstName,
        organizationName: lead.companyName,
        userId: existingUser.id,
        clientId: existingUser.clientId,
        assessmentId: assessment?.id ?? null,
        leadId: lead.id,
      });
    } catch {
      throw new Error("Unable to send continuation email. Please try again shortly.");
    }

    return publicSuccess();
  }

  const createdByUserId = await resolveProvisionerUserId(lead.prospectId);

  const provisioned = await provisionInviteWorkspace({
    firstName,
    lastName,
    company: lead.companyName,
    email,
    phone: lead.phone,
    industry: lead.industry,
    leadSource: "quick_invite",
    createdByUserId,
    existingProspectId: lead.prospectId,
    existingClientId: lead.prospect?.clientId ?? null,
  });

  await prisma.technologySnapshotLead.update({
    where: { id: lead.id },
    data: {
      prospectId: provisioned.prospectId,
      status: "assessment_interested",
    },
  });

  await ensurePrimaryContactFromClient(provisioned.clientId);

  if (lead.prospectId) {
    const recipient = await prisma.campaignRecipient.findFirst({
      where: { prospectId: lead.prospectId },
      select: { id: true, campaignId: true },
    });
    if (recipient) {
      await recordCampaignEvent({
        campaignId: recipient.campaignId,
        eventType: "snapshot_continued",
        title: "Continued to full assessment",
        description: `${lead.contactName} chose to continue from the Technology Snapshot to the full assessment.`,
        recipientId: recipient.id,
      });
    }
  }

  // Fresh token for email only — never include in API response (SEC-001-C01).
  const { rawToken, tokenHash } = await issueFreshActivationToken(provisioned.userId);

  try {
    await sendContinuationActivationEmail({
      email,
      firstName,
      organizationName: lead.companyName,
      rawActivationToken: rawToken,
      tokenHash,
      userId: provisioned.userId,
      clientId: provisioned.clientId,
      assessmentId: provisioned.assessmentId,
      leadId: lead.id,
    });
  } catch {
    // Token exists only in DB (hashed) and email pipeline — never return it on failure.
    throw new Error("Unable to send continuation email. Please try again shortly.");
  }

  return publicSuccess();
}
