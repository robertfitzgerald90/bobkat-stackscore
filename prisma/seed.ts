import "dotenv/config";
import bcrypt from "bcryptjs";
import catalog from "../data/RecommendationRuleCatalog.json";
import { prisma } from "../src/lib/db";
import { CATEGORIES, QUESTIONS_BY_CATEGORY } from "./seed-data";
import { Priority } from "../src/generated/prisma/client";

async function main() {
  console.log("Seeding BobKat StackScore...");

  const categoryIdByCode = new Map<string, string>();

  for (const category of CATEGORIES) {
    const record = await prisma.assessmentCategory.upsert({
      where: { code: category.code },
      update: {
        name: category.name,
        description: category.description,
        maxPoints: category.maxPoints,
        displayOrder: category.displayOrder,
        isActive: true,
      },
      create: {
        code: category.code,
        name: category.name,
        description: category.description,
        maxPoints: category.maxPoints,
        displayOrder: category.displayOrder,
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
      const questionRecord = await prisma.assessmentQuestion.upsert({
        where: { code: question.code },
        update: {
          questionText: question.questionText,
          weight: question.weight,
          displayOrder: question.displayOrder,
          riskLevel: question.riskLevel,
          isActive: true,
          categoryId,
        },
        create: {
          code: question.code,
          questionText: question.questionText,
          weight: question.weight,
          displayOrder: question.displayOrder,
          riskLevel: question.riskLevel,
          categoryId,
        },
      });

      await prisma.answerOption.deleteMany({ where: { questionId: questionRecord.id } });

      for (const [index, answer] of question.answers.entries()) {
        const templateId = answer.templateCode
          ? templateIdByCode.get(answer.templateCode)
          : undefined;

        await prisma.answerOption.create({
          data: {
            questionId: questionRecord.id,
            answerText: answer.text,
            scoreValue: answer.scoreValue,
            displayOrder: index + 1,
            triggersCriticalFlag: answer.triggersCriticalFlag ?? false,
            triggersRecommendation: answer.triggersRecommendation ?? false,
            recommendationTemplateId: templateId,
          },
        });
      }
    }
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: "admin@bobkatit.com" },
    update: {
      name: "BobKat Admin",
      passwordHash,
      role: "admin",
      isActive: true,
    },
    create: {
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
      name: "BobKat Technician",
      email: "technician@bobkatit.com",
      passwordHash,
      role: "technician",
    },
  });

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

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
