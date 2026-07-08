import recommendationCatalog from "../../../data/RecommendationCatalogV2.json";
import type { PrismaClient } from "@/generated/prisma/client";
import {
  DOC114_STANDARD_EVIDENCE,
  doc114CategoryLabelForPillar,
  doc114PlaybookForPillar,
} from "@/lib/assessment-library/doc114-taxonomy";
import { V2_CATALOG_BY_ID, V2_PILLAR_CODES } from "@/lib/assessment-library/v2-catalog";

type CatalogQuestion = (typeof import("../../../data/v2-question-library.json"))["questions"][number];

type RecommendationTemplate = (typeof recommendationCatalog)["templates"][number];

const RECOMMENDATION_BY_QUESTION_ID = new Map<string, RecommendationTemplate>(
  recommendationCatalog.templates.map((template) => [template.questionId, template]),
);

export type V2QuestionDoc114Metadata = {
  purpose: string;
  helpText: string;
  capability: string;
  evidenceRequired: string;
  relatedService: string | null;
  relatedPlaybook: string | null;
  adminNotes: string;
};

function isBlank(value: string | null | undefined): boolean {
  return value == null || value.trim() === "";
}

/** Derives DOC-114 metadata for a v2 pillar question from catalog + recommendation sources. */
export function getV2QuestionDoc114Metadata(
  catalogQuestion: CatalogQuestion,
): V2QuestionDoc114Metadata {
  const recommendation = RECOMMENDATION_BY_QUESTION_ID.get(catalogQuestion.id);
  const doc114CategoryLabel = doc114CategoryLabelForPillar(catalogQuestion.pillarCode);
  const relatedPlaybook = doc114PlaybookForPillar(catalogQuestion.pillarCode);

  return {
    purpose: catalogQuestion.whyItMatters,
    helpText: catalogQuestion.whyItMatters,
    capability: catalogQuestion.capability,
    evidenceRequired: DOC114_STANDARD_EVIDENCE,
    relatedService: recommendation?.suggestedService ?? null,
    relatedPlaybook,
    adminNotes: doc114CategoryLabel
      ? `DOC-114 reporting category: ${doc114CategoryLabel}`
      : "",
  };
}

type ExistingQuestionFields = {
  purpose: string | null;
  helpText: string | null;
  capability: string | null;
  evidenceRequired: string | null;
  relatedService: string | null;
  relatedPlaybook: string | null;
  adminNotes: string | null;
};

/** Returns only fields that are missing on the existing row and available in source data. */
export function buildV2QuestionMetadataPatch(
  existing: ExistingQuestionFields,
  catalogQuestion: CatalogQuestion,
): Partial<V2QuestionDoc114Metadata> {
  const source = getV2QuestionDoc114Metadata(catalogQuestion);
  const patch: Partial<V2QuestionDoc114Metadata> = {};

  if (isBlank(existing.purpose) && !isBlank(source.purpose)) {
    patch.purpose = source.purpose;
  }
  if (isBlank(existing.helpText) && !isBlank(source.helpText)) {
    patch.helpText = source.helpText;
  }
  if (isBlank(existing.capability) && !isBlank(source.capability)) {
    patch.capability = source.capability;
  }
  if (isBlank(existing.evidenceRequired) && !isBlank(source.evidenceRequired)) {
    patch.evidenceRequired = source.evidenceRequired;
  }
  if (isBlank(existing.relatedService) && !isBlank(source.relatedService)) {
    patch.relatedService = source.relatedService;
  }
  if (isBlank(existing.relatedPlaybook) && !isBlank(source.relatedPlaybook)) {
    patch.relatedPlaybook = source.relatedPlaybook;
  }
  if (isBlank(existing.adminNotes) && !isBlank(source.adminNotes)) {
    patch.adminNotes = source.adminNotes;
  }

  return patch;
}

export type BackfillV2MetadataResult = {
  scanned: number;
  updated: number;
  skipped: number;
};

/** Backfills missing DOC-114 metadata on active v2 pillar questions without overwriting admin edits. */
export async function backfillV2QuestionMetadata(
  prisma: PrismaClient,
): Promise<BackfillV2MetadataResult> {
  const activeQuestions = await prisma.assessmentQuestion.findMany({
    where: {
      isActive: true,
      code: { in: [...V2_CATALOG_BY_ID.keys()] },
      category: { code: { in: [...V2_PILLAR_CODES] } },
    },
    select: {
      id: true,
      code: true,
      purpose: true,
      helpText: true,
      capability: true,
      evidenceRequired: true,
      relatedService: true,
      relatedPlaybook: true,
      adminNotes: true,
    },
  });

  let updated = 0;

  for (const question of activeQuestions) {
    const catalogEntry = V2_CATALOG_BY_ID.get(question.code);
    if (!catalogEntry) continue;

    const patch = buildV2QuestionMetadataPatch(question, catalogEntry);
    if (Object.keys(patch).length === 0) continue;

    await prisma.assessmentQuestion.update({
      where: { id: question.id },
      data: patch,
    });
    updated += 1;
  }

  return {
    scanned: activeQuestions.length,
    updated,
    skipped: activeQuestions.length - updated,
  };
}
