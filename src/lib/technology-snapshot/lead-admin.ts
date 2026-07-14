import type { Prisma, TechnologySnapshotLeadStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { findDuplicateByEmail } from "@/lib/communications/outreach/duplicate-detection";
import { createOrUpdateProspectOnly } from "@/lib/communications/outreach/create-prospect";
import { sendAssessmentInvitation } from "@/lib/communications/outreach/send-invitation";
import { recordCampaignEvent } from "@/lib/communications/outreach/campaign-sync";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import { provisionInviteWorkspace } from "@/lib/communications/outreach/provisioning";
import { ensurePrimaryContactFromClient } from "@/lib/communications/contacts/service";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";
import {
  buildContactName,
  resolveLeadFirstName,
  splitContactName,
} from "@/lib/technology-snapshot/contact-helpers";
import { buildSnapshotResult } from "@/lib/technology-snapshot/scoring";
import type { SnapshotAnswers } from "@/lib/technology-snapshot/types";

const STATUS_TIMESTAMP_FIELDS: Partial<
  Record<TechnologySnapshotLeadStatus, "contactedAt" | "assessmentInvitedAt" | "convertedAt" | "archivedAt">
> = {
  contacted: "contactedAt",
  assessment_invited: "assessmentInvitedAt",
  converted: "convertedAt",
  archived: "archivedAt",
};

function normalizeCompanyName(value: string): string {
  return value.trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
}

function emailDomain(email: string): string {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1]!.toLowerCase() : "";
}

export type SnapshotLeadListFilters = {
  search?: string;
  status?: TechnologySnapshotLeadStatus;
  classification?: string;
  contacted?: "yes" | "no";
  submittedFrom?: Date;
  submittedTo?: Date;
};

export type SnapshotLeadSummaryStats = {
  newLeads: number;
  contacted: number;
  assessmentInvitationsSent: number;
  converted: number;
  followUpNeeded: number;
};

export async function listTechnologySnapshotLeadsForAdmin(filters?: SnapshotLeadListFilters) {
  const where: Prisma.TechnologySnapshotLeadWhereInput = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.classification) {
    where.classification = filters.classification;
  }

  if (filters?.contacted === "yes") {
    where.contactedAt = { not: null };
  } else if (filters?.contacted === "no") {
    where.contactedAt = null;
  }

  if (filters?.submittedFrom || filters?.submittedTo) {
    where.createdAt = {};
    if (filters.submittedFrom) where.createdAt.gte = filters.submittedFrom;
    if (filters.submittedTo) where.createdAt.lte = filters.submittedTo;
  }

  if (filters?.search?.trim()) {
    const query = filters.search.trim();
    where.OR = [
      { contactName: { contains: query, mode: "insensitive" } },
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { companyName: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }

  return prisma.technologySnapshotLead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, note: true, createdAt: true },
      },
      prospect: {
        select: {
          id: true,
          status: true,
          clientId: true,
        },
      },
      client: {
        select: {
          id: true,
          companyName: true,
          status: true,
        },
      },
    },
  });
}

export async function getTechnologySnapshotLeadSummaryStats(): Promise<SnapshotLeadSummaryStats> {
  const [newLeads, contacted, assessmentInvitationsSent, converted, followUpNeeded] =
    await Promise.all([
      prisma.technologySnapshotLead.count({ where: { status: "new" } }),
      prisma.technologySnapshotLead.count({ where: { status: "contacted" } }),
      prisma.technologySnapshotLead.count({
        where: {
          OR: [{ status: "assessment_invited" }, { assessmentInvitedAt: { not: null } }],
        },
      }),
      prisma.technologySnapshotLead.count({ where: { status: "converted" } }),
      prisma.technologySnapshotLead.count({ where: { status: "follow_up" } }),
    ]);

  return { newLeads, contacted, assessmentInvitationsSent, converted, followUpNeeded };
}

export async function getTechnologySnapshotLeadById(id: string) {
  return prisma.technologySnapshotLead.findUnique({
    where: { id },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
        },
      },
      prospect: {
        include: {
          campaignRecipients: {
            orderBy: { invitedAt: "desc" },
            take: 5,
            include: {
              campaign: { select: { id: true, name: true, status: true } },
              message: { select: { id: true, status: true, createdAt: true } },
            },
          },
          client: { select: { id: true, companyName: true, status: true } },
        },
      },
      client: { select: { id: true, companyName: true, status: true } },
    },
  });
}

