import "dotenv/config";
import bcrypt from "bcryptjs";
import catalog from "../data/RecommendationRuleCatalog.json";
import { prisma } from "../src/lib/db";
import {
  QUESTION_METADATA_BY_CODE,
  V2_CATEGORY_METADATA,
} from "../src/lib/assessment-library/metadata";
import { backfillTechnologyProfiles } from "../src/lib/technology-profile";
import { CATEGORIES, QUESTIONS_BY_CATEGORY, type SeedAnswer } from "./seed-data";
import { clearAllClientData, clearAssessmentData, deactivateV1Library, seedV2Library } from "./seed-v2";
import { backfillV2QuestionMetadata } from "../src/lib/assessment-library/backfill-v2-metadata";
import { Priority } from "../src/generated/prisma/client";
import { seedTechnologyCatalog } from "./seed-technology-catalog";

async function main() {
  console.log("Seeding BobKat StackScore...");

  if (process.env.SEED_FULL_RESET === "true") {
    console.log("Full reset (SEED_FULL_RESET=true): removing all clients and assessment data...");
    await clearAllClientData(prisma);
  } else if (process.env.SEED_RESET_ASSESSMENTS === "true") {
    console.log("Resetting assessment data (SEED_RESET_ASSESSMENTS=true)...");
    await clearAssessmentData(prisma);
  }

  const categoryIdByCode = new Map<string, string>();

  for (const category of CATEGORIES) {
    const v2Meta = V2_CATEGORY_METADATA[category.code];
    const record = await prisma.assessmentCategory.upsert({
      where: { code: category.code },
      update: {
        name: category.name,
        description: category.description,
        maxPoints: category.maxPoints,
        displayOrder: category.displayOrder,
        v2CategoryCode: v2Meta?.v2CategoryCode,
        v2DisplayName: v2Meta?.v2DisplayName,
        isActive: true,
      },
      create: {
        code: category.code,
        name: category.name,
        description: category.description,
        maxPoints: category.maxPoints,
        displayOrder: category.displayOrder,
        v2CategoryCode: v2Meta?.v2CategoryCode,
        v2DisplayName: v2Meta?.v2DisplayName,
      },
    });
    categoryIdByCode.set(category.code, record.id);
  }

  const templateIdByCode = new Map<string, string>();

  for (const template of catalog.templates) {
    const categoryCode = getCategoryCodeForQuestion(template.questionId);
    const categoryId = categoryIdByCode.get(categoryCode);
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
        consolidationGroupId: template.consolidationGroupId ?? null,
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
        consolidationGroupId: template.consolidationGroupId ?? null,
        categoryId,
      },
    });
    templateIdByCode.set(template.id, record.id);
  }

  for (const [categoryCode, questions] of Object.entries(QUESTIONS_BY_CATEGORY)) {
    const categoryId = categoryIdByCode.get(categoryCode);
    if (!categoryId) continue;

    for (const question of questions) {
      const metadata = QUESTION_METADATA_BY_CODE.get(question.code);
      const helpText = metadata
        ? `${metadata.purpose} Evidence: ${metadata.evidenceRequired}`
        : null;

      const questionRecord = await prisma.assessmentQuestion.upsert({
        where: { code: question.code },
        update: {
          questionText: question.questionText,
          helpText,
          v2QuestionId: metadata?.v2QuestionId,
          purpose: metadata?.purpose,
          capability: metadata?.capability,
          responseType: metadata?.responseType ?? "ternary",
          evidenceRequired: metadata?.evidenceRequired,
          relatedService: metadata?.relatedService,
          relatedPlaybook: metadata?.relatedPlaybook,
          relatedTechnologies: metadata?.relatedTechnologies ?? [],
          adminNotes: metadata?.adminNotes,
          weight: question.weight,
          displayOrder: question.displayOrder,
          riskLevel: question.riskLevel,
          isActive: true,
          categoryId,
        },
        create: {
          code: question.code,
          questionText: question.questionText,
          helpText,
          v2QuestionId: metadata?.v2QuestionId,
          purpose: metadata?.purpose,
          capability: metadata?.capability,
          responseType: metadata?.responseType ?? "ternary",
          evidenceRequired: metadata?.evidenceRequired,
          relatedService: metadata?.relatedService,
          relatedPlaybook: metadata?.relatedPlaybook,
          relatedTechnologies: metadata?.relatedTechnologies ?? [],
          adminNotes: metadata?.adminNotes,
          weight: question.weight,
          displayOrder: question.displayOrder,
          riskLevel: question.riskLevel,
          categoryId,
        },
      });

      await syncAnswerOptions(questionRecord.id, question.answers, templateIdByCode);
    }
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

/** Stable staff user ids — survive database reseeds when email is unchanged. */
const SEED_ADMIN_USER_ID = "b0000001-0000-4000-8000-000000000001";
const SEED_TECHNICIAN_USER_ID = "b0000001-0000-4000-8000-000000000002";

  await prisma.user.upsert({
    where: { email: "admin@bobkatit.com" },
    update: {
      name: "BobKat Admin",
      passwordHash,
      role: "admin",
      isActive: true,
    },
    create: {
      id: SEED_ADMIN_USER_ID,
      name: "BobKat Admin",
      email: "admin@bobkatit.com",
      passwordHash,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "technician@bobkatit.com" },
    update: {
      name: "BobKat Technician",
      passwordHash,
      role: "technician",
      isActive: true,
    },
    create: {
      id: SEED_TECHNICIAN_USER_ID,
      name: "BobKat Technician",
      email: "technician@bobkatit.com",
      passwordHash,
      role: "technician",
    },
  });

  await deactivateV1Library(prisma);
  await seedV2Library(prisma);
  const backfillResult = await backfillV2QuestionMetadata(prisma);
  console.log(
    `V2 metadata backfill: ${backfillResult.updated} updated, ${backfillResult.skipped} already complete (${backfillResult.scanned} scanned).`,
  );
  await backfillTechnologyProfiles();

  await seedTechnologyCatalog(prisma);

  console.log("Seed complete.");
  console.log("Admin: admin@bobkatit.com");
  console.log("Technician: technician@bobkatit.com");
  console.log(`Password: ${adminPassword}`);
}

