import type { UserRole } from "@/generated/prisma/client";
import { isStaffRole } from "@/lib/api/access";
import { listEmailTemplates } from "@/lib/communications/registry";
import { listCampaigns } from "@/lib/communications/outreach/campaigns";
import { listProspects } from "@/lib/communications/outreach/prospects";
import type { UniversalSearchResult } from "@/lib/command-center/types";
import { prisma } from "@/lib/db";
import { isCustomerMode } from "@/lib/navigation/portal-mode";

export type UniversalSearchOptions = {
  query: string;
  role: UserRole;
  userClientId?: string | null;
  limit?: number;
};

const DEFAULT_LIMIT = 5;

export async function searchTechnologies(
  query: string,
  limit: number,
): Promise<UniversalSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const technologies = await prisma.technology.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { vendor: { contains: q, mode: "insensitive" } },
        { productFamily: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        {
          products: {
            some: { name: { contains: q, mode: "insensitive" }, isActive: true },
          },
        },
      ],
    },
    take: limit,
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      vendor: true,
      productFamily: true,
    },
  });

  return technologies.map((tech) => ({
    id: `technology:${tech.id}`,
    type: "technology" as const,
    title: tech.name,
    subtitle: tech.vendor,
    href: `/technology-catalog/${tech.slug}`,
    keywords: [tech.name, tech.vendor, tech.productFamily ?? ""],
  }));
}

export async function universalSearch(
  options: UniversalSearchOptions,
): Promise<UniversalSearchResult[]> {
  const q = options.query.trim();
  if (q.length < 2) return [];

  const limit = options.limit ?? DEFAULT_LIMIT;
  const { role, userClientId } = options;
  const results: UniversalSearchResult[] = [];

  if (isCustomerMode(role) && userClientId) {
    const [client, assessments] = await Promise.all([
      prisma.client.findUnique({
        where: { id: userClientId },
        select: { id: true, companyName: true, status: true },
      }),
      prisma.assessment.findMany({
        where: {
          clientId: userClientId,
          OR: [
            { assessmentName: { contains: q, mode: "insensitive" } },
            { client: { companyName: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: limit,
        orderBy: { updatedAt: "desc" },
        select: { id: true, assessmentName: true, status: true, clientId: true },
      }),
    ]);

    if (client && client.companyName.toLowerCase().includes(q.toLowerCase())) {
      results.push({
        id: `organization:${client.id}`,
        type: "organization",
        title: client.companyName,
        subtitle: "Your organization",
        href: `/clients/${client.id}/technology-profile`,
      });
    }

    for (const assessment of assessments) {
      results.push({
        id: `assessment:${assessment.id}`,
        type: "assessment",
        title: assessment.assessmentName,
        subtitle: assessment.status,
        href: `/assessments/${assessment.id}`,
      });
    }

    return results.slice(0, limit * 3);
  }

  if (!isStaffRole(role)) {
    return results;
  }

  const [
    clients,
    prospects,
    campaigns,
    assessments,
    projects,
    technologies,
  ] = await Promise.all([
    prisma.client.findMany({
      where: {
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { primaryContactName: { contains: q, mode: "insensitive" } },
          { primaryContactEmail: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: { id: true, companyName: true, status: true },
    }),
    listProspects({ search: q, limit }),
    listCampaigns({ search: q, limit }),
    prisma.assessment.findMany({
      where: {
        OR: [
          { assessmentName: { contains: q, mode: "insensitive" } },
          { client: { companyName: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        assessmentName: true,
        status: true,
        client: { select: { companyName: true } },
      },
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { client: { companyName: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        clientId: true,
        client: { select: { companyName: true } },
      },
    }),
    searchTechnologies(q, limit),
  ]);

  for (const client of clients) {
    results.push({
      id: `organization:${client.id}`,
      type: "organization",
      title: client.companyName,
      subtitle: client.status,
      href: `/clients/${client.id}/technology-profile`,
    });
  }

  for (const prospect of prospects.items) {
    results.push({
      id: `prospect:${prospect.id}`,
      type: "prospect",
      title: `${prospect.firstName} ${prospect.lastName}`,
      subtitle: prospect.company,
      href: `/admin/communications/prospects/${prospect.id}`,
      keywords: [prospect.email],
    });
  }

  for (const campaign of campaigns.items) {
    results.push({
      id: `campaign:${campaign.id}`,
      type: "campaign",
      title: campaign.name,
      subtitle: campaign.status,
      href: `/admin/communications/campaigns/${campaign.id}`,
    });
  }

  for (const assessment of assessments) {
    results.push({
      id: `assessment:${assessment.id}`,
      type: "assessment",
      title: assessment.assessmentName,
      subtitle: assessment.client.companyName,
      href: `/assessments/${assessment.id}`,
    });
  }

  for (const project of projects) {
    results.push({
      id: `project:${project.id}`,
      type: "project",
      title: project.title,
      subtitle: project.client.companyName,
      href: `/projects?client=${project.clientId}&selected=${project.id}`,
    });
  }

  results.push(...technologies);

  const templates = listEmailTemplates().filter((template) => {
    const haystack = `${template.key} ${template.name} ${template.description}`.toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  for (const template of templates.slice(0, limit)) {
    results.push({
      id: `template:${template.key}`,
      type: "template",
      title: template.name,
      subtitle: template.key,
      href: `/admin/communications/templates/${template.key}`,
      keywords: [template.key, template.category],
    });
  }

  if (q.toLowerCase().includes("playbook")) {
    results.push({
      id: "playbook:index",
      type: "playbook",
      title: "Playbooks",
      subtitle: "Technology playbooks",
      href: "/playbooks",
    });
  }

  return results.slice(0, limit * 4);
}