export async function updateTechnologySnapshotLeadStatus(
  id: string,
  status: TechnologySnapshotLeadStatus,
) {
  const timestampField = STATUS_TIMESTAMP_FIELDS[status];
  const data: Record<string, unknown> = { status };
  if (timestampField) {
    data[timestampField] = new Date();
  }

  return prisma.technologySnapshotLead.update({
    where: { id },
    data,
  });
}

export async function addTechnologySnapshotLeadNote(input: {
  leadId: string;
  authorUserId: string;
  note: string;
}) {
  return prisma.technologySnapshotLeadNote.create({
    data: {
      leadId: input.leadId,
      authorUserId: input.authorUserId,
      note: input.note.trim(),
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });
}

export type SnapshotLeadInvitationState = {
  canSend: boolean;
  reason?: string;
  existingProspectId?: string;
  existingClientId?: string;
  hasActiveUser?: boolean;
  lastInvitedAt?: string;
};

export async function getSnapshotLeadInvitationState(
  leadId: string,
): Promise<SnapshotLeadInvitationState> {
  const lead = await prisma.technologySnapshotLead.findUnique({
    where: { id: leadId },
    include: {
      prospect: {
        include: {
          campaignRecipients: {
            orderBy: { invitedAt: "desc" },
            take: 1,
            select: { invitedAt: true },
          },
        },
      },
    },
  });
  if (!lead) throw new Error("Snapshot lead not found");

  const email = normalizePurchaserEmail(lead.email);
  const duplicate = await findDuplicateByEmail(email);
  const activeUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true, clientId: true },
  });

  const lastInvitedAt =
    lead.assessmentInvitedAt ??
    lead.prospect?.campaignRecipients[0]?.invitedAt ??
    null;

  if (activeUser?.isActive && activeUser.clientId) {
    return {
      canSend: false,
      reason: "This lead already has an active customer account.",
      existingClientId: activeUser.clientId,
      hasActiveUser: true,
      lastInvitedAt: lastInvitedAt?.toISOString(),
    };
  }

  if (lead.status === "assessment_invited" && lastInvitedAt) {
    const hoursSinceInvite = (Date.now() - lastInvitedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceInvite < 24) {
      return {
        canSend: false,
        reason: "An assessment invitation was sent recently. Wait 24 hours or resend from Prospects.",
        existingProspectId: lead.prospectId ?? duplicate?.id,
        lastInvitedAt: lastInvitedAt.toISOString(),
      };
    }
  }

  if (duplicate && duplicate.type !== "prospect") {
    return {
      canSend: false,
      reason: `A matching ${duplicate.type} record already exists.`,
      existingClientId: duplicate.type === "organization" ? duplicate.id : undefined,
      hasActiveUser: duplicate.type === "user",
      lastInvitedAt: lastInvitedAt?.toISOString(),
    };
  }

  return {
    canSend: true,
    existingProspectId: lead.prospectId ?? (duplicate?.type === "prospect" ? duplicate.id : undefined),
    lastInvitedAt: lastInvitedAt?.toISOString(),
  };
}

async function resolveOrCreateInvitationCampaign(input: {
  companyName: string;
  createdByUserId: string;
}) {
  return prisma.communicationCampaign.create({
    data: {
      name: `Snapshot Lead Invite — ${input.companyName}`,
      description: "Auto-created from Snapshot Leads admin action",
      templateKey: "EMAIL-009",
      status: "sending",
      createdByUserId: input.createdByUserId,
      startedAt: new Date(),
    },
  });
}

