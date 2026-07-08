import questionLibrary from "../data/v2-question-library.json";
import recommendationCatalog from "../data/RecommendationCatalogV2.json";
import { getV2QuestionDoc114Metadata } from "../src/lib/assessment-library/backfill-v2-metadata";
import {
  V1_CATEGORY_CODES,
  V1_QUESTION_CODES,
} from "../src/lib/assessment-library/v1-library";
import type { PrismaClient, Priority, RiskLevel } from "../src/generated/prisma/client";

export const V2_PILLARS = questionLibrary.pillars;
export const V2_QUESTIONS = questionLibrary.questions;

export const V2_STANDARD_ANSWER_OPTIONS = [
  { text: "Yes", scoreValue: 100, triggersRecommendation: false, triggersCriticalFlag: false },
  { text: "Partially", scoreValue: 50, triggersRecommendation: true, triggersCriticalFlag: false },
  { text: "No", scoreValue: 0, triggersRecommendation: true, triggersCriticalFlag: true },
  { text: "Not Applicable", scoreValue: -1, triggersRecommendation: false, triggersCriticalFlag: false },
] as const;

function riskLevelForWeight(weight: number): RiskLevel {
  if (weight >= 5) return "critical";
  if (weight >= 4) return "high";
  if (weight >= 3) return "medium";
  return "low";
}

export async function clearAssessmentData(prisma: PrismaClient) {
  await prisma.recommendationAssessmentTrigger.deleteMany();
  await prisma.note.deleteMany({
    where: {
      OR: [{ assessmentId: { not: null } }, { projectId: { not: null } }],
    },
  });
  await prisma.document.deleteMany({
    where: {
      OR: [
        { assessmentId: { not: null } },
        { projectId: { not: null } },
        { tipId: { not: null } },
      ],
    },
  });
  await prisma.project.deleteMany();
  await prisma.assessmentRecommendation.deleteMany();
  await prisma.technologyImprovementPlan.deleteMany();
  await prisma.assessmentResponse.deleteMany();
  await prisma.assessmentCategoryScore.deleteMany();
  await prisma.clientScoreHistory.deleteMany();
  await prisma.technologyProfileSnapshot.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.technologyProfile.updateMany({
    data: {
      overallStackScore: null,
      maturityTier: null,
      categoryScores: null,
      riskSummary: null,
      currentAssessmentId: null,
      lastAssessedAt: null,
      nextRecommendedAssessmentAt: null,
      trendDirection: null,
      criticalExposureCount: 0,
      openRecommendationCount: 0,
    },
  });
}

/** Removes all client data — assessments, clients, profiles, QBRs, etc. Users are preserved. */
export async function clearAllClientData(prisma: PrismaClient) {
  await prisma.recommendationAssessmentTrigger.deleteMany();
  await prisma.note.deleteMany();
  await prisma.document.deleteMany();
  await prisma.project.deleteMany();
  await prisma.assessmentRecommendation.deleteMany();
  await prisma.technologyImprovementPlan.deleteMany();
  await prisma.quarterlyBusinessReview.deleteMany();
  await prisma.assessmentResponse.deleteMany();
  await prisma.assessmentCategoryScore.deleteMany();
  await prisma.clientScoreHistory.deleteMany();
  await prisma.technologyProfileSnapshot.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.technologyProfile.deleteMany();
  await prisma.client.deleteMany();
}

export async function deactivateV1Library(prisma: PrismaClient) {
  const v1CategoryCodes = [...V1_CATEGORY_CODES];
  const v1QuestionCodes = [...V1_QUESTION_CODES];

  const categoryScope = { code: { in: v1CategoryCodes } };
  const archivedQuestionScope = {
    OR: [{ category: categoryScope }, { code: { in: v1QuestionCodes } }],
  };

  const [answerOptions, questions, categories, templates] = await Promise.all([
    prisma.answerOption.updateMany({
      where: {
        triggersRecommendation: true,
        question: archivedQuestionScope,
      },
      data: { triggersRecommendation: false },
    }),
    prisma.assessmentQuestion.updateMany({
      where: {
        isActive: true,
        ...archivedQuestionScope,
      },
      data: { isActive: false },
    }),
    prisma.assessmentCategory.updateMany({
      where: {
        isActive: true,
        ...categoryScope,
      },
      data: { isActive: false },
    }),
    prisma.recommendationTemplate.updateMany({
      where: {
        isActive: true,
        category: categoryScope,
      },
      data: { isActive: false },
    }),
  ]);

  return {
    answerOptionsUpdated: answerOptions.count,
    questionsArchived: questions.count,
    categoriesArchived: categories.count,
    templatesArchived: templates.count,
  };
}

