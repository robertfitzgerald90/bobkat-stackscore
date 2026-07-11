import type { PrismaClient } from "@/generated/prisma/client";
import { ACME_DEMO, resolveDemoClientEmail } from "./constants";

/** Removes only Acme Foundation demo records — safe for repeated reset. */
export async function clearAcmeFoundationDemo(prisma: PrismaClient): Promise<void> {
  const demoEmail = resolveDemoClientEmail().toLowerCase();

  const client = await prisma.client.findFirst({
    where: {
      OR: [{ id: ACME_DEMO.clientId }, { primaryContactEmail: demoEmail }],
    },
    select: { id: true },
  });

  if (!client) return;

  const clientId = client.id;
  const assessmentIds = (
    await prisma.assessment.findMany({
      where: { clientId },
      select: { id: true },
    })
  ).map((row) => row.id);

  const recommendationIds = (
    await prisma.assessmentRecommendation.findMany({
      where: { clientId },
      select: { id: true },
    })
  ).map((row) => row.id);

  const projectIds = (
    await prisma.project.findMany({
      where: { clientId },
      select: { id: true },
    })
  ).map((row) => row.id);

  const messageIds = (
    await prisma.communicationMessage.findMany({
      where: { clientId },
      select: { id: true },
    })
  ).map((row) => row.id);

  await prisma.communicationEvent.deleteMany({
    where: { communicationMessageId: { in: messageIds } },
  });

  await prisma.recommendationAssessmentTrigger.deleteMany({
    where: {
      OR: [
        { assessmentId: { in: assessmentIds } },
        { recommendationId: { in: recommendationIds } },
      ],
    },
  });

  await prisma.note.deleteMany({
    where: {
      OR: [
        { clientId },
        { assessmentId: { in: assessmentIds } },
        { projectId: { in: projectIds } },
      ],
    },
  });

  await prisma.document.deleteMany({
    where: {
      OR: [
        { clientId },
        { assessmentId: { in: assessmentIds } },
        { projectId: { in: projectIds } },
      ],
    },
  });

  await prisma.communicationMessage.deleteMany({ where: { clientId } });
  await prisma.organizationActivityEvent.deleteMany({ where: { clientId } });
  await prisma.campaignRecipient.deleteMany({ where: { clientId } });
  await prisma.project.deleteMany({ where: { clientId } });
  await prisma.assessmentRecommendation.deleteMany({ where: { clientId } });
  await prisma.technologyImprovementPlan.deleteMany({ where: { clientId } });
  await prisma.quarterlyBusinessReview.deleteMany({ where: { clientId } });
  await prisma.assessmentResponse.deleteMany({
    where: { assessmentId: { in: assessmentIds } },
  });
  await prisma.assessmentCategoryScore.deleteMany({
    where: { assessmentId: { in: assessmentIds } },
  });
  await prisma.clientScoreHistory.deleteMany({ where: { clientId } });
  await prisma.technologyProfileSnapshot.deleteMany({ where: { clientId } });
  await prisma.assessment.deleteMany({ where: { clientId } });
  await prisma.clientTechnology.deleteMany({ where: { clientId } });
  await prisma.assessmentPurchase.deleteMany({ where: { clientId } });
  await prisma.prospect.deleteMany({ where: { clientId } });

  await prisma.user.deleteMany({
    where: {
      OR: [{ id: ACME_DEMO.clientUserId }, { clientId }],
    },
  });

  await prisma.technologyProfile.deleteMany({ where: { clientId } });
  await prisma.client.delete({ where: { id: clientId } });
}
