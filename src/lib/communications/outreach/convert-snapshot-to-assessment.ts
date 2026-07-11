import { buildProtectedAppUrl, buildPublicAppUrl } from "@/lib/communications/links/build-protected-url";
import { recordCampaignEvent } from "@/lib/communications/outreach/campaign-sync";
import { provisionInviteWorkspace } from "@/lib/communications/outreach/provisioning";
import { ensurePrimaryContactFromClient } from "@/lib/communications/contacts/service";
import { prisma } from "@/lib/db";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

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

export type ContinueSnapshotResult =
  | {
      mode: "existing_account";
      loginUrl: string;
      assessmentId: string | null;
    }
  | {
      mode: "provisioned";
      activationUrl: string;
      assessmentId: string;
      clientId: string;
    };

export async function continueSnapshotToFullAssessment(
  snapshotLeadId: string,
): Promise<ContinueSnapshotResult> {
  const lead = await prisma.technologySnapshotLead.findUnique({
    where: { id: snapshotLeadId },
    include: { prospect: true },
  });
  if (!lead) throw new Error("Technology Snapshot not found");

  const email = normalizePurchaserEmail(lead.email);
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

    return {
      mode: "existing_account",
      loginUrl: buildProtectedAppUrl(
        assessment ? `/assessments/${assessment.id}` : "/dashboard",
      ),
      assessmentId: assessment?.id ?? null,
    };
  }

  const { firstName, lastName } = splitContactName(lead.contactName);
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

  return {
    mode: "provisioned",
    activationUrl: buildPublicAppUrl(`/activate-account?token=${provisioned.activationToken}`),
    assessmentId: provisioned.assessmentId,
    clientId: provisioned.clientId,
  };
}
