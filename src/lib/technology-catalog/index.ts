import { prisma } from "@/lib/db";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import type {
  CatalogMetrics,
  CatalogTechnologyDetail,
  CatalogTechnologySummary,
  TechnologyCategorySummary,
} from "./types";

const technologyListInclude = {
  category: true,
  capabilities: { orderBy: { displayOrder: "asc" as const }, take: 5 },
  products: { where: { isActive: true }, select: { id: true } },
  pillarMappings: { select: { id: true } },
} as const;

const technologyDetailInclude = {
  category: true,
  capabilities: { orderBy: { displayOrder: "asc" as const } },
  products: { where: { isActive: true }, orderBy: { displayOrder: "asc" as const } },
  businessOutcomes: { orderBy: { displayOrder: "asc" as const } },
  pillarMappings: { orderBy: { relationshipType: "asc" as const } },
} as const;

function pillarNameForCode(code: string): string {
  return TECHNOLOGY_PILLARS.find((pillar) => pillar.code === code)?.name ?? code;
}

function mapTechnologySummary(
  technology: Awaited<ReturnType<typeof fetchTechnologyList>>[number],
): CatalogTechnologySummary {
  return {
    id: technology.id,
    slug: technology.slug,
    name: technology.name,
    vendor: technology.vendor,
    productFamily: technology.productFamily,
    categoryId: technology.categoryId,
    categoryName: technology.category.name,
    categorySlug: technology.category.slug,
    summary: technology.summary,
    purpose: technology.purpose,
    standardStatus: technology.standardStatus,
    lifecycleStatus: technology.lifecycleStatus,
    stackLayer: technology.stackLayer,
    isFeatured: technology.isFeatured,
    lastReviewedAt: technology.lastReviewedAt?.toISOString() ?? null,
    topCapabilities: technology.capabilities.map((capability) => capability.name),
    mappedPillarCount: technology.pillarMappings.length,
    playbookCount: technology.relatedPlaybookCount,
    productCount: technology.products.length,
  };
}

async function fetchTechnologyList() {
  return prisma.technology.findMany({
    where: { isActive: true },
    include: technologyListInclude,
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });
}

export async function getTechnologyCategories(): Promise<TechnologyCategorySummary[]> {
  return prisma.technologyCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      icon: true,
      displayOrder: true,
    },
  });
}

export async function getCatalogTechnologies(): Promise<CatalogTechnologySummary[]> {
  const technologies = await fetchTechnologyList();
  return technologies.map(mapTechnologySummary);
}

export async function getFeaturedTechnologies(): Promise<CatalogTechnologySummary[]> {
  const technologies = await fetchTechnologyList();
  return technologies.filter((technology) => technology.isFeatured).map(mapTechnologySummary);
}

export async function getTechnologyBySlug(slug: string): Promise<CatalogTechnologyDetail | null> {
  const technology = await prisma.technology.findUnique({
    where: { slug, isActive: true },
    include: technologyDetailInclude,
  });

  if (!technology) return null;

  const summary = mapTechnologySummary({
    ...technology,
    capabilities: technology.capabilities.slice(0, 5),
    products: technology.products.map((product) => ({ id: product.id })),
    pillarMappings: technology.pillarMappings,
  });

  return {
    ...summary,
    topCapabilities: technology.capabilities.slice(0, 5).map((capability) => capability.name),
    productCount: technology.products.length,
    whySelected: technology.whySelected,
    businessValue: technology.businessValue,
    technicalOverview: technology.technicalOverview,
    standardDeployment: technology.standardDeployment,
    supportScope: technology.supportScope,
    limitations: technology.limitations,
    licensingNotes: technology.licensingNotes,
    securityNotes: technology.securityNotes,
    operationalNotes: technology.operationalNotes,
    websiteUrl: technology.websiteUrl,
    documentationUrl: technology.documentationUrl,
    nextReviewAt: technology.nextReviewAt?.toISOString() ?? null,
    capabilities: technology.capabilities.map((capability) => ({
      id: capability.id,
      name: capability.name,
      description: capability.description,
      capabilityType: capability.capabilityType,
      displayOrder: capability.displayOrder,
    })),
    products: technology.products.map((product) => ({
      id: product.id,
      name: product.name,
      modelNumber: product.modelNumber,
      productType: product.productType,
      summary: product.summary,
      recommendedUseCase: product.recommendedUseCase,
      environmentSize: product.environmentSize,
      lifecycleStatus: product.lifecycleStatus,
      isPreferred: product.isPreferred,
      displayOrder: product.displayOrder,
    })),
    businessOutcomes: technology.businessOutcomes.map((outcome) => ({
      id: outcome.id,
      name: outcome.name,
      description: outcome.description,
      displayOrder: outcome.displayOrder,
    })),
    pillarMappings: technology.pillarMappings.map((mapping) => ({
      id: mapping.id,
      pillarCode: mapping.pillarCode,
      pillarName: pillarNameForCode(mapping.pillarCode),
      relationshipType: mapping.relationshipType,
      explanation: mapping.explanation,
    })),
  };
}

export async function getCategoryName(categoryId: string): Promise<string> {
  const category = await prisma.technologyCategory.findUnique({
    where: { id: categoryId },
    select: { name: true },
  });
  return category?.name ?? categoryId;
}

export async function getCatalogMetrics(): Promise<CatalogMetrics> {
  const [technologies, productCount, pillarMappings] = await Promise.all([
    prisma.technology.findMany({
      where: { isActive: true },
      select: {
        standardStatus: true,
        relatedPlaybookCount: true,
      },
    }),
    prisma.technologyProduct.count({ where: { isActive: true } }),
    prisma.technologyPillarMapping.count(),
  ]);

  return {
    preferredCount: technologies.filter((technology) => technology.standardStatus === "preferred")
      .length,
    productCount,
    pillarMappings,
    playbookCount: technologies.reduce(
      (sum, technology) => sum + technology.relatedPlaybookCount,
      0,
    ),
    technologyCount: technologies.length,
  };
}

export async function getActiveTechnologiesForAssignment() {
  return prisma.technology.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      vendor: true,
      standardStatus: true,
      category: { select: { name: true } },
      products: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          name: true,
          modelNumber: true,
          isPreferred: true,
        },
      },
    },
  });
}

export {
  formatLifecycleStatus,
  formatStandardStatus,
  standardStatusLabel,
} from "./labels";