function getCategoryCodeForQuestion(questionId: string): string {
  const code = questionId.replace("Q", "");
  const num = parseInt(code, 10);
  if (num <= 10) return "security";
  if (num <= 18) return "backup";
  if (num <= 25) return "infrastructure";
  if (num <= 32) return "endpoint";
  if (num <= 39) return "documentation";
  if (num <= 45) return "bcdr";
  return "strategic";
}

/** Update answer options in place — never delete options referenced by assessments. */
async function syncAnswerOptions(
  questionId: string,
  answers: SeedAnswer[],
  templateIdByCode: Map<string, string>,
) {
  const existing = await prisma.answerOption.findMany({
    where: { questionId },
    include: { _count: { select: { responses: true } } },
  });

  const existingByOrder = new Map(existing.map((option) => [option.displayOrder, option]));
  const seedOrders = new Set<number>();

  for (const [index, answer] of answers.entries()) {
    const displayOrder = index + 1;
    seedOrders.add(displayOrder);

    const templateId = answer.templateCode
      ? templateIdByCode.get(answer.templateCode)
      : undefined;

    const data = {
      answerText: answer.text,
      scoreValue: answer.scoreValue,
      displayOrder,
      triggersCriticalFlag: answer.triggersCriticalFlag ?? false,
      triggersRecommendation: answer.triggersRecommendation ?? false,
      recommendationTemplateId: templateId ?? null,
    };

    const match = existingByOrder.get(displayOrder);
    if (match) {
      await prisma.answerOption.update({ where: { id: match.id }, data });
    } else {
      await prisma.answerOption.create({ data: { questionId, ...data } });
    }
  }

  for (const option of existing) {
    if (seedOrders.has(option.displayOrder)) continue;
    if (option._count.responses > 0) continue;
    await prisma.answerOption.delete({ where: { id: option.id } });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
