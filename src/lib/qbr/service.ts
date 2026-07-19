import type { Prisma, UserRole } from "@/generated/prisma/client";
import { formatPrimaryBusinessGoal } from "@/lib/business-profile/labels";
import { prisma } from "@/lib/db";
import {
  defaultQbrTitle,
  formatReviewPeriodLabel,
  getQuarterBounds,
  isWithinReviewPeriod,
} from "@/lib/qbr/periods";
import { buildQbrReportData } from "@/lib/qbr/report-data";
import type { QbrReportData, QbrSummary } from "@/lib/qbr/types";
import { MATURITY_TIER_LABELS } from "@/lib/scoring/maturity";
import {
  computeTipDerivedState,
  parseWizardState,
  syncWizardStateAfterSelectionChange,
  type RecommendationSeed,
} from "@/lib/technology-improvement-plan/selection";
import { ensureTechnologyProfile, getTechnologyProfile } from "@/lib/technology-profile";
import { getClientJourneyTimeline } from "@/lib/technology-profile/timeline-build";

type QbrRecord = Prisma.QuarterlyBusinessReviewGetPayload<{
  include: {
    document: { select: { id: true } };
    client: { select: { companyName: true } };
  };
}>;

function toSummary(record: QbrRecord): QbrSummary {
  return {
    id: record.id,
    clientId: record.clientId,
    title: record.title,
    status: record.status,
    reviewPeriodStart: record.reviewPeriodStart.toISOString(),
    reviewPeriodEnd: record.reviewPeriodEnd.toISOString(),
    reviewPeriodLabel: formatReviewPeriodLabel(record.reviewPeriodStart, record.reviewPeriodEnd),
    generatedAt: record.generatedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    documentId: record.document?.id ?? null,
  };
}

function toRecommendationSeeds(
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    businessImpact: string;
    priority: RecommendationSeed["priority"];
    suggestedService: string | null;
    estimatedImpactPoints: number;
    category: { name: string };
  }>,
): RecommendationSeed[] {
  return recommendations.map((recommendation) => ({
    id: recommendation.id,
    title: recommendation.title,
    description: recommendation.description,
    businessImpact: recommendation.businessImpact,
    priority: recommendation.priority,
    suggestedService: recommendation.suggestedService,
    estimatedImpactPoints: recommendation.estimatedImpactPoints,
    categoryName: recommendation.category.name,
  }));
}