export async function sendSnapshotLeadAssessmentInvitation(input: {
  leadId: string;
  createdByUserId: string;
  forceResend?: boolean;
}) {
  const lead = await prisma.technologySnapshotLead.findUnique({ where: { id: input.leadId } });
  if (!lead) throw new Error("Snapshot lead not found");

  const invitationState = await getSnapshotLeadInvitationState(input.leadId);
  if (!invitationState.canSend && !input.forceResend) {
    throw new Error(invitationState.reason ?? "Unable to send invitation");
  }

  const email = normalizePurchaserEmail(lead.email);
  const split = lead.firstName
    ? { firstName: lead.firstName, lastName: lead.lastName ?? "" }
    : splitContactName(lead.contactName);

  const campaign = await resolveOrCreateInvitationCampaign({
    companyName: lead.companyName,
    createdByUserId: input.createdByUserId,
  });

  const { prospect } = await createOrUpdateProspectOnly({
    firstName: split.firstName || "Prospect",
    lastName: split.lastName,
    company: lead.companyName,
    email,
    phone: lead.phone,
    industry: lead.industry,
    notes: `Technology Snapshot lead (${lead.id})`,
    leadSource: "website",
    createdByUserId: input.createdByUserId,
    existingProspectId: lead.prospectId ?? invitationState.existingProspectId ?? null,
  });

  const sendResult = await sendAssessmentInvitation({
    email,
    firstName: split.firstName || resolveLeadFirstName(lead),
    organizationName: lead.companyName,
    prospectId: prospect.id,
    campaignId: campaign.id,
    createdByUserId: input.createdByUserId,
    recipientName: buildContactName(split.firstName, split.lastName) || lead.contactName,
    clientId: prospect.clientId,
  });

  const invitedAt = new Date();

  await withCommunicationDbFallback(
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

  await recordCampaignEvent({
    campaignId: campaign.id,
    eventType: "invitation_sent",
    title: "Invitation sent from Snapshot Lead",
    description: `Assessment invitation sent to ${email}`,
    actorUserId: input.createdByUserId,
    metadata: { messageId: sendResult.messageId, snapshotLeadId: lead.id },
  });

  const updatedLead = await prisma.technologySnapshotLead.update({
    where: { id: lead.id },
    data: {
      prospectId: prospect.id,
      status: "assessment_invited",
      assessmentInvitedAt: invitedAt,
    },
  });

  return {
    lead: updatedLead,
    prospectId: prospect.id,
    messageId: sendResult.messageId,
    campaignId: campaign.id,
  };
}

export type SnapshotLeadConvertPreview = {
  leadId: string;
  email: string;
  companyName: string;
  contactName: string;
  matches: Array<{
    type: "organization" | "prospect" | "user";
    id: string;
    label: string;
    href: string;
    reason: string;
  }>;
  recommendedAction: "link_existing" | "create_new";
  recommendedClientId?: string;
};

export async function previewSnapshotLeadConversion(
  leadId: string,
): Promise<SnapshotLeadConvertPreview> {
  const lead = await prisma.technologySnapshotLead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Snapshot lead not found");

  const email = normalizePurchaserEmail(lead.email);
  const domain = emailDomain(email);
  const normalizedCompany = normalizeCompanyName(lead.companyName);
  const matches: SnapshotLeadConvertPreview["matches"] = [];

  const duplicate = await findDuplicateByEmail(email);
  if (duplicate) {
    matches.push({
      type: duplicate.type === "organization" ? "organization" : duplicate.type,
      id: duplicate.id,
      label: duplicate.label,
      href: duplicate.href,
      reason: "Exact email match",
    });
  }

  if (lead.prospectId) {
    const prospect = await prisma.prospect.findUnique({
      where: { id: lead.prospectId },
      select: { id: true, company: true, clientId: true },
    });
    if (prospect && !matches.some((match) => match.id === prospect.id)) {
      matches.push({
        type: "prospect",
        id: prospect.id,
        label: prospect.company,
        href: `/admin/communications/prospects/${prospect.id}`,
        reason: "Linked snapshot prospect",
      });
      if (prospect.clientId) {
        const client = await prisma.client.findUnique({
          where: { id: prospect.clientId },
          select: { id: true, companyName: true },
        });
        if (client && !matches.some((match) => match.id === client.id)) {
          matches.push({
            type: "organization",
            id: client.id,
            label: client.companyName,
            href: `/clients/${client.id}`,
            reason: "Prospect organization",
          });
        }
      }
    }
  }

  const companyConditions: Prisma.ClientWhereInput[] = [
    { companyName: { equals: lead.companyName, mode: "insensitive" } },
  ];
  if (domain) {
    companyConditions.push({
      primaryContactEmail: { endsWith: `@${domain}`, mode: "insensitive" },
    });
  }

  const companyMatches = await prisma.client.findMany({
    where: { OR: companyConditions },
    take: 5,
    select: { id: true, companyName: true, primaryContactEmail: true },
  });

  for (const client of companyMatches) {
    if (matches.some((match) => match.id === client.id)) continue;
    const reasons: string[] = [];
    if (normalizeCompanyName(client.companyName) === normalizedCompany) {
      reasons.push("Normalized company name match");
    }
    if (domain && client.primaryContactEmail.toLowerCase().endsWith(`@${domain}`)) {
      reasons.push("Email domain match");
    }
    matches.push({
      type: "organization",
      id: client.id,
      label: client.companyName,
      href: `/clients/${client.id}`,
      reason: reasons.join("; ") || "Possible organization match",
    });
  }

  const orgMatch = matches.find((match) => match.type === "organization");
  return {
    leadId: lead.id,
    email,
    companyName: lead.companyName,
    contactName: lead.contactName,
    matches,
    recommendedAction: orgMatch ? "link_existing" : "create_new",
    recommendedClientId: orgMatch?.id,
  };
}

export async function convertSnapshotLeadToClient(input: {
  leadId: string;
  createdByUserId: string;
  clientId?: string | null;
}) {
  const lead = await prisma.technologySnapshotLead.findUnique({ where: { id: input.leadId } });
  if (!lead) throw new Error("Snapshot lead not found");
  if (lead.status === "converted" && lead.clientId) {
    return { lead, clientId: lead.clientId, mode: "already_converted" as const };
  }

  const email = normalizePurchaserEmail(lead.email);
  const split = lead.firstName
    ? { firstName: lead.firstName, lastName: lead.lastName ?? "" }
    : splitContactName(lead.contactName);

  if (input.clientId) {
    const client = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client) throw new Error("Organization not found");

    let prospectId = lead.prospectId;
    if (!prospectId) {
      const { prospect } = await createOrUpdateProspectOnly({
        firstName: split.firstName || "Prospect",
        lastName: split.lastName,
        company: lead.companyName,
        email,
        phone: lead.phone,
        industry: lead.industry,
        leadSource: "website",
        createdByUserId: input.createdByUserId,
      });
      prospectId = prospect.id;
      await prisma.prospect.update({
        where: { id: prospectId },
        data: { clientId: client.id, status: "converted" },
      });
    } else {
      await prisma.prospect.update({
        where: { id: prospectId },
        data: { clientId: client.id, status: "converted" },
      });
    }

    const updatedLead = await prisma.technologySnapshotLead.update({
      where: { id: lead.id },
      data: {
        clientId: client.id,
        prospectId,
        status: "converted",
        convertedAt: new Date(),
      },
    });

    return { lead: updatedLead, clientId: client.id, mode: "linked_existing" as const };
  }

  const provisioned = await provisionInviteWorkspace({
    firstName: split.firstName || "Prospect",
    lastName: split.lastName,
    company: lead.companyName,
    email,
    phone: lead.phone,
    industry: lead.industry,
    leadSource: "website",
    createdByUserId: input.createdByUserId,
    existingProspectId: lead.prospectId,
    existingClientId: lead.clientId,
  });

  await ensurePrimaryContactFromClient(provisioned.clientId);

  const updatedLead = await prisma.technologySnapshotLead.update({
    where: { id: lead.id },
    data: {
      clientId: provisioned.clientId,
      prospectId: provisioned.prospectId,
      status: "converted",
      convertedAt: new Date(),
    },
  });

  return {
    lead: updatedLead,
    clientId: provisioned.clientId,
    mode: "created_new" as const,
  };
}

export function buildSnapshotLeadDetailPayload(lead: NonNullable<Awaited<ReturnType<typeof getTechnologySnapshotLeadById>>>) {
  const answers = lead.answers as SnapshotAnswers;
  const result = buildSnapshotResult(answers);

  return {
    ...lead,
    observations: result.observations,
    maxScore: 24,
  };
}
