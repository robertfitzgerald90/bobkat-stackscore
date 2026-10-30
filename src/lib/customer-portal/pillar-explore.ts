/**
 * SS-UX-005 / SS-UX-016 — Customer Explore / pillar detail service (authorized).
 * Assembles official scores, assessment findings, opportunities, roadmap, and projects.
 * Does not recalculate StackScore or mutate recommendations.
 */

import type { ProjectStatus, RecommendationStatus, UserRole } from "@/generated/prisma/client";
import { RECOMMENDATION_LIFECYCLE_LABELS } from "@/lib/client-roadmap/labels";
import { prisma } from "@/lib/db";
import {
  buildCustomerPillarDetail,
  buildCustomerPillarTiles,
  isTechnologyPillarCode,
  type CustomerExploreDto,
  type CustomerPillarDetailDto,
  type PillarResponseEvidence,
} from "@/lib/customer-portal/pillar-detail-dto";
import { computeProjectProgress } from "@/lib/projects/progress";
import { presentRecommendationsForRole } from "@/lib/recommendations/visibility";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";
import {
  TECHNOLOGY_PILLARS,
  type TechnologyPillarCode,
} from "@/lib/technology-maturity/pillars";
import { CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES } from "@/lib/customer-portal/opportunities-dto";

async function loadPillarResponses(
  assessmentId: string | null,
  pillarCode: TechnologyPillarCode,
): Promise<PillarResponseEvidence[]> {
  if (!assessmentId) return [];

  const responses = await prisma.assessmentResponse.findMany({
    where: {
      assessmentId,
      question: { category: { code: pillarCode } },
    },
    select: {
      scoreEarned: true,
      question: {
        select: {
          code: true,
          questionText: true,
          answerOptions: { select: { id: true, scoreValue: true } },
        },
      },
      selectedAnswerOption: {
        select: {
          answerText: true,
          scoreValue: true,
          triggersCriticalFlag: true,
        },
      },
    },
  });

  return responses.map((row) => {
    const maxScore = Math.max(
      0,
      ...row.question.answerOptions.map((opt) => opt.scoreValue ?? 0),
    );
    return {
      questionText: row.question.questionText,
      answerText: row.selectedAnswerOption.answerText,
      scoreEarned: row.scoreEarned ?? row.selectedAnswerOption.scoreValue ?? 0,
      maxScore: maxScore || 1,
      isCritical: Boolean(row.selectedAnswerOption.triggersCriticalFlag),
      questionCode: row.question.code,
    };
  });
}

type PillarRecommendationBundle = {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  suggestedService: string | null;
  priority: "critical" | "high" | "medium" | "low";
  status: RecommendationStatus;
  estimatedImpactPoints: number;
  templateCode: string | null;
  project: { id: string; title: string; status: ProjectStatus } | null;
  roadmapInitiatives: Array<{
    id: string;
    title: string;
    status: RecommendationStatus;
    phaseId: string;
    phaseName: string;
    targetDate: Date | null;
  }>;
  linkedProjects: Array<{
    id: string;
    title: string;
    status: ProjectStatus;
  }>;
};

async function loadPillarRecommendationBundles(
  clientId: string,
  pillarCode: TechnologyPillarCode,
  role: UserRole,
): Promise<PillarRecommendationBundle[]> {
  const rows = await prisma.assessmentRecommendation.findMany({
    where: {
      clientId,
      status: { in: [...CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES] },
      category: { code: pillarCode },
    },
    orderBy: [{ priority: "asc" }, { estimatedImpactPoints: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      businessImpact: true,
      suggestedService: true,
      priority: true,
      status: true,
      estimatedImpactPoints: true,
      recommendationTemplate: { select: { code: true } },
      project: { select: { id: true, title: true, status: true } },
      roadmapInitiatives: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          phaseId: true,
          phase: {
            select: {
              id: true,
              name: true,
              completionDate: true,
            },
          },
        },
      },
      projectLinks: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        select: {
          project: { select: { id: true, title: true, status: true } },
        },
      },
    },
  });

  const serialized = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    businessImpact: row.businessImpact,
    suggestedService: row.suggestedService,
    priority: row.priority,
    status: row.status,
    estimatedImpactPoints: row.estimatedImpactPoints,
    templateCode: row.recommendationTemplate?.code ?? null,
    project: row.project,
    roadmapInitiatives: row.roadmapInitiatives.map((initiative) => ({
      id: initiative.id,
      title: initiative.title,
      status: row.status,
      phaseId: initiative.phase.id,
      phaseName: initiative.phase.name,
      targetDate: initiative.phase.completionDate,
    })),
    linkedProjects: row.projectLinks.map((link) => link.project),
  }));

  return presentRecommendationsForRole(serialized, role);
}

async function loadProjectProgressAndMilestones(
  clientId: string,
  projectIds: string[],
): Promise<
  Map<
    string,
    {
      progressPercent: number | null;
      nextMilestoneTitle: string | null;
    }
  >