async function loadRoadmapPhases(clientId: string, currentScore: number | null) {
  const [openRecommendations, activeTip] = await Promise.all([
    prisma.assessmentRecommendation.findMany({
      where: {
        clientId,
        status: { in: ["open", "accepted", "in_progress"] },
      },
      orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
      include: { category: { select: { name: true } } },
    }),
    prisma.technologyImprovementPlan.findFirst({
      where: {
        clientId,
        OR: [{ status: "generated" }, { status: "draft" }],
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      select: { wizardState: true },
    }),
  ]);

  if (!activeTip) {
    return [];
  }

  const wizardState = parseWizardState(activeTip.wizardState);
  const seeds = toRecommendationSeeds(openRecommendations);
  const syncedState = syncWizardStateAfterSelectionChange(seeds, wizardState);
  const derived = computeTipDerivedState(seeds, syncedState, currentScore ?? 0);
  return derived.roadmapPhases;
}

function decimalToNumber(value: { toNumber?: () => number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

async function loadLivingRoadmapForQbr(clientId: string) {
  const roadmap = await prisma.clientRoadmap.findFirst({
    where: { clientId, status: { in: ["active", "draft"] } },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      phases: {
        orderBy: { sortOrder: "asc" },
        include: {
          initiatives: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!roadmap) {
    return {
      livingRoadmapPhases: [],
      budgetForecast: null as null | {
        completedInvestment: number;
        plannedInvestment: number;
        deferredInvestment: number;
        monthlyServices: number;
        estimatedThreeYearInvestment: number;
      },
    };
  }

  const { computeLifecycleBudget } = await import("@/lib/technology-lifecycle/budget");
  const phaseInputs = roadmap.phases.map((phase) => ({
    status: phase.status,
    oneTimeInvestment: decimalToNumber(phase.oneTimeInvestment),
    monthlyRecurringInvestment: decimalToNumber(phase.monthlyRecurringInvestment),
    annualRecurringInvestment: decimalToNumber(phase.annualRecurringInvestment),
  }));
  const budget = computeLifecycleBudget(phaseInputs, [], 0);

  return {
    livingRoadmapPhases: roadmap.phases.map((phase) => ({
      phaseName: `${phase.subtitle} — ${phase.name}`,
      timeframe: phase.timeline,
      initiativeCount: phase.initiatives.length,
      summary:
        phase.initiatives
          .slice(0, 3)
          .map((item) => item.title)
          .join("; ") || phase.executiveSummary,
      status: phase.status,
      oneTimeInvestment: decimalToNumber(phase.oneTimeInvestment),
      monthlyRecurringInvestment: decimalToNumber(phase.monthlyRecurringInvestment),
    })),
    budgetForecast: {
      completedInvestment: budget.completedInvestment,
      plannedInvestment: budget.plannedInvestment,
      deferredInvestment: budget.deferredInvestment,
      monthlyServices: budget.monthlyServices,
      estimatedThreeYearInvestment: budget.estimatedThreeYearInvestment,
    },
  };
}

async function assembleQbrReportData(record: QbrRecord): Promise<QbrReportData> {
  await ensureTechnologyProfile(record.clientId);

  const [
    profileView,
    scoreHistory,
    completedProjects,
    resolvedRecommendations,
    openRecommendations,
    assessmentsCompletedInPeriod,
    journeyEvents,
    client,
  ] = await Promise.all([
    getTechnologyProfile(record.clientId),
    prisma.clientScoreHistory.findMany({
      where: { clientId: record.clientId },
      orderBy: { recordedDate: "asc" },
    }),
    prisma.project.findMany({
      where: { clientId: record.clientId, status: "completed" },
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        completedAt: true,
        actualImpactPoints: true,
        estimatedImpactPoints: true,
      },
    }),
    prisma.assessmentRecommendation.findMany({
      where: { clientId: record.clientId, status: "completed" },
      orderBy: { completedAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.assessmentRecommendation.findMany({
      where: {
        clientId: record.clientId,
        status: { in: ["open", "accepted", "in_progress"] },
      },
      orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }],
      include: { category: { select: { name: true } } },
    }),
    prisma.assessment.count({
      where: {
        clientId: record.clientId,
        status: "completed",
        completedAt: {
          gte: record.reviewPeriodStart,
          lte: record.reviewPeriodEnd,
        },
      },
    }),
    getClientJourneyTimeline(record.clientId),
    prisma.client.findUnique({
      where: { id: record.clientId },
      select: {
        primaryBusinessGoal: true,
        technologyVision: true,
      },
    }),
  ]);

  const currentStackScore = profileView?.overallStackScore ?? null;
  const [roadmapPhases, livingRoadmap] = await Promise.all([
    loadRoadmapPhases(record.clientId, currentStackScore),
    loadLivingRoadmapForQbr(record.clientId),
  ]);

  return buildQbrReportData({
    qbr: {
      id: record.id,
      clientId: record.clientId,
      title: record.title,
      reviewPeriodStart: record.reviewPeriodStart,
      reviewPeriodEnd: record.reviewPeriodEnd,
      generatedAt: record.generatedAt,
      executiveSummary: record.executiveSummary,
    },
    clientName: record.client.companyName,
    currentStackScore,
    currentMaturityLabel: profileView?.maturityTier
      ? MATURITY_TIER_LABELS[profileView.maturityTier]
      : null,
    scoreHistory,
    journeyEvents,
    completedProjects,
    resolvedRecommendations: resolvedRecommendations.map((recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
      priority: recommendation.priority,
      status: recommendation.status,
      categoryName: recommendation.category.name,
      businessImpact: recommendation.businessImpact,
      completedAt: recommendation.completedAt,
      updatedAt: recommendation.updatedAt,
    })),
    openRecommendations: openRecommendations.map((recommendation) => ({
      id: recommendation.id,
      title: recommendation.title,
      priority: recommendation.priority,
      status: recommendation.status,
      categoryName: recommendation.category.name,
      businessImpact: recommendation.businessImpact,
    })),
    assessmentsCompletedInPeriod,
    roadmapPhases,
    livingRoadmapPhases: livingRoadmap.livingRoadmapPhases,
    budgetForecast: livingRoadmap.budgetForecast,
    businessGoalLabel: client?.primaryBusinessGoal
      ? formatPrimaryBusinessGoal(client.primaryBusinessGoal)
      : null,
    technologyVision: client?.technologyVision ?? null,
  });
}

async function createScheduledReviewSnapshot(clientId: string) {
  const profile = await prisma.technologyProfile.findUnique({
    where: { clientId },
  });
  if (!profile || profile.overallStackScore === null || !profile.maturityTier) {
    return null;
  }

  return prisma.technologyProfileSnapshot.create({
    data: {
      clientId,
      technologyProfileId: profile.id,
      triggerType: "scheduled_review",
      snapshotAt: new Date(),
      overallStackScore: profile.overallStackScore,
      maturityTier: profile.maturityTier,
      categoryScores: profile.categoryScores ?? [],
      riskSummary: profile.riskSummary ?? {},
      metadata: {
        source: "quarterly_business_review",
      },
    },
  });
}

export type QbrDetail = QbrSummary & {
  report: QbrReportData;
  isEditable: boolean;
};

export async function listQuarterlyBusinessReviews(clientId: string): Promise<QbrSummary[]> {
  const records = await prisma.quarterlyBusinessReview.findMany({
    where: { clientId },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
    },
    orderBy: { reviewPeriodStart: "desc" },
  });

  return records.map(toSummary);
}

export async function getQuarterlyBusinessReview(
  clientId: string,
  qbrId: string,
  role: UserRole,
): Promise<QbrDetail | null> {
  const record = await prisma.quarterlyBusinessReview.findFirst({
    where: { id: qbrId, clientId },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
    },
  });

  if (!record) return null;
  if (role === "client" && record.status !== "generated") {
    return null;
  }

  const report = await assembleQbrReportData(record);
  return {
    ...toSummary(record),
    report,
    isEditable: record.status === "draft" && role !== "client",
  };
}

export async function createQuarterlyBusinessReview(
  clientId: string,
  userId: string,
  reviewDate: Date = new Date(),
): Promise<QbrDetail> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { companyName: true },
  });
  if (!client) throw new Error("Client not found");

  const period = getQuarterBounds(reviewDate);
  const existing = await prisma.quarterlyBusinessReview.findFirst({
    where: {
      clientId,
      reviewPeriodStart: period.start,
      reviewPeriodEnd: period.end,
    },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
    },
  });

  if (existing) {
    const report = await assembleQbrReportData(existing);
    return {
      ...toSummary(existing),
      report,
      isEditable: existing.status === "draft",
    };
  }

  const record = await prisma.quarterlyBusinessReview.create({
    data: {
      clientId,
      reviewPeriodStart: period.start,
      reviewPeriodEnd: period.end,
      title: defaultQbrTitle(client.companyName, period),
      createdByUserId: userId,
    },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
    },
  });

  const report = await assembleQbrReportData(record);
  return {
    ...toSummary(record),
    report,
    isEditable: true,
  };
}

