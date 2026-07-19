import type { PhaseProposalStatus, Prisma, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { isConsultantRole } from "@/lib/client-roadmap/permissions";
import { buildPhaseProposalSnapshot } from "./snapshot";
import {
  PHASE_PROPOSAL_STATUS_LABELS,
  type PhaseProposalDetail,
  type PhaseProposalSnapshot,
  type PhaseProposalSummary,
} from "./types";

function decimalToNumber(value: { toNumber?: () => number } | number): number {
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

function toSummary(
  proposal: {
    id: string;
    proposalNumber: string;
    version: number;
    status: PhaseProposalStatus;
    title: string;
    phaseId: string;
    phaseName: string;
    phaseSubtitle: string;
    timeline: string;
    oneTimeInvestment: { toNumber?: () => number } | number;
    monthlyRecurringInvestment: { toNumber?: () => number } | number;
    annualRecurringInvestment: { toNumber?: () => number } | number;
    expectedScoreImprovement: number;
    createdAt: Date;
    sentAt: Date | null;
    viewedAt: Date | null;
    approvedAt: Date | null;
    document?: { fileUrl: string } | null;
  },
): PhaseProposalSummary {
  return {
    id: proposal.id,
    proposalNumber: proposal.proposalNumber,
    version: proposal.version,
    status: proposal.status,
    statusLabel: PHASE_PROPOSAL_STATUS_LABELS[proposal.status],
    title: proposal.title,
    phaseId: proposal.phaseId,
    phaseName: proposal.phaseName,
    phaseSubtitle: proposal.phaseSubtitle,
    timeline: proposal.timeline,
    oneTimeInvestment: decimalToNumber(proposal.oneTimeInvestment),
    monthlyRecurringInvestment: decimalToNumber(proposal.monthlyRecurringInvestment),
    annualRecurringInvestment: decimalToNumber(proposal.annualRecurringInvestment),
    expectedScoreImprovement: proposal.expectedScoreImprovement,
    createdAt: proposal.createdAt.toISOString(),
    sentAt: proposal.sentAt?.toISOString() ?? null,
    viewedAt: proposal.viewedAt?.toISOString() ?? null,
    approvedAt: proposal.approvedAt?.toISOString() ?? null,
    documentUrl: proposal.document?.fileUrl ?? null,
  };
}

async function allocateProposalNumber(clientId: string, tx: Prisma.TransactionClient) {
  const count = await tx.phaseProposal.count({ where: { clientId } });
  const year = new Date().getFullYear();
  return `PROP-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function generatePhaseProposal(input: {
  clientId: string;
  phaseId: string;
  userId: string;
  preparedByName: string;
}) {
  const phase = await prisma.clientRoadmapPhase.findFirst({
    where: {
      id: input.phaseId,
      roadmap: { clientId: input.clientId },
    },
    include: {
      roadmap: {
        include: {
          client: { select: { companyName: true } },
          assessment: {
            select: { id: true, assessmentName: true, assessmentDate: true, completedAt: true },
          },
        },
      },
      initiatives: {
        orderBy: { sortOrder: "asc" },
        include: {
          recommendation: {
            include: { category: { select: { name: true } } },
          },
        },
      },
      proposals: {
        where: { status: { notIn: ["superseded", "rejected", "expired"] } },
        orderBy: [{ version: "desc" }],
        take: 1,
      },
    },
  });

  if (!phase) throw new Error("Roadmap phase not found");
  if (phase.initiatives.length === 0) {
    throw new Error("Cannot generate a proposal for a phase with no initiatives");
  }

  const latestActive = phase.proposals[0] ?? null;
  const assessmentDate =
    phase.roadmap.assessment.completedAt?.toISOString() ??
    phase.roadmap.assessment.assessmentDate.toISOString();

  const snapshot = buildPhaseProposalSnapshot({
    phase: {
      id: phase.id,
      phaseKey: phase.phaseKey,
      name: phase.name,
      subtitle: phase.subtitle,
      timeline: phase.timeline,
      executiveSummary: phase.executiveSummary,
      expectedScoreImprovement: phase.expectedScoreImprovement,
      oneTimeInvestment: decimalToNumber(phase.oneTimeInvestment),
      monthlyRecurringInvestment: decimalToNumber(phase.monthlyRecurringInvestment),
      annualRecurringInvestment: decimalToNumber(phase.annualRecurringInvestment),
      initiatives: phase.initiatives,
    },
    clientName: phase.roadmap.client.companyName,
    assessmentName: phase.roadmap.assessment.assessmentName,
    assessmentDate,
    preparedByName: input.preparedByName,
  });

  return prisma.$transaction(async (tx) => {
    let proposalNumber: string;
    let version = 1;
    let supersedesProposalId: string | null = null;

    if (latestActive) {
      proposalNumber = latestActive.proposalNumber;
      version = latestActive.version + 1;
      supersedesProposalId = latestActive.id;
      await tx.phaseProposal.update({
        where: { id: latestActive.id },
        data: { status: "superseded" },
      });
    } else {
      proposalNumber = await allocateProposalNumber(input.clientId, tx);
    }

    const created = await tx.phaseProposal.create({
      data: {
        proposalNumber,
        version,
        status: "draft",
        clientId: input.clientId,
        assessmentId: phase.roadmap.assessmentId,
        roadmapId: phase.roadmapId,
        phaseId: phase.id,
        title: `${phase.subtitle} Proposal — ${phase.name}`,
        executiveSummary: snapshot.executiveSummary,
        timeline: phase.timeline,
        phaseName: phase.name,
        phaseSubtitle: phase.subtitle,
        oneTimeInvestment: snapshot.oneTimeInvestment,
        monthlyRecurringInvestment: snapshot.monthlyRecurringInvestment,
        annualRecurringInvestment: snapshot.annualRecurringInvestment,
        expectedScoreImprovement: snapshot.expectedScoreImprovement,
        snapshotJson: snapshot as unknown as Prisma.InputJsonValue,
        createdByUserId: input.userId,
        supersedesProposalId,
      },
    });

    const fileUrl = `/api/v1/clients/${input.clientId}/phase-proposals/${created.id}/pdf`;
    await tx.document.create({
      data: {
        clientId: input.clientId,
        assessmentId: phase.roadmap.assessmentId,
        phaseProposalId: created.id,
        documentType: "proposal",
        title: `${created.title} (v${created.version})`,
        fileUrl,
        uploadedByUserId: input.userId,
      },
    });

    await tx.clientRoadmapPhase.update({
      where: { id: phase.id },
      data: {
        proposalGeneratedAt: new Date(),
        status:
          phase.status === "planned" || phase.status === "deferred"
            ? "awaiting_approval"
            : phase.status,
      },
    });

    if (phase.status === "planned" || phase.status === "deferred") {
      await tx.clientRoadmapPhaseEvent.create({
        data: {
          phaseId: phase.id,
          fromStatus: phase.status,
          toStatus: "awaiting_approval",
          changedByUserId: input.userId,
          note: `Proposal ${proposalNumber} v${version} generated`,
        },
      });
    }

    return tx.phaseProposal.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        document: { select: { fileUrl: true } },
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
    });
  });
}

export async function listPhaseProposals(clientId: string, phaseId?: string) {
  const proposals = await prisma.phaseProposal.findMany({
    where: {
      clientId,
      ...(phaseId ? { phaseId } : {}),
    },
    include: { document: { select: { fileUrl: true } } },
    orderBy: [{ createdAt: "desc" }],
  });
  return proposals.map(toSummary);
}

export async function getPhaseProposalDetail(
  clientId: string,
  proposalId: string,
  role: UserRole,
): Promise<PhaseProposalDetail | null> {
  const proposal = await prisma.phaseProposal.findFirst({
    where: { id: proposalId, clientId },
    include: {
      document: { select: { fileUrl: true } },
      createdBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
  });
  if (!proposal) return null;

  const isConsultant = isConsultantRole(role);
  const snapshot = proposal.snapshotJson as unknown as PhaseProposalSnapshot;

  return {
    ...toSummary(proposal),
    clientId: proposal.clientId,
    assessmentId: proposal.assessmentId,
    roadmapId: proposal.roadmapId,
    executiveSummary: proposal.executiveSummary,
    snapshot,
    approvedByName: proposal.approvedBy?.name ?? null,
    clientComments: proposal.clientComments,
    preparedByName: proposal.createdBy.name,
    isConsultant,
    canClientApprove:
      !isConsultant && (proposal.status === "sent" || proposal.status === "viewed"),
  };
}

export async function updatePhaseProposalStatus(input: {
  clientId: string;
  proposalId: string;
  status: PhaseProposalStatus;
  userId: string;
  role: UserRole;
  clientComments?: string;
}) {
  const proposal = await prisma.phaseProposal.findFirst({
    where: { id: input.proposalId, clientId: input.clientId },
    include: { phase: true },
  });
  if (!proposal) return null;

  const isConsultant = isConsultantRole(input.role);

  if (!isConsultant) {
    const allowed =
      (proposal.status === "sent" || proposal.status === "viewed") &&
      (input.status === "approved" || input.status === "rejected" || input.status === "viewed");
    if (!allowed) {
      throw new Error("You do not have permission to apply this proposal status change");
    }
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const updated = await tx.phaseProposal.update({
      where: { id: proposal.id },
      data: {
        status: input.status,
        ...(input.status === "sent" ? { sentAt: proposal.sentAt ?? now } : {}),
        ...(input.status === "viewed" ? { viewedAt: proposal.viewedAt ?? now } : {}),
        ...(input.status === "approved"
          ? {
              approvedAt: now,
              approvedByUserId: input.userId,
              clientComments: input.clientComments ?? proposal.clientComments,
              signatureJson: {
                method: "in_app",
                approvedAt: now.toISOString(),
                approvedByUserId: input.userId,
                comments: input.clientComments ?? proposal.clientComments ?? null,
              } as Prisma.InputJsonValue,
            }
          : {}),
        ...(input.status === "rejected"
          ? {
              rejectedAt: now,
              clientComments: input.clientComments ?? proposal.clientComments,
            }
          : {}),
        ...(input.status === "expired" ? { expiredAt: now } : {}),
      },
      include: {
        document: { select: { fileUrl: true } },
        createdBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
    });

    if (input.status === "approved") {
      const fromStatus = proposal.phase.status;
      await tx.clientRoadmapPhase.update({
        where: { id: proposal.phaseId },
        data: {
          status: "approved",
          approvedAt: now,
          approvedByUserId: input.userId,
          proposalAcceptedAt: now,
        },
      });
      await tx.clientRoadmapPhaseEvent.create({
        data: {
          phaseId: proposal.phaseId,
          fromStatus,
          toStatus: "approved",
          changedByUserId: input.userId,
          note: `Proposal ${proposal.proposalNumber} v${proposal.version} approved`,
        },
      });
    }

    if (input.status === "sent" && proposal.phase.status === "planned") {
      await tx.clientRoadmapPhase.update({
        where: { id: proposal.phaseId },
        data: { status: "awaiting_approval" },
      });
      await tx.clientRoadmapPhaseEvent.create({
        data: {
          phaseId: proposal.phaseId,
          fromStatus: "planned",
          toStatus: "awaiting_approval",
          changedByUserId: input.userId,
          note: `Proposal ${proposal.proposalNumber} v${proposal.version} sent`,
        },
      });
    }

    return updated;
  });
}

export async function getLatestPhaseProposal(phaseId: string) {
  return prisma.phaseProposal.findFirst({
    where: {
      phaseId,
      status: { notIn: ["superseded"] },
    },
    include: { document: { select: { fileUrl: true } } },
    orderBy: [{ version: "desc" }, { createdAt: "desc" }],
  });
}

