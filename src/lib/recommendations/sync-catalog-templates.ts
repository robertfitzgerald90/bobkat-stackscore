import type { Priority, PrismaClient } from "@/generated/prisma/client";
import recommendationCatalog from "../../../data/RecommendationCatalogV2.json";

export type SyncCatalogTemplatesResult = {
  ok: true;
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
 * All upserts run in a single transaction so a mid-run failure rolls back
 * partially applied template updates.
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

  for (const template of recommendationCatalog.templates) {
    if (template.isStub) {
      stubCodes.push(template.id);
    } else {
      approvedCodes.push(template.id);
    }

    if (!categoryIdByCode.has(template.pillarCode)) {
      skippedMissingCategory.push(template.id);
    }
  }

  const toUpsert = recommendationCatalog.templates.filter((template) =>
    categoryIdByCode.has(template.pillarCode),
  );

  try {
    const upserted = await prisma.$transaction(async (tx) => {
      let count = 0;
      for (const template of toUpsert) {
        const categoryId = categoryIdByCode.get(template.pillarCode);
        if (!categoryId) {
          // Defensive — should be unreachable after pre-filter.
          throw new Error(`Missing category for template ${template.id}`);
        }

        await tx.recommendationTemplate.upsert({
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
        count += 1;
      }
      return count;
    });

    return {
      ok: true,
      upserted,
      skippedMissingCategory,
      approvedCodes,
      stubCodes,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown catalog sync failure";
    throw new Error(`Catalog template sync failed and was rolled back: ${message}`, {
      cause: error,
    });
  }
}

export type RefreshUneditedStubRecommendationsResult = {
  ok: true;
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
 *
 * Updates run in a single transaction so a mid-run failure rolls back all
 * content refreshes from this invocation.
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

  type RefreshPlanItem = {
    rowId: string;
    data: {
      title: string;
      description: string;
      businessImpact: string;
      suggestedService: string;
      priority: Priority;
      estimatedImpactPoints: number;
    };
  };

  const plan: RefreshPlanItem[] = [];
  let skippedNonStubTitle = 0;
  let skippedMissingTemplate = 0;

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

      plan.push({
        rowId: row.id,
        data: {
          title: catalogTemplate.title,
          description: catalogTemplate.description,
          businessImpact: catalogTemplate.businessImpact,
          suggestedService: catalogTemplate.suggestedService,
          priority: catalogTemplate.priority as Priority,
          estimatedImpactPoints: catalogTemplate.estimatedImpactPoints,
        },
      });
    }
  }

  try {
    const updatedIds = await prisma.$transaction(async (tx) => {
      const ids: string[] = [];
      for (const item of plan) {
        await tx.assessmentRecommendation.update({
          where: { id: item.rowId },
          data: item.data,
        });
        ids.push(item.rowId);
      }
      return ids;
    });

    return {
      ok: true,
      updated: updatedIds.length,
      skippedNonStubTitle,
      skippedMissingTemplate,
      updatedIds,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown refresh failure";
    throw new Error(
      `Unedited stub recommendation refresh failed and was rolled back: ${message}`,
      { cause: error },
    );
  }
}