> {
  const result = new Map<
    string,
    { progressPercent: number | null; nextMilestoneTitle: string | null }
  >();
  if (projectIds.length === 0) return result;

  const [tasks, milestones] = await Promise.all([
    prisma.projectTask.findMany({
      where: { clientId, projectId: { in: projectIds } },
      select: { projectId: true, status: true },
    }),
    prisma.projectMilestone.findMany({
      where: { clientId, projectId: { in: projectIds } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        projectId: true,
        title: true,
        targetDate: true,
        completedAt: true,
        sortOrder: true,
      },
    }),
  ]);

  const tasksByProject = new Map<string, Array<{ status: (typeof tasks)[number]["status"] }>>();
  for (const task of tasks) {
    const list = tasksByProject.get(task.projectId) ?? [];
    list.push({ status: task.status });
    tasksByProject.set(task.projectId, list);
  }

  const milestonesByProject = new Map<string, typeof milestones>();
  for (const milestone of milestones) {
    const list = milestonesByProject.get(milestone.projectId) ?? [];
    list.push(milestone);
    milestonesByProject.set(milestone.projectId, list);
  }

  for (const projectId of projectIds) {
    const progress = computeProjectProgress(tasksByProject.get(projectId) ?? []);
    const open = (milestonesByProject.get(projectId) ?? []).filter((m) => !m.completedAt);
    const next = open.sort((a, b) => {
      const aTime = a.targetDate?.getTime() ?? Number.POSITIVE_INFINITY;
      const bTime = b.targetDate?.getTime() ?? Number.POSITIVE_INFINITY;
      if (aTime !== bTime) return aTime - bTime;
      return a.sortOrder - b.sortOrder;
    })[0];
    result.set(projectId, {
      progressPercent: progress.progressPercent,
      nextMilestoneTitle: next?.title ?? null,
    });
  }

  return result;
}

/**
 * Assemble interactive Explore payload for a customer-owned client.
 * Caller must enforce tenant ownership before invoking.
 */
export async function getCustomerExplore(
  clientId: string,
  role: UserRole,
  companyName: string,
  selectedPillarRaw?: string | null,
): Promise<CustomerExploreDto | null> {
  const detail = await getTechnologyProfileDetail(clientId, role);
  if (!detail) return null;

  const hasCompletedAssessment = detail.journey.assessmentsCompleted > 0;
  const assessmentId = detail.profile.currentAssessmentId;
  const tiles = buildCustomerPillarTiles(clientId, detail.pillarInsights);
  const selectedPillarCode = isTechnologyPillarCode(selectedPillarRaw)
    ? selectedPillarRaw
    : tiles.find((t) => t.score !== null)?.code ?? TECHNOLOGY_PILLARS[0]!.code;

  const detailsEntries = await Promise.all(
    TECHNOLOGY_PILLARS.map(async (pillar) => {
      const [responses, recommendationBundles] = await Promise.all([
        loadPillarResponses(assessmentId, pillar.code),
        loadPillarRecommendationBundles(clientId, pillar.code, role),
      ]);

      const projectMap = new Map<
        string,
        { id: string; title: string; status: ProjectStatus }
      >();
      for (const row of recommendationBundles) {
        if (row.project) projectMap.set(row.project.id, row.project);
        for (const linked of row.linkedProjects) {
          projectMap.set(linked.id, linked);
        }
      }

      const projectIds = [...projectMap.keys()];
      const progressByProject = await loadProjectProgressAndMilestones(clientId, projectIds);

      const initiativeMap = new Map<
        string,
        {
          id: string;
          title: string;
          statusLabel: string;
          phaseId: string;
          phaseName: string;
          targetDate: Date | null;
        }
      >();
      for (const row of recommendationBundles) {
        for (const initiative of row.roadmapInitiatives) {
          if (initiativeMap.has(initiative.id)) continue;
          initiativeMap.set(initiative.id, {
            id: initiative.id,
            title: initiative.title,
            statusLabel:
              RECOMMENDATION_LIFECYCLE_LABELS[initiative.status] ?? initiative.status,
            phaseId: initiative.phaseId,
            phaseName: initiative.phaseName,
            targetDate: initiative.targetDate,
          });
        }
      }

      const insight =
        detail.pillarInsights.find((p) => p.pillarCode === pillar.code) ?? null;
      const built = buildCustomerPillarDetail({
        clientId,
        pillarCode: pillar.code,
        insight,
        responses,
        recommendations: recommendationBundles.map((row) => ({
          id: row.id,
          title: row.title,
          priority: row.priority,
          status: row.status,
          estimatedImpactPoints: row.estimatedImpactPoints,
          suggestedService: row.suggestedService,
          description: row.description,
          businessImpact: row.businessImpact,
        })),
        roadmapInitiatives: [...initiativeMap.values()],
        relatedProjects: [...projectMap.values()].map((project) => {
          const extras = progressByProject.get(project.id);
          return {
            id: project.id,
            title: project.title,
            status: project.status,
            progressPercent: extras?.progressPercent ?? null,
            nextMilestoneTitle: extras?.nextMilestoneTitle ?? null,
          };
        }),
        hasCompletedAssessment,
      });
      return [pillar.code, built] as const;
    }),
  );

  const detailsByCode = Object.fromEntries(detailsEntries) as Record<
    TechnologyPillarCode,
    CustomerPillarDetailDto
  >;

  return {
    clientId,
    companyName,
    hasCompletedAssessment,
    assessmentInProgress: Boolean(detail.draftAssessmentId),
    selectedPillarCode,
    pillars: tiles,
    detailsByCode,
  };
}
