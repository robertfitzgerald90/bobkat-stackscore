import type { Prisma } from "@/generated/prisma/client";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getTechnologyProfileDetail } from "@/lib/technology-profile/detail";
import { mergeWizardState, createDefaultWizardState } from "@/lib/technology-improvement-plan/defaults";
import { computeInvestmentView } from "@/lib/technology-improvement-plan/pricing";
import {
  computeTipDerivedState,
  parseWizardState,
  syncWizardStateAfterSelectionChange,
  type RecommendationSeed,
} from "@/lib/technology-improvement-plan/selection";
import type {
  TipPlanDetail,
  TipPlanSummary,
  TipUpdatePayload,
  TipWizardState,
} from "@/lib/technology-improvement-plan/types";

type TipRecord = Prisma.TechnologyImprovementPlanGetPayload<{
  include: {
    document: { select: { id: true } };
    client: { select: { companyName: true } };
    assessment: { select: { assessmentName: true; overallScore: true } };
  };
}>;

function toSummary(record: TipRecord): TipPlanSummary {
  return {
    id: record.id,
    clientId: record.clientId,
    assessmentId: record.assessmentId,
    status: record.status,
    currentStep: record.currentStep,
    version: record.version,
    title: record.title,
    generatedAt: record.generatedAt?.toISOString() ?? null,
    documentId: record.document?.id ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function loadAssessmentRecommendations(clientId: string, assessmentId: string | null) {
  return prisma.assessmentRecommendation.findMany({
    where: {
      clientId,
      ...(assessmentId ? { assessmentId } : {}),
      status: { in: ["open", "accepted", "in_progress"] },
    },
    include: { category: { select: { name: true } } },
    orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
  });
}

function toRecommendationSeeds(
  recommendations: Awaited<ReturnType<typeof loadAssessmentRecommendations>>,
): RecommendationSeed[] {
  return recommendations.map((rec) => ({
    id: rec.id,
    title: rec.title,
    description: rec.description,
    businessImpact: rec.businessImpact,
    priority: rec.priority,
    suggestedService: rec.suggestedService,
    estimatedImpactPoints: rec.estimatedImpactPoints,
    categoryName: rec.category.name,
  }));
}

function buildInvestmentForRole(
  investmentInternal: ReturnType<typeof computeInvestmentView>,
  isAdmin: boolean,
) {
  if (isAdmin) return investmentInternal;
  return {
    labor: 0,
    hardware: 0,
    services: 0,
    subtotal: 0,
    marginPercent: 0,
    marginAmount: 0,
    clientTotal: investmentInternal.clientTotal,
  };
}

export async function assembleTipPlanDetail(
  record: TipRecord,
  role: UserRole,
): Promise<TipPlanDetail> {
  const wizardState = parseWizardState(record.wizardState);
  const isAdmin = role === "admin";
  const isEditable = record.status === "draft";

  const [profile, recommendations] = await Promise.all([
    getTechnologyProfileDetail(record.clientId, role),
    loadAssessmentRecommendations(record.clientId, record.assessmentId),
  ]);

  const seeds = toRecommendationSeeds(recommendations);
  const syncedState = syncWizardStateAfterSelectionChange(seeds, wizardState);
  const currentScore =
    profile?.profile.overallStackScore ??
    (record.assessment?.overallScore ? Math.round(Number(record.assessment.overallScore)) : 0);

  const derived = computeTipDerivedState(seeds, syncedState, currentScore);
  const investment = buildInvestmentForRole(derived.investmentInternal, isAdmin);

  return {
    ...toSummary(record),
    wizardState: syncedState,
    executiveSummary: record.executiveSummary,
    isEditable,
    isAdmin,
    profile,
    recommendations: derived.recommendations,
    excludedRecommendations: derived.excludedRecommendations,
    deferredRecommendations: derived.deferredRecommendations,
    selectionSummary: derived.selectionSummary,
    playbooks: derived.playbooks,
    investment,
    investmentInternal: isAdmin ? derived.investmentInternal : investment,
    roadmapPhases: derived.roadmapPhases,
    currentScore,
    projectedScore: derived.projectedScore,
    assessmentName: record.assessment?.assessmentName ?? null,
    clientName: record.client.companyName,
  };
}

export async function listTipPlans(clientId: string): Promise<TipPlanSummary[]> {
  const records = await prisma.technologyImprovementPlan.findMany({
    where: { clientId },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
      assessment: { select: { assessmentName: true, overallScore: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return records.map(toSummary);
}

export async function getTipPlan(
  clientId: string,
  tipId: string,
  role: UserRole,
): Promise<TipPlanDetail | null> {
  const record = await prisma.technologyImprovementPlan.findFirst({
    where: { id: tipId, clientId },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
      assessment: { select: { assessmentName: true, overallScore: true } },
    },
  });

  if (!record) return null;
  return assembleTipPlanDetail(record, role);
}

export async function createTipPlan(
  clientId: string,
  userId: string,
  role: UserRole,
  assessmentId?: string,
): Promise<TipPlanDetail> {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  let resolvedAssessmentId = assessmentId ?? null;
  if (!resolvedAssessmentId) {
    const latest = await prisma.assessment.findFirst({
      where: { clientId, status: "completed" },
      orderBy: { completedAt: "desc" },
    });
    resolvedAssessmentId = latest?.id ?? null;
  }

  if (resolvedAssessmentId) {
    const assessment = await prisma.assessment.findFirst({
      where: { id: resolvedAssessmentId, clientId, status: "completed" },
    });
    if (!assessment) throw new Error("Completed assessment not found");
  }

  const recommendations = await loadAssessmentRecommendations(clientId, resolvedAssessmentId);
  const wizardState = syncWizardStateAfterSelectionChange(
    toRecommendationSeeds(recommendations),
    createDefaultWizardState(
      recommendations.map((rec) => ({
        id: rec.id,
        priority: rec.priority,
        estimatedImpactPoints: rec.estimatedImpactPoints,
        suggestedService: rec.suggestedService,
      })),
    ),
  );

  const title = `Technology Improvement Plan — ${client.companyName}`;

  const record = await prisma.technologyImprovementPlan.create({
    data: {
      clientId,
      assessmentId: resolvedAssessmentId,
      title,
      wizardState: wizardState as unknown as Prisma.InputJsonValue,
      createdByUserId: userId,
    },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
      assessment: { select: { assessmentName: true, overallScore: true } },
    },
  });

  return assembleTipPlanDetail(record, role);
}

export async function updateTipPlan(
  clientId: string,
  tipId: string,
  role: UserRole,
  payload: TipUpdatePayload,
): Promise<TipPlanDetail | null> {
  const existing = await prisma.technologyImprovementPlan.findFirst({
    where: { id: tipId, clientId },
  });
  if (!existing) return null;
  if (existing.status !== "draft") {
    throw new Error("Generated plans cannot be edited");
  }

  const currentState = parseWizardState(existing.wizardState);
  const mergedState = payload.wizardState
    ? mergeWizardState(currentState, payload.wizardState)
    : currentState;

  const recommendations = await loadAssessmentRecommendations(
    clientId,
    existing.assessmentId,
  );
  const seeds = toRecommendationSeeds(recommendations);
  const nextState = syncWizardStateAfterSelectionChange(seeds, mergedState);

  const record = await prisma.technologyImprovementPlan.update({
    where: { id: tipId },
    data: {
      currentStep: payload.currentStep ?? existing.currentStep,
      title: payload.title ?? existing.title,
      executiveSummary:
        payload.executiveSummary !== undefined
          ? payload.executiveSummary
          : existing.executiveSummary,
      wizardState: nextState as unknown as Prisma.InputJsonValue,
    },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
      assessment: { select: { assessmentName: true, overallScore: true } },
    },
  });

  return assembleTipPlanDetail(record, role);
}

export async function generateTipPlan(
  clientId: string,
  tipId: string,
  userId: string,
  role: UserRole,
): Promise<TipPlanDetail | null> {
  const existing = await prisma.technologyImprovementPlan.findFirst({
    where: { id: tipId, clientId },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
      assessment: { select: { assessmentName: true, overallScore: true } },
    },
  });
  if (!existing) return null;
  if (existing.status === "generated") {
    return assembleTipPlanDetail(existing, role);
  }

  const recommendations = await loadAssessmentRecommendations(
    clientId,
    existing.assessmentId,
  );
  const seeds = toRecommendationSeeds(recommendations);
  const syncedState = syncWizardStateAfterSelectionChange(
    seeds,
    parseWizardState(existing.wizardState),
  );
  const frozenState: TipWizardState = {
    ...syncedState,
    frozenAt: new Date().toISOString(),
  };

  await prisma.technologyImprovementPlan.updateMany({
    where: {
      clientId,
      status: "generated",
      id: { not: tipId },
    },
    data: { status: "superseded" },
  });

  const fileUrl = `/api/v1/clients/${clientId}/tip/${tipId}/pdf`;

  const record = await prisma.$transaction(async (tx) => {
    const updated = await tx.technologyImprovementPlan.update({
      where: { id: tipId },
      data: {
        status: "generated",
        currentStep: "complete",
        generatedAt: new Date(),
        wizardState: frozenState as unknown as Prisma.InputJsonValue,
        executiveSummary:
          existing.executiveSummary ??
          frozenState.executiveSummary ??
          frozenState.globalExecutiveNotes ??
          null,
      },
    });

    const existingDoc = await tx.document.findFirst({ where: { tipId } });
    if (existingDoc) {
      await tx.document.update({
        where: { id: existingDoc.id },
        data: {
          title: updated.title,
          fileUrl,
          uploadedByUserId: userId,
        },
      });
    } else {
      await tx.document.create({
        data: {
          clientId,
          assessmentId: updated.assessmentId,
          tipId: updated.id,
          documentType: "technology_improvement_plan",
          title: `${updated.title} (v${updated.version})`,
          fileUrl,
          uploadedByUserId: userId,
        },
      });
    }

    return tx.technologyImprovementPlan.findFirstOrThrow({
      where: { id: tipId },
      include: {
        document: { select: { id: true } },
        client: { select: { companyName: true } },
        assessment: { select: { assessmentName: true, overallScore: true } },
      },
    });
  });

  return assembleTipPlanDetail(record, role);
}
