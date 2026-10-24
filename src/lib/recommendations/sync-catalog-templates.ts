import type { Priority, PrismaClient } from "@/generated/prisma/client";
import recommendationCatalog from "../../../data/RecommendationCatalogV2.json";

export type SyncCatalogTemplatesResult = {
  upserted: number;
  skippedMissingCategory: string[];
  approvedCodes: string[];
  stubCodes: string[];
};

/**
 * Upserts `RecommendationTemplate` rows from RecommendationCatalogV2.json.
 *
 * Safe for repeated runs (idempotent by template `code`).
 * Does **not** modify `AssessmentRecommendation` client rows — those may contain
 * consultant edits that cannot be distinguished from generated copy (SS-OPT-003B).
 *
 * Intended for local/seed/ops invocation only — do not run as an automatic
 * production-wide backfill from application request paths.
 */
export async function syncRecommendationTemplatesFromCatalog(
  prisma: PrismaClient,
): Promise<SyncCatalogTemplatesResult> {
  const categories = await prisma.assessmentCategory.findMany({
    select: { id: true, code: true },
  });
  const categoryIdByCode = new Map(categories.map((category) => [category.code, category.id]));

  const skippedMissingCategory: string[] = [];
  const approvedCodes: string[] = [];
  const stubCodes: string[] = [];
  let upserted = 0;

  for (const template of recommendationCatalog.templates) {
    if (template.isStub) {
      stubCodes.push(template.id);
    } else {
      approvedCodes.push(template.id);
    }

    const categoryId = categoryIdByCode.get(template.pillarCode);
    if (!categoryId) {
      skippedMissingCategory.push(template.id);
      continue;
    }

    await prisma.recommendationTemplate.upsert({
      where: { code: template.id },
      update: {
        title: template.title,
        description: template.description,
        businessImpact: template.businessImpact,
        suggestedService: template.suggestedService,
        priority: template.priority as Priority,
        estimatedImpactPoints: template.estimatedImpactPoints,
        consolidationGroupId: template.consolidationGroupId,
        isActive: true,
        categoryId,
      },
      create: {
        code: template.id,
        title: template.title,
        description: template.description,
        businessImpact: template.businessImpact,
        suggestedService: template.suggestedService,
        priority: template.priority as Priority,
        estimatedImpactPoints: template.estimatedImpactPoints,
        consolidationGroupId: template.consolidationGroupId,
        categoryId,
      },
    });
    upserted += 1;
  }

  return { upserted, skippedMissingCategory, approvedCodes, stubCodes };
}

export type RefreshUneditedStubRecommendationsResult = {
  updated: number;
  skippedNonStubTitle: number;
  skippedMissingTemplate: number;
  updatedIds: string[];
};

/**
 * Updates `AssessmentRecommendation` rows that still carry mechanical stub titles
 * (`Improve …`) from the pre-OPT-003 generator, using approved catalog copy.
 *
 * Skips any row whose title no longer matches the stub pattern — treated as
 * consultant-edited or already refreshed. Does not run automatically.
 */
export async function refreshUneditedStubRecommendationsFromCatalog(
  prisma: PrismaClient,
  templateCodes?: string[],
): Promise<RefreshUneditedStubRecommendationsResult> {
  const approved = recommendationCatalog.templates.filter((template) => {
    if (template.isStub) return false;
    if (templateCodes && !templateCodes.includes(template.id)) return false;
    return true;
  });

  const templatesByCode = new Map(approved.map((template) => [template.id, template]));
  const templateRecords = await prisma.recommendationTemplate.findMany({
    where: { code: { in: [...templatesByCode.keys()] } },
    select: { id: true, code: true },
  });

  let updated = 0;
  let skippedNonStubTitle = 0;
  let skippedMissingTemplate = 0;
  const updatedIds: string[] = [];

  for (const templateRecord of templateRecords) {
    const catalogTemplate = templatesByCode.get(templateRecord.code);
    if (!catalogTemplate) {
      skippedMissingTemplate += 1;
      continue;
    }

    const candidates = await prisma.assessmentRecommendation.findMany({
      where: { recommendationTemplateId: templateRecord.id },
      select: { id: true, title: true },
    });

    for (const row of candidates) {
      if (!row.title.startsWith("Improve ")) {
        skippedNonStubTitle += 1;
        continue;
      }

      await prisma.assessmentRecommendation.update({
        where: { id: row.id },
        data: {
          title: catalogTemplate.title,
          description: catalogTemplate.description,
          businessImpact: catalogTemplate.businessImpact,
          suggestedService: catalogTemplate.suggestedService,
          priority: catalogTemplate.priority as Priority,
          estimatedImpactPoints: catalogTemplate.estimatedImpactPoints,
        },
      });
      updated += 1;
      updatedIds.push(row.id);
    }
  }

  return { updated, skippedNonStubTitle, skippedMissingTemplate, updatedIds };
}
