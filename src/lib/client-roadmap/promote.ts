import type { Prisma, RoadmapPhaseStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { buildTechnologyRoadmap } from "@/lib/technology-improvement-plan/roadmap-engine";
import { parseWizardState } from "@/lib/technology-improvement-plan/selection";
import type { TipRecommendationView } from "@/lib/technology-improvement-plan/types";

type Tx = Prisma.TransactionClient;

async function replacePhasesFromEngine(
  tx: Tx,
  roadmapId: string,
  engineRoadmap: ReturnType<typeof buildTechnologyRoadmap>,
  recommendations: TipRecommendationView[],
  preserveStatuses: Map<
    string,
    { status: RoadmapPhaseStatus; approvedAt: Date | null; approvedByUserId: string | null }
  >,
) {
  await tx.clientRoadmapPhase.deleteMany({ where: { roadmapId } });
  const recById = new Map(recommendations.map((rec) => [rec.id, rec]));

  for (const phase of engineRoadmap.phases) {
    const preserved = preserveStatuses.get(phase.id);
    await tx.clientRoadmapPhase.create({
      data: {
        roadmapId,
        phaseKey: phase.id,
        subtitle: phase.subtitle,
        name: phase.name,
        timeline: phase.timeline,
        sortOrder: phase.sortOrder,
        executiveSummary: phase.executiveSummary,
        status: preserved?.status ?? "planned",
        oneTimeInvestment: phase.oneTimeInvestment,
        monthlyRecurringInvestment: phase.monthlyRecurringInvestment,
        annualRecurringInvestment: phase.annualRecurringInvestment,
        expectedScoreImprovement: phase.stackScoreImprovement,
        projectedScoreAfterPhase: phase.projectedScore,
        approvedAt: preserved?.approvedAt ?? null,
        approvedByUserId: preserved?.approvedByUserId ?? null,
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
 * Promotes/refines a living roadmap from a generated TIP.
 * Supersedes any other active roadmap for the client.
 */
export async function promoteRoadmapFromTip(tipId: string) {
  const tip = await prisma.technologyImprovementPlan.findUnique({
    where: { id: tipId },
    include: {
      client: { select: { id: true, companyName: true } },
      assessment: { select: { id: true, overallScore: true, assessmentName: true } },
    },
  });

  if (!tip) throw new Error("TIP not found");
  if (!tip.assessmentId || !tip.assessment) {
    throw new Error("TIP must be linked to an assessment to promote a roadmap");
  }

  const assessmentId = tip.assessmentId;
  const wizardState = parseWizardState(tip.wizardState);
  const includedIds = new Set(
    wizardState.recommendationOrder.filter(
      (id) =>
        !wizardState.removedRecommendationIds.includes(id) &&
        !wizardState.deferredRecommendationIds.includes(id),
    ),
  );

  const recommendations = await prisma.assessmentRecommendation.findMany({
    where: {
      clientId: tip.clientId,
      id: { in: [...includedIds] },
    },
    include: { category: { select: { name: true } } },
  });

  const orderedViews: TipRecommendationView[] = wizardState.recommendationOrder
    .filter((id) => includedIds.has(id))
    .map((id, index) => {
      const rec = recommendations.find((item) => item.id === id);
      if (!rec) return null;
      return {
        id: rec.id,
        title: rec.title,
        description: rec.description,
        businessImpact: rec.businessImpact,
        priority: rec.priority,
        suggestedService: rec.suggestedService,
        estimatedImpactPoints: rec.estimatedImpactPoints,
        categoryName: rec.category.name,
        consultantNote: wizardState.consultantNotesByRecId[id] ?? "",
        executiveNote: wizardState.executiveNotesByRecId[id] ?? "",
        sortOrder: index,
      } satisfies TipRecommendationView;
    })
    .filter((rec): rec is TipRecommendationView => rec !== null);

  const baselineScore = tip.assessment.overallScore
    ? Math.round(Number(tip.assessment.overallScore))
    : 0;

  const engineRoadmap = buildTechnologyRoadmap({
    currentScore: baselineScore,
    recommendations: orderedViews,
    phaseAssignments: wizardState.roadmapPhases,
    investmentDraft: wizardState.investment,
  });

  const title = `Technology Roadmap — ${tip.client.companyName}`;

  return prisma.$transaction(async (tx) => {
    await tx.clientRoadmap.updateMany({
      where: {
        clientId: tip.clientId,
        status: "active",
        NOT: { assessmentId },
      },
      data: { status: "superseded" },
    });

    const existingForAssessment = await tx.clientRoadmap.findFirst({
      where: { assessmentId },
      include: { phases: true },
      orderBy: { updatedAt: "desc" },
    });

    const preserveStatuses = new Map(
      (existingForAssessment?.phases ?? []).map((phase) => [
        phase.phaseKey,
        {
          status: phase.status,
          approvedAt: phase.approvedAt,
          approvedByUserId: phase.approvedByUserId,
        },
      ]),
    );

    let roadmapId: string;

    if (existingForAssessment) {
      const updated = await tx.clientRoadmap.update({
        where: { id: existingForAssessment.id },
        data: {
          tipId,
          status: "active",
          title,
          baselineScore,
          projectedFinalScore: engineRoadmap.totals.projectedFinalStackScore,
          activatedAt: existingForAssessment.activatedAt ?? new Date(),
        },
      });
      roadmapId = updated.id;
    } else {
      const created = await tx.clientRoadmap.create({
        data: {
          clientId: tip.clientId,
          assessmentId,
          tipId,
          status: "active",
          title,
          baselineScore,
          projectedFinalScore: engineRoadmap.totals.projectedFinalStackScore,
          activatedAt: new Date(),
        },
      });
      roadmapId = created.id;
    }

    // Supersede other actives for same client (including older drafts promoted incorrectly)
    await tx.clientRoadmap.updateMany({
      where: {
        clientId: tip.clientId,
        status: "active",
        id: { not: roadmapId },
      },
      data: { status: "superseded" },
    });

    await replacePhasesFromEngine(
      tx,
      roadmapId,
      engineRoadmap,
      orderedViews,
      preserveStatuses,
    );

    return tx.clientRoadmap.findUniqueOrThrow({
      where: { id: roadmapId },
      include: { phases: { include: { initiatives: true }, orderBy: { sortOrder: "asc" } } },
    });
  });
}
