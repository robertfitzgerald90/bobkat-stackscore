import type { Prisma, ProspectStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export type ProspectListFilters = {
  search?: string;
  status?: ProspectStatus;
  industry?: string;
  assessmentStarted?: boolean;
  assessmentCompleted?: boolean;
  opened?: boolean;
  clicked?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
};

function buildProspectWhere(filters: ProspectListFilters): Prisma.ProspectWhereInput {
  const where: Prisma.ProspectWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.industry?.trim()) {
    where.industry = { equals: filters.industry.trim(), mode: "insensitive" };
  }
  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }

  const recipientFilters: Prisma.CampaignRecipientListRelationFilter = {};
  if (filters.assessmentStarted) {
    recipientFilters.some = { ...(recipientFilters.some ?? {}), assessmentStartedAt: { not: null } };
  }
  if (filters.assessmentCompleted) {
    recipientFilters.some = { ...(recipientFilters.some ?? {}), assessmentCompletedAt: { not: null } };
  }
  if (filters.opened) {
    recipientFilters.some = { ...(recipientFilters.some ?? {}), openedAt: { not: null } };
  }
  if (filters.clicked) {
    recipientFilters.some = { ...(recipientFilters.some ?? {}), clickedAt: { not: null } };
  }
  if (Object.keys(recipientFilters).length > 0) {
    where.campaignRecipients = recipientFilters;
  }

  return where;
}

export async function listProspects(filters: ProspectListFilters = {}) {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100);
  const skip = (page - 1) * limit;
  const where = buildProspectWhere(filters);

  const [items, total] = await Promise.all([
    prisma.prospect.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        createdBy: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true, status: true } },
        campaignRecipients: {
          take: 1,
          orderBy: { invitedAt: "desc" },
          select: { campaignId: true, invitedAt: true },
        },
      },
    }),
    prisma.prospect.count({ where }),
  ]);

  return {
    items: items.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      company: p.company,
      email: p.email,
      phone: p.phone,
      industry: p.industry,
      employeeCount: p.employeeCount,
      leadSource: p.leadSource,
      notes: p.notes,
      status: p.status,
      clientId: p.clientId,
      clientStatus: p.client?.status ?? null,
      createdAt: p.createdAt.toISOString(),
      lastContactAt: p.lastContactAt?.toISOString() ?? null,
      createdByName: p.createdBy?.name ?? null,
      latestCampaignId: p.campaignRecipients[0]?.campaignId ?? null,
    })),
    total,
    page,
    limit,
  };
}

export async function getProspectDetail(prospectId: string) {
  return prisma.prospect.findUnique({
    where: { id: prospectId },
    include: {
      createdBy: { select: { id: true, name: true } },
      client: true,
      campaignRecipients: {
        orderBy: { createdAt: "desc" },
        include: {
          campaign: { select: { id: true, name: true, status: true } },
          message: { select: { id: true, status: true, sentAt: true } },
        },
      },
    },
  });
}

export async function listProspectIndustries() {
  const rows = await prisma.prospect.findMany({
    where: { industry: { not: null } },
    distinct: ["industry"],
    select: { industry: true },
    orderBy: { industry: "asc" },
  });
  return rows.map((r) => r.industry).filter(Boolean) as string[];
}