export async function seedV2Library(prisma: PrismaClient) {
  const categoryIdByCode = new Map<string, string>();
  const templateIdByCode = new Map<string, string>();

  for (const pillar of V2_PILLARS) {
    const record = await prisma.assessmentCategory.upsert({
      where: { code: pillar.code },
      update: {
        name: pillar.name,
        description: pillar.businessQuestion,
        maxPoints: 100,
        displayOrder: pillar.displayOrder,
        v2CategoryCode: pillar.code,
        v2DisplayName: pillar.name,
        isActive: true,
      },
      create: {
        code: pillar.code,
        name: pillar.name,
        description: pillar.businessQuestion,
        maxPoints: 100,
        displayOrder: pillar.displayOrder,
        v2CategoryCode: pillar.code,
        v2DisplayName: pillar.name,
        isActive: true,
      },
    });
    categoryIdByCode.set(pillar.code, record.id);
  }

  for (const template of recommendationCatalog.templates) {
    const categoryId = categoryIdByCode.get(template.pillarCode);
    if (!categoryId) continue;

    const record = await prisma.recommendationTemplate.upsert({
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
    templateIdByCode.set(template.id, record.id);
  }

  for (const question of V2_QUESTIONS) {
    const categoryId = categoryIdByCode.get(question.pillarCode);
    if (!categoryId) continue;

    const templateCode = question.recommendationId;
    const templateId = templateIdByCode.get(templateCode);
    const doc114Metadata = getV2QuestionDoc114Metadata(question);

    const record = await prisma.assessmentQuestion.upsert({
      where: { code: question.id },
      update: {
        v2QuestionId: question.id,
        categoryId,
        questionText: question.questionText,
        helpText: question.whyItMatters,
        purpose: question.whyItMatters,
        capability: question.capability,
        responseType: "maturity",
        weight: question.weight,
        displayOrder: question.displayOrder,
        riskLevel: riskLevelForWeight(question.weight),
        isActive: true,
      },
      create: {
        code: question.id,
        v2QuestionId: question.id,
        categoryId,
        questionText: question.questionText,
        helpText: question.whyItMatters,
        purpose: question.whyItMatters,
        capability: question.capability,
        evidenceRequired: doc114Metadata.evidenceRequired,
        relatedService: doc114Metadata.relatedService,
        relatedPlaybook: doc114Metadata.relatedPlaybook,
        adminNotes: doc114Metadata.adminNotes,
        responseType: "maturity",
        weight: question.weight,
        displayOrder: question.displayOrder,
        riskLevel: riskLevelForWeight(question.weight),
        isActive: true,
      },
    });

    for (const [index, answer] of V2_STANDARD_ANSWER_OPTIONS.entries()) {
      const triggers =
        answer.triggersRecommendation &&
        (answer.text === "No" || answer.text === "Partially");

      const existing = await prisma.answerOption.findFirst({
        where: { questionId: record.id, answerText: answer.text },
      });

      if (existing) {
        await prisma.answerOption.update({
          where: { id: existing.id },
          data: {
            scoreValue: answer.scoreValue,
            displayOrder: index + 1,
            triggersRecommendation: triggers,
            triggersCriticalFlag: answer.triggersCriticalFlag,
            recommendationTemplateId: triggers ? templateId ?? null : null,
          },
        });
      } else {
        await prisma.answerOption.create({
          data: {
            questionId: record.id,
            answerText: answer.text,
            scoreValue: answer.scoreValue,
            displayOrder: index + 1,
            triggersRecommendation: triggers,
            triggersCriticalFlag: answer.triggersCriticalFlag,
            recommendationTemplateId: triggers ? templateId ?? null : null,
          },
        });
      }
    }
  }

  return { categoryIdByCode, templateIdByCode };
}
