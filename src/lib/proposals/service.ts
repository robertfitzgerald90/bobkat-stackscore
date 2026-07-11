import type { UserRole } from "@/generated/prisma/client";
import { enqueueCommunication } from "@/lib/communications/queue/service";
import { buildProposalReadyEmailData } from "@/lib/communications/workflows/email-data";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { assembleTipPlanDetail } from "@/lib/technology-improvement-plan/service";
import type { RecipientSelection } from "@/lib/communications/recipients/types";
import { prisma } from "@/lib/db";
import { sendInternalNotificationEmail } from "@/lib/communications/workflows/internal-notify";

export async function publishTipProposal(input: {
  clientId: string;
  tipId: string;
  publishedByUserId: string;
  recipientSelection: RecipientSelection;
}) {
  const record = await prisma.technologyImprovementPlan.findFirst({
    where: { id: input.tipId, clientId: input.clientId },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
      assessment: { select: { assessmentName: true, overallScore: true } },
    },
  });
  if (!record) throw new Error("Proposal not found");
  if (record.status !== "generated" && record.status !== "revision_requested") {
    throw new Error("Only generated proposals can be published");
  }

  const detail = await assembleTipPlanDetail(record, "admin");

  const updated = await prisma.technologyImprovementPlan.update({
    where: { id: input.tipId },
    data: {
      status: "published",
      publishedAt: new Date(),
      publishedByUserId: input.publishedByUserId,
      revisionRequestedAt: null,
      revisionNotes: null,
    },
  });

  const investment = detail.investment;
  const payload = await buildProposalReadyEmailData({
    clientId: input.clientId,
    tipId: input.tipId,
    proposalName: updated.title,
    organizationName: record.client.companyName,
    purpose: detail.executiveSummary ?? undefined,
    executiveSummary: detail.executiveSummary ?? undefined,
    deliverables: detail.playbooks.map((playbook) => playbook.name),
    estimatedTimeline: detail.roadmapPhases.map((phase) => phase.label).join(" → "),
    oneTimeInvestment: investment?.clientTotal ? `$${investment.clientTotal.toLocaleString()}` : undefined,
    monthlyRecurring: undefined,
    totalInvestment: investment?.clientTotal ? `$${investment.clientTotal.toLocaleString()}` : undefined,
  });

  await enqueueCommunication({
    workflowKey: "proposal_published",
    clientId: input.clientId,
    tipId: input.tipId,
    recipientSelection: input.recipientSelection,
    payload,
    createdByUserId: input.publishedByUserId,
    reviewRequired: true,
    autoSend: false,
  });

  await recordOrganizationActivity({
    clientId: input.clientId,
    category: "PROPOSAL",
    eventType: "proposal_published",
    title: "Proposal published",
    description: `${updated.title} was published for customer review.`,
    sourceRecordType: "TechnologyImprovementPlan",
    sourceRecordId: updated.id,
    visibility: "CLIENT_VISIBLE",
    actorUserId: input.publishedByUserId,
  });

  return updated;
}

export async function approveTipProposal(input: {
  clientId: string;
  tipId: string;
  approvedByUserId: string;
  approvedByContactId?: string | null;
  signature: {
    signerName: string;
    signerTitle?: string;
    signedAt: string;
    consentText: string;
  };
}) {
  const tip = await prisma.technologyImprovementPlan.findFirst({
    where: { id: input.tipId, clientId: input.clientId },
    include: { client: true },
  });
  if (!tip) throw new Error("Proposal not found");
  if (tip.status !== "published") throw new Error("Only published proposals can be approved");

  const updated = await prisma.technologyImprovementPlan.update({
    where: { id: input.tipId },
    data: {
      status: "approved",
      approvedAt: new Date(),
      approvedByUserId: input.approvedByUserId,
      approvedByContactId: input.approvedByContactId ?? null,
      signatureJson: input.signature,
    },
  });

  await recordOrganizationActivity({
    clientId: input.clientId,
    category: "PROPOSAL",
    eventType: "proposal_approved",
    title: "Proposal approved",
    description: `${tip.title} was approved by ${input.signature.signerName}.`,
    sourceRecordType: "TechnologyImprovementPlan",
    sourceRecordId: tip.id,
    visibility: "CLIENT_VISIBLE",
    actorUserId: input.approvedByUserId,
  });

  await sendInternalNotificationEmail({
    subject: `Proposal Approved — ${tip.client.companyName}`,
    body: `${tip.title} was approved by ${input.signature.signerName}.`,
    eventType: "proposal_approved",
  });

  return updated;
}

export async function requestTipProposalChanges(input: {
  clientId: string;
  tipId: string;
  requestedByUserId: string;
  comments: string;
}) {
  const tip = await prisma.technologyImprovementPlan.findFirst({
    where: { id: input.tipId, clientId: input.clientId },
    include: { client: true },
  });
  if (!tip) throw new Error("Proposal not found");
  if (tip.status !== "published") throw new Error("Only published proposals accept revision requests");

  const updated = await prisma.technologyImprovementPlan.update({
    where: { id: input.tipId },
    data: {
      status: "revision_requested",
      revisionRequestedAt: new Date(),
      revisionNotes: input.comments.trim(),
    },
  });

  await recordOrganizationActivity({
    clientId: input.clientId,
    category: "PROPOSAL",
    eventType: "proposal_revision_requested",
    title: "Proposal revision requested",
    description: input.comments.trim(),
    sourceRecordType: "TechnologyImprovementPlan",
    sourceRecordId: tip.id,
    visibility: "CLIENT_VISIBLE",
    actorUserId: input.requestedByUserId,
  });

  await sendInternalNotificationEmail({
    subject: `Proposal Revision Requested — ${tip.client.companyName}`,
    body: input.comments.trim(),
    eventType: "proposal_revision_requested",
  });

  return updated;
}

export async function getPublishedProposalDetail(
  clientId: string,
  tipId: string,
  role: UserRole,
) {
  const tip = await prisma.technologyImprovementPlan.findFirst({
    where: {
      id: tipId,
      clientId,
      status: { in: ["published", "approved", "revision_requested"] },
    },
  });
  if (!tip) return null;
  return assembleTipPlanDetail(
    await prisma.technologyImprovementPlan.findFirstOrThrow({
      where: { id: tipId },
      include: {
        document: { select: { id: true } },
        client: { select: { companyName: true } },
        assessment: { select: { assessmentName: true, overallScore: true } },
      },
    }),
    role,
  );
}
