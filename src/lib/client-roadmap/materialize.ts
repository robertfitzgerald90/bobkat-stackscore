import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { createDefaultInvestment } from "@/lib/technology-improvement-plan/defaults";
import { createDefaultPhaseAssignments, buildTechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";

type Tx = Prisma.TransactionClient;

async function loadAssessmentContext(assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      client: { select: { id: true, companyName: true } },
      recommendations: {
        where: { status: { in: ["open", "accepted", "in_progress", "deferred"] } },
        include: { category: { select: { name: true } } },
        orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
      },
    },
  });

  if (!assessment) throw new Error("Assessment not found");
  if (assessment.status !== "completed") {
    throw new Error("Roadmap can only be materialized from a completed assessment");
  }

  return assessment;
}

function toRecommendationViews(
  recommendations: Awaited<ReturnType<typeof loadAssessmentContext>>["recommendations"],
): TipRecommendationView[] {
  return recommendations.map((rec, index) => ({
    id: rec.id,
    title: rec.title,
    description: rec.description,
    businessImpact: rec.businessImpact,
    priority: rec.priority,
    suggestedService: rec.suggestedService,
    estimatedImpactPoints: rec.estimatedImpactPoints,
    categoryName: rec.category.name,
    consultantNote: "",
    executiveNote: "",
    sortOrder: index,
  }));
}

async function replaceRoadmapPhases(
  tx: Tx,
  roadmapId: string,
  engineRoadmap: ReturnType<typeof buildTechnologyRoadmap>,
  recommendations: TipRecommendationView[],
) {
  await tx.clientRoadmapPhase.deleteMany({ where: { roadmapId } });

  const recById = new Map(recommendations.map((rec) => [rec.id, rec]));

  for (const phase of engineRoadmap.phases) {
    await tx.clientRoadmapPhase.create({
      data: {
        roadmapId,
        phaseKey: phase.id,
        subtitle: phase.subtitle,
        name: phase.name,
        timeline: phase.timeline,
        sortOrder: phase.sortOrder,
        executiveSummary: phase.executiveSummary,
        status: "planned",
        oneTimeInvestment: phase.oneTimeInvestment,
        monthlyRecurringInvestment: phase.monthlyRecurringInvestment,
        annualRecurringInvestment: phase.annualRecurringInvestment,
        expectedScoreImprovement: phase.stackScoreImprovement,
        projectedScoreAfterPhase: phase.projectedScore,
        initiatives: {
          create: phase.initiatives.map((initiative, index) => {
            const recommendation = recById.get(initiative.recommendationId);
            const outcome = phase.businessOutcomes.find(
              (item) => item.title === initiative.title,
            );
            return {
              recommendationId: initiative.recommendationId,
              sortOrder: initiative.sortOrder ?? index,
              title: initiative.title,
              estimatedImpactPoints: recommendation?.estimatedImpactPoints ?? 0,
              businessOutcomeTitle: outcome?.title ?? initiative.title,
              businessOutcomeDescription:
                outcome?.description ?? recommendation?.businessImpact ?? null,
            };
          }),
        },
      },
    });
  }
}

/**
 * Creates or refreshes a draft ClientRoadmap for a completed assessment.
 * Idempotent for the same assessmentId while status remains draft.
 */
export async function materializeDraftRoadmap(assessmentId: string) {
  const assessment = await loadAssessmentContext(assessmentId);
  const recommendations = toRecommendationViews(assessment.recommendations);
  const baselineScore = assessment.overallScore
    ? Math.round(Number(assessment.overallScore))
    : 0;

  const phaseAssignments = createDefaultPhaseAssignments(
    recommendations,
    recommendations.map((rec) => rec.id),
  );
  const investment = createDefaultInvestment(
    recommendations.map((rec) => ({
      id: rec.id,
      priority: rec.priority,
      estimatedImpactPoints: rec.estimatedImpactPoints,
      suggestedService: rec.suggestedService,
    })),
  );
  const engineRoadmap = buildTechnologyRoadmap({
    currentScore: baselineScore,
    recommendations,
    phaseAssignments,
    investmentDraft: investment,
  });

  const title = `Technology Roadmap — ${assessment.client.companyName}`;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.clientRoadmap.findFirst({
      where: {
        assessmentId,
        status: { in: ["draft", "active"] },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existing?.status === "active") {
      return existing;
    }

    if (existing?.status === "draft") {
      const updated = await tx.clientRoadmap.update({
        where: { id: existing.id },
        data: {
          title,
          baselineScore,
          projectedFinalScore: engineRoadmap.totals.projectedFinalStackScore,
        },
      });
      await replaceRoadmapPhases(tx, updated.id, engineRoadmap, recommendations);
      return updated;
    }

    const created = await tx.clientRoadmap.create({
      data: {
        clientId: assessment.clientId,
        assessmentId,
        status: "draft",
        title,
        baselineScore,
        projectedFinalScore: engineRoadmap.totals.projectedFinalStackScore,
      },
    });

    await replaceRoadmapPhases(tx, created.id, engineRoadmap, recommendations);
    return created;
  });
}
