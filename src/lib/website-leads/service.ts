import type { Prisma, WebsiteLeadStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";
import type { AdminAuditActor } from "@/lib/admin/audit-log";
import { recordWebsiteLeadAuditEvent } from "@/lib/website-leads/audit";
import {
  sendWebsiteLeadConfirmationEmail,
  sendWebsiteLeadInternalNotification,
} from "@/lib/website-leads/emails";
import { sanitizePlainText } from "@/lib/website-leads/sanitize";
import type {
  ConvertWebsiteLeadInput,
  CreateWebsiteLeadIntegrationInput,
  UpdateWebsiteLeadInput,
} from "@/lib/website-leads/schemas";

const STATUS_TIMESTAMP_FIELDS: Partial<
  Record<WebsiteLeadStatus, "lastContactedAt" | "convertedAt">
> = {
  CONTACTED: "lastContactedAt",
  CONVERTED: "convertedAt",
};

export type WebsiteLeadListFilters = {
  search?: string;
  status?: WebsiteLeadStatus;
  source?: CreateWebsiteLeadIntegrationInput["source"];
  submittedFrom?: Date;
  submittedTo?: Date;
  sort?: "newest" | "oldest";
  skip?: number;
  take?: number;
};

export type WebsiteLeadSummaryStats = {
  total: number;
  newLeads: number;
  contacted: number;
  qualified: number;
  converted: number;
};

export async function countNewWebsiteLeads(): Promise<number> {
  return prisma.websiteLead.count({ where: { status: "NEW" } });
}

export async function getWebsiteLeadSummaryStats(): Promise<WebsiteLeadSummaryStats> {
  const [total, newLeads, contacted, qualified, converted] = await Promise.all([
    prisma.websiteLead.count(),
    prisma.websiteLead.count({ where: { status: "NEW" } }),
    prisma.websiteLead.count({ where: { status: "CONTACTED" } }),
    prisma.websiteLead.count({ where: { status: "QUALIFIED" } }),
    prisma.websiteLead.count({ where: { status: "CONVERTED" } }),
  ]);

  return { total, newLeads, contacted, qualified, converted };
}

function buildWhere(filters?: WebsiteLeadListFilters): Prisma.WebsiteLeadWhereInput {
  const where: Prisma.WebsiteLeadWhereInput = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.source) where.source = filters.source;

  if (filters?.submittedFrom || filters?.submittedTo) {
    where.submittedAt = {};
    if (filters.submittedFrom) where.submittedAt.gte = filters.submittedFrom;
    if (filters.submittedTo) where.submittedAt.lte = filters.submittedTo;
  }

  if (filters?.search?.trim()) {
    const query = filters.search.trim();
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { company: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      { message: { contains: query, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listWebsiteLeadsForAdmin(filters?: WebsiteLeadListFilters) {
  const where = buildWhere(filters);
  const orderBy =
    filters?.sort === "oldest" ? { submittedAt: "asc" as const } : { submittedAt: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.websiteLead.findMany({
      where,
      orderBy,
      skip: filters?.skip,
      take: filters?.take,
      include: {
        linkedClient: {
          select: { id: true, companyName: true, status: true },
        },
        linkedAssessment: {
          select: { id: true, assessmentName: true, status: true },
        },
      },
    }),
    prisma.websiteLead.count({ where }),
  ]);

  return { items, total };
}

export async function getWebsiteLeadById(id: string) {
  return prisma.websiteLead.findUnique({
    where: { id },
    include: {
      linkedClient: {
        select: { id: true, companyName: true, status: true, primaryContactEmail: true },
      },
      linkedAssessment: {
        select: { id: true, assessmentName: true, status: true },
      },
    },
  });
}

export async function createWebsiteLeadFromIntegration(
  input: CreateWebsiteLeadIntegrationInput,
): Promise<{ lead: Awaited<ReturnType<typeof getWebsiteLeadById>>; duplicate: boolean }> {
  const submissionId = input.submissionId?.trim() || null;

  if (submissionId) {
    const existing = await prisma.websiteLead.findUnique({ where: { submissionId } });
    if (existing) {
      return { lead: await getWebsiteLeadById(existing.id), duplicate: true };
    }
  }

  const lead = await prisma.websiteLead.create({
    data: {
      name: input.name.trim(),
      company: input.company?.trim() || null,
      phone: input.phone?.trim() || null,
      email: normalizePurchaserEmail(input.email),
      message: sanitizePlainText(input.message),
      source: input.source,
      submissionId,
      websiteUrl: input.websiteUrl?.trim() || null,
      status: "NEW",
    },
  });

  await recordWebsiteLeadAuditEvent({
    action: "website_lead_received",
    entityId: lead.id,
    summary: `Website lead received from ${lead.name}`,
    source: "integration.website-leads",
    metadata: { source: lead.source, hasSubmissionId: Boolean(submissionId) },
  });

  void sendWebsiteLeadInternalNotification({
    leadId: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    source: lead.source,
    submittedAt: lead.submittedAt,
  }).catch((error) => {
    console.warn("[website-leads] internal notification failed", {
      leadId: lead.id,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  const confirmation = await sendWebsiteLeadConfirmationEmail({
    leadId: lead.id,
    email: lead.email,
    name: lead.name,
  });

  await recordWebsiteLeadAuditEvent({
    action: "website_lead_confirmation_sent",
    entityId: lead.id,
    summary: confirmation.sent
      ? "Confirmation email sent"
      : `Confirmation email failed: ${confirmation.error ?? "unknown"}`,
    source: "integration.website-leads",
    metadata: { sent: confirmation.sent, error: confirmation.error ?? null },
  });

  return { lead: await getWebsiteLeadById(lead.id), duplicate: false };
}

export async function updateWebsiteLead(
  id: string,
  input: UpdateWebsiteLeadInput,
  actor: AdminAuditActor,
) {
  const existing = await prisma.websiteLead.findUnique({ where: { id } });
  if (!existing) return null;

  const data: Prisma.WebsiteLeadUpdateInput = {};

  if (input.internalNotes !== undefined) {
    data.internalNotes = input.internalNotes.trim() || null;
  }

  if (input.status && input.status !== existing.status) {
    data.status = input.status;
    const timestampField = STATUS_TIMESTAMP_FIELDS[input.status];
    if (timestampField) {
      data[timestampField] = new Date();
    }
  }

  const updated = await prisma.websiteLead.update({
    where: { id },
    data,
    include: {
      linkedClient: { select: { id: true, companyName: true, status: true } },
      linkedAssessment: { select: { id: true, assessmentName: true, status: true } },
    },
  });

  if (input.status && input.status !== existing.status) {
    await recordWebsiteLeadAuditEvent({
      action: "website_lead_status_changed",
      entityId: id,
      summary: `Status changed from ${existing.status} to ${input.status}`,
      source: "admin.website-leads",
      actor,
      metadata: { previousStatus: existing.status, nextStatus: input.status },
    });
  }

  return updated;
}

export async function convertWebsiteLead(
  id: string,
  input: ConvertWebsiteLeadInput,
  actor: AdminAuditActor,
) {
  const lead = await prisma.websiteLead.findUnique({ where: { id } });
  if (!lead) return { ok: false as const, code: "NOT_FOUND" as const };

  if (lead.status === "CONVERTED" && lead.linkedClientId) {
    return { ok: false as const, code: "ALREADY_CONVERTED" as const };
  }

  let clientId: string;
  let assessmentId: string | null = null;

  if (input.mode === "link_existing") {
    const client = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client) return { ok: false as const, code: "CLIENT_NOT_FOUND" as const };
    clientId = client.id;

    if (input.assessmentId) {
      const assessment = await prisma.assessment.findFirst({
        where: { id: input.assessmentId, clientId },
      });
      if (!assessment) return { ok: false as const, code: "ASSESSMENT_NOT_FOUND" as const };
      assessmentId = assessment.id;
    }
  } else {
    const client = await prisma.client.create({
      data: {
        companyName: input.companyName.trim(),
        primaryContactName: input.primaryContactName.trim(),
        primaryContactEmail: normalizePurchaserEmail(input.primaryContactEmail),
        primaryContactPhone: input.primaryContactPhone?.trim() || lead.phone,
        industry: input.industry?.trim() || null,
        status: "prospect",
        notes: lead.message,
        technologyProfile: { create: {} },
      },
    });
    clientId = client.id;
  }

  const updated = await prisma.websiteLead.update({
    where: { id },
    data: {
      status: "CONVERTED",
      convertedAt: new Date(),
      linkedClientId: clientId,
      linkedAssessmentId: assessmentId,
    },
    include: {
      linkedClient: { select: { id: true, companyName: true, status: true } },
      linkedAssessment: { select: { id: true, assessmentName: true, status: true } },
    },
  });

  await recordWebsiteLeadAuditEvent({
    action: "website_lead_converted",
    entityId: id,
    summary: `Lead converted to client ${clientId}`,
    source: "admin.website-leads",
    actor,
    metadata: { clientId, assessmentId, mode: input.mode },
  });

  return { ok: true as const, lead: updated };
}

export async function deleteWebsiteLead(id: string, actor: AdminAuditActor) {
  const lead = await prisma.websiteLead.findUnique({ where: { id } });
  if (!lead) return { ok: false as const, code: "NOT_FOUND" as const };

  await prisma.websiteLead.delete({ where: { id } });

  await recordWebsiteLeadAuditEvent({
    action: "website_lead_deleted",
    entityId: id,
    summary: `Deleted website lead for ${lead.name}`,
    source: "admin.website-leads",
    actor,
    metadata: { email: lead.email, status: lead.status },
  });

  return { ok: true as const, deletedLeadId: id };
}

export async function recordWebsiteLeadViewed(id: string, actor: AdminAuditActor) {
  await recordWebsiteLeadAuditEvent({
    action: "website_lead_viewed",
    entityId: id,
    summary: "Lead detail viewed",
    source: "admin.website-leads",
    actor,
  });
}