export async function updateQuarterlyBusinessReview(
  clientId: string,
  qbrId: string,
  payload: { executiveSummary?: string | null },
): Promise<QbrDetail | null> {
  const existing = await prisma.quarterlyBusinessReview.findFirst({
    where: { id: qbrId, clientId },
  });
  if (!existing) return null;
  if (existing.status !== "draft") {
    throw new Error("Generated reviews cannot be edited");
  }

  const record = await prisma.quarterlyBusinessReview.update({
    where: { id: qbrId },
    data: {
      executiveSummary:
        payload.executiveSummary !== undefined
          ? payload.executiveSummary
          : existing.executiveSummary,
    },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
    },
  });

  const report = await assembleQbrReportData(record);
  return {
    ...toSummary(record),
    report,
    isEditable: true,
  };
}

export async function generateQuarterlyBusinessReview(
  clientId: string,
  qbrId: string,
  userId: string,
  role: UserRole,
): Promise<QbrDetail | null> {
  const existing = await prisma.quarterlyBusinessReview.findFirst({
    where: { id: qbrId, clientId },
    include: {
      document: { select: { id: true } },
      client: { select: { companyName: true } },
    },
  });
  if (!existing) return null;
  if (existing.status === "generated") {
    return getQuarterlyBusinessReview(clientId, qbrId, role);
  }

  const report = await assembleQbrReportData(existing);
  const executiveSummary = existing.executiveSummary ?? report.executiveSummary;
  const fileUrl = `/clients/${clientId}/quarterly-review/${qbrId}`;

  const record = await prisma.$transaction(async (tx) => {
    const updated = await tx.quarterlyBusinessReview.update({
      where: { id: qbrId },
      data: {
        status: "generated",
        generatedAt: new Date(),
        executiveSummary,
        snapshotJson: report as unknown as Prisma.InputJsonValue,
        budgetForecastJson: (report.budgetForecast ?? {}) as Prisma.InputJsonValue,
        technologyRisksJson: report.technologyRisks as unknown as Prisma.InputJsonValue,
        strategicRecommendationsJson:
          report.strategicRecommendations as unknown as Prisma.InputJsonValue,
      },
    });

    const existingDoc = await tx.document.findFirst({ where: { qbrId } });
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
          qbrId: updated.id,
          documentType: "quarterly_business_review",
          title: updated.title,
          fileUrl,
          uploadedByUserId: userId,
        },
      });
    }

    return tx.quarterlyBusinessReview.findFirstOrThrow({
      where: { id: qbrId },
      include: {
        document: { select: { id: true } },
        client: { select: { companyName: true } },
      },
    });
  });

  await createScheduledReviewSnapshot(clientId);

  const generatedReport = await assembleQbrReportData(record);
  return {
    ...toSummary(record),
    report: {
      ...generatedReport,
      executiveSummary,
    },
    isEditable: false,
  };
}

export function findReviewPeriodForDate(date: Date) {
  return getQuarterBounds(date);
}

export { isWithinReviewPeriod };
