/**
 * SS-WEB-003 — Public demo data provider.
 * Builds customer-portal DTOs from fictional fixtures. No Prisma / auth / mutations.
 */

import {
  CUSTOMER_TERM_ROADMAP_PROGRESS,
  CUSTOMER_TERM_STACKSCORE,
  customerRoadmapProgressFootnote,
  getCustomerMaturityLabel,
} from "@/lib/assessments/customer-reporting";
import { COMPLEXITY_FOOTNOTE } from "@/lib/customer-portal/complexity";
import type { CustomerNextAction } from "@/lib/customer-portal/next-action";
import type { CustomerOverviewDto } from "@/lib/customer-portal/overview-dto";
import type {
  CustomerExploreDto,
  CustomerPillarDetailDto,
  CustomerPillarTile,
} from "@/lib/customer-portal/pillar-detail-dto";
import type { CustomerRoadmapExperienceDto } from "@/lib/customer-portal/roadmap-dto";
import type {
  CustomerProjectDetailDto,
  CustomerProjectViewFilter,
  CustomerProjectsExperienceDto,
} from "@/lib/customer-portal/projects-dto";
import {
  CUSTOMER_ACTIVE_PROJECT_STATUSES,
  CUSTOMER_PLANNED_PROJECT_STATUSES,
  groupCustomerProjectTasks,
} from "@/lib/customer-portal/projects-dto";
import type {
  CustomerReportCard,
  CustomerReportsExperienceDto,
} from "@/lib/customer-portal/reports-dto";
import {
  buildCustomerOpportunitiesDto,
  type CustomerOpportunitiesDto,
  type CustomerOpportunityFilters,
  type CustomerOpportunityItem,
  type OpportunityRowInput,
} from "@/lib/customer-portal/opportunities-dto";
import { PRIORITY_LABELS, formatDisplayDate } from "@/lib/display";
import { PROJECT_STATUS_LABELS } from "@/lib/projects";
import { computeProjectProgress } from "@/lib/projects/progress";
import { formatMaturityScore } from "@/lib/scoring/score-display";
import {
  TECHNOLOGY_PILLARS,
  type TechnologyPillarCode,
} from "@/lib/technology-maturity/pillars";
import {
  PUBLIC_DEMO_ASSESSED_AT,
  PUBLIC_DEMO_COMPANY_NAME,
  PUBLIC_DEMO_SAMPLE_NOTICE,
  PUBLIC_DEMO_WELCOME_NAME,
  PUBLIC_DEMO_WORKSPACE_ID,
} from "@/lib/public-demo/constants";
import {
  DEMO_INITIATIVES,
  DEMO_OPPORTUNITIES,
  DEMO_PHASES,
  DEMO_PILLAR_CONTROLS,
  DEMO_PILLAR_NARRATIVES,
  DEMO_PROJECTS,
  type DemoOpportunityFixture,
  type DemoProjectFixture,
} from "@/lib/public-demo/fixtures";
import {
  PUBLIC_DEMO_OPPORTUNITIES_PATH,
  PUBLIC_DEMO_OVERVIEW_PATH,
  PUBLIC_DEMO_PROJECTS_PATH,
  PUBLIC_DEMO_ROADMAP_PATH,
  PUBLIC_DEMO_SAMPLE_REPORT_PATH,
  publicDemoExplorePillarPath,
  publicDemoOpportunityPath,
  publicDemoProjectPath,
  publicDemoRoadmapPhasePath,
} from "@/lib/public-demo/routes";
import {
  PUBLIC_DEMO_PILLAR_SCORES,
  computePublicDemoOverallScore,
  maturityExplanationForScore,
} from "@/lib/public-demo/scoring";

const STATUS_LABELS: Partial<Record<DemoOpportunityFixture["status"], string>> = {
  open: "Open",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  deferred: "Deferred",
};

const TASK_STATUS_LABEL = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
} as const;

const ACTIVITY_KIND_LABEL: Record<string, string> = {
  project_task_completed: "Task completed",
  project_milestone_completed: "Milestone completed",
  project_started: "Project started",
  project_status_changed: "Status changed",
};

function complexityFromLabel(label: DemoOpportunityFixture["complexity"]) {
  const effort =
    label === "Easy" ? "low" : label === "Moderate" ? "medium" : "high";
  return {
    label,
    displayLabel: label,
    playbookId: null,
    playbookName: null,
    effortLevel: effort as "low" | "medium" | "high",
    footnote: COMPLEXITY_FOOTNOTE,
  };
}

function assessedAtLabel(): string {
  return formatDisplayDate(PUBLIC_DEMO_ASSESSED_AT);
}

function optionalDateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return formatDisplayDate(value);
}

function pillarName(code: TechnologyPillarCode): string {
  return TECHNOLOGY_PILLARS.find((p) => p.code === code)?.name ?? code;
}

function opportunitiesForPillar(code: TechnologyPillarCode) {
  return DEMO_OPPORTUNITIES.filter((row) => row.pillarCode === code);
}

function projectsForPillar(code: TechnologyPillarCode) {
  return DEMO_PROJECTS.filter((row) => row.pillarCode === code);
}

function initiativesForPillar(code: TechnologyPillarCode) {
  return DEMO_INITIATIVES.filter((row) => row.pillarCode === code);
}

function buildPillarTile(code: TechnologyPillarCode): CustomerPillarTile {
  const def = TECHNOLOGY_PILLARS.find((p) => p.code === code)!;
  const score = PUBLIC_DEMO_PILLAR_SCORES[code];
  return {
    code,
    name: def.name,
    businessQuestion: def.businessQuestion,
    score,
    maturityLabel: getCustomerMaturityLabel(score),
    href: publicDemoExplorePillarPath(code),
    status: "complete",
  };
}

function maturitySummary(score: number, label: string, name: string): string {
  const displayScore = formatMaturityScore(score);
  if (score >= 85) {
    return `${name} is at ${label} maturity (${displayScore}/100). Practices in this domain are largely consistent and support the business with manageable risk.`;
  }
  if (score >= 70) {
    return `${name} is at ${label} maturity (${displayScore}/100). Core practices are in place, with clear opportunities to strengthen consistency and resilience.`;
  }
  if (score >= 55) {
    return `${name} is at ${label} maturity (${displayScore}/100). Foundational capabilities exist, but important gaps may still create operational or security exposure.`;
  }
  if (score >= 40) {
    return `${name} is at ${label} maturity (${displayScore}/100). Several foundational controls are incomplete — prioritizing remediation will reduce business risk.`;
  }
  return `${name} is at ${label} maturity (${displayScore}/100). Technology readiness in this domain is early-stage.`;
}

function buildPillarDetail(code: TechnologyPillarCode): CustomerPillarDetailDto {
  const def = TECHNOLOGY_PILLARS.find((p) => p.code === code)!;
  const score = PUBLIC_DEMO_PILLAR_SCORES[code];
  const label = getCustomerMaturityLabel(score);
  const findings = DEMO_PILLAR_CONTROLS[code];
  const strengths = findings.filter((f) => f.resultKind === "satisfied");
  const attentionItems = findings.filter(
    (f) => f.resultKind === "partial" || f.resultKind === "unsatisfied",
  );
  const narrative = DEMO_PILLAR_NARRATIVES[code];
  const opps = opportunitiesForPillar(code).map((row) => ({
    id: row.id,
    title: row.title,
    priority: row.priority,
    priorityLabel: PRIORITY_LABELS[row.priority],
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] ?? row.status,
    href: publicDemoOpportunityPath(row.id),
    complexity: complexityFromLabel(row.complexity),
    finding: row.finding,
    recommendedAction: row.recommendedAction,
    expectedOutcome: row.expectedOutcome,
    businessImpact: row.businessImpact,
  }));
  const strengthFinding = strengths[0] ?? null;
  const weaknessFinding = attentionItems[0] ?? null;
  const relatedOpp = opps[0] ?? null;

  return {
    code,
    name: def.name,
    businessQuestion: def.businessQuestion,
    score,
    maturityLabel: label,
    maturitySummary: maturitySummary(score, label, def.name),
    controlsAssessed: findings.length,
    controlsScorable: findings.filter((f) => f.resultKind !== "excluded").length,
    opportunityCount: opps.length,
    strength: {
      kind: score >= 55 ? "demonstrated" : "comparative",
      summary: narrative.strengthSummary,
      evidence: strengthFinding
        ? {
            questionText: strengthFinding.questionText,
            answerText: strengthFinding.answerText,
            scoreEarned: strengthFinding.resultKind === "satisfied" ? 100 : 50,
            isCritical: strengthFinding.isCritical,
          }
        : null,
    },
    weakness: {
      summary: narrative.weaknessSummary,
      evidence: weaknessFinding
        ? {
            questionText: weaknessFinding.questionText,
            answerText: weaknessFinding.answerText,
            scoreEarned: weaknessFinding.resultKind === "partial" ? 50 : 0,
            isCritical: weaknessFinding.isCritical,
          }
        : null,
      relatedOpportunityId: relatedOpp?.id ?? null,
      relatedOpportunityHref: relatedOpp?.href ?? null,
    },
    strengths,
    attentionItems,
    findings,
    opportunities: opps,
    nextActions: opps.slice(0, 3),
    roadmapInitiatives: initiativesForPillar(code).map((init) => ({
      id: init.id,
      title: init.title,
      statusLabel: STATUS_LABELS[init.status] ?? init.status,
      phaseName: init.phaseName,
      targetDateLabel: null,
      href: publicDemoRoadmapPhasePath(init.phaseId),
    })),
    relatedProjects: projectsForPillar(code).map((project) => {
      const progress = computeProjectProgress(project.tasks);
      return {
        id: project.id,
        title: project.title,
        status: project.status,
        statusLabel: PROJECT_STATUS_LABELS[project.status],
        progressPercent: progress.progressPercent,
        nextMilestoneTitle:
          project.milestones.find((m) => !m.completedAt)?.title ?? null,
        href: publicDemoProjectPath(project.id),
      };
    }),
    opportunitiesHref: PUBLIC_DEMO_OPPORTUNITIES_PATH,
    roadmapHref: PUBLIC_DEMO_ROADMAP_PATH,
    projectsHref: PUBLIC_DEMO_PROJECTS_PATH,
    complexityFootnote: COMPLEXITY_FOOTNOTE,
    hasCompletedAssessment: true,
  };
}

export function getPublicDemoOverview(): CustomerOverviewDto {
  const stackScore = computePublicDemoOverallScore();
  const maturityLabel = getCustomerMaturityLabel(stackScore);
  const pillars = TECHNOLOGY_PILLARS.map((p) => buildPillarTile(p.code));
  const scored = pillars
    .filter((p): p is typeof p & { score: number } => p.score !== null)
    .map((p) => ({ name: p.name, score: p.score }));
  const demonstratedStrengths = scored
    .filter((p) => p.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((p) => ({ name: p.name, score: p.score, kind: "demonstrated" as const }));
  const comparativeStrengths = scored
    .filter((p) => p.score < 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((p) => ({ name: p.name, score: p.score, kind: "comparative" as const }));

  const priorities = DEMO_OPPORTUNITIES.filter((o) =>
    ["open", "accepted", "in_progress"].includes(o.status),
  )
    .sort((a, b) => {
      const order: Record<string, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
    })
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      title: row.title,
      priority: row.priority,
      priorityLabel: PRIORITY_LABELS[row.priority],
      href: publicDemoOpportunityPath(row.id),
    }));

  const progressPercent = Math.round(
    (DEMO_INITIATIVES.filter((i) => i.status === "in_progress" || i.status === "completed")
      .length /
      DEMO_INITIATIVES.length) *
      40,
  );

  const nextAction: CustomerNextAction = {
    label: "Explore Identity & Access",
    description:
      "Start with the lowest-maturity critical domain — identity governance gaps are the top priority for Northstar.",
    href: publicDemoExplorePillarPath("identity_access"),
  };

  return {
    clientId: PUBLIC_DEMO_WORKSPACE_ID,
    companyName: PUBLIC_DEMO_COMPANY_NAME,
    welcomeName: PUBLIC_DEMO_WELCOME_NAME,
    hasCompletedAssessment: true,
    assessmentInProgress: false,
    draftAssessmentId: null,
    stackScore,
    maturityLabel,
    maturityExplanation: maturityExplanationForScore(stackScore, maturityLabel),
    assessedAt: PUBLIC_DEMO_ASSESSED_AT,
    assessedAtLabel: assessedAtLabel(),
    reportHref: PUBLIC_DEMO_SAMPLE_REPORT_PATH,
    pillars,
    priorities,
    activeOpportunityCount: DEMO_OPPORTUNITIES.filter((o) =>
      ["open", "accepted", "in_progress"].includes(o.status),
    ).length,
    demonstratedStrengths,
    comparativeStrengths,
    roadmap: {
      progressPercent,
      phaseLabel: "Stabilize",
      hasRoadmap: true,
      hasInitiatives: true,
      emptyStateLabel: null,
      href: PUBLIC_DEMO_ROADMAP_PATH,
      footnote: customerRoadmapProgressFootnote(),
      stackScoreLabel: CUSTOMER_TERM_STACKSCORE,
    },
    journey: {
      progressPercent: 55,
      phaseLabel: "Implementation underway",
    },
    nextAction,
    vcio: {
      show: false,
      accessState: "NO_ACCESS",
      canUseFeatures: false,
      title: "",
      description: "",
      href: PUBLIC_DEMO_OVERVIEW_PATH,
    },
  };
}

export function getPublicDemoExplore(
  selectedPillarCode: TechnologyPillarCode | null = "identity_access",
): CustomerExploreDto {
  const detailsByCode = Object.fromEntries(
    TECHNOLOGY_PILLARS.map((pillar) => [pillar.code, buildPillarDetail(pillar.code)]),
  ) as Record<TechnologyPillarCode, CustomerPillarDetailDto>;

  return {
    clientId: PUBLIC_DEMO_WORKSPACE_ID,
    companyName: PUBLIC_DEMO_COMPANY_NAME,
    hasCompletedAssessment: true,
    assessmentInProgress: false,
    selectedPillarCode,
    pillars: TECHNOLOGY_PILLARS.map((p) => buildPillarTile(p.code)),
    detailsByCode,
  };
}

export function getPublicDemoRoadmap(): CustomerRoadmapExperienceDto {
  const stackScore = computePublicDemoOverallScore();
  const initiativesCompleted = DEMO_INITIATIVES.filter((i) => i.status === "completed").length;
  const initiativesTotal = DEMO_INITIATIVES.length;
  const progressPercent = Math.round(
    ((initiativesCompleted +
      DEMO_INITIATIVES.filter((i) => i.status === "in_progress").length * 0.5) /
      initiativesTotal) *
      100,
  );

  return {
    clientId: PUBLIC_DEMO_WORKSPACE_ID,
    title: `${PUBLIC_DEMO_COMPANY_NAME} Technology Roadmap`,
    status: "active",
    isDraft: false,
    hasRoadmap: true,
    summary: {
      officialStackScore: stackScore,
      stackScoreLabel: CUSTOMER_TERM_STACKSCORE,
      progressPercent,
      progressLabel: CUSTOMER_TERM_ROADMAP_PROGRESS,
      currentPhaseName: "Stabilize",
      initiativesTotal,
      initiativesCompleted,
      initiativesRemaining: initiativesTotal - initiativesCompleted,
      footnote: customerRoadmapProgressFootnote(),
    },
    phases: DEMO_PHASES.map((phase) => {
      const phaseInits = DEMO_INITIATIVES.filter((i) => i.phaseId === phase.id);
      return {
        id: phase.id,
        name: phase.name,
        subtitle: phase.subtitle,
        purpose: phase.purpose,
        timeline: phase.timeline,
        status: phase.status,
        statusLabel: phase.statusLabel,
        initiativeCount: phaseInits.length,
        completedInitiativeCount: phaseInits.filter((i) => i.status === "completed").length,
        isCurrent: phase.isCurrent,
        href: publicDemoRoadmapPhasePath(phase.id),
      };
    }),
    initiatives: DEMO_INITIATIVES.map((init) => ({
      id: init.id,
      title: init.title,
      priority: init.priority,
      priorityLabel: PRIORITY_LABELS[init.priority],
      status: init.status,
      statusLabel: STATUS_LABELS[init.status] ?? init.status,
      pillarName: pillarName(init.pillarCode),
      pillarHref: publicDemoExplorePillarPath(init.pillarCode),
      recommendationHref: publicDemoOpportunityPath(init.opportunityId),
      implementationNotes: init.implementationNotes,
      businessImpact: init.businessImpact,
      phaseId: init.phaseId,
      phaseName: init.phaseName,
    })),
    projects: DEMO_PROJECTS.map((project) => {
      const opp = DEMO_OPPORTUNITIES.find((o) => o.id === project.opportunityId);
      return {
        id: project.id,
        title: project.title,
        statusLabel: PROJECT_STATUS_LABELS[project.status],
        priorityLabel: PRIORITY_LABELS[project.priority],
        recommendationTitle: opp?.title ?? null,
        href: publicDemoProjectPath(project.id),
      };
    }),
    projectsHref: PUBLIC_DEMO_PROJECTS_PATH,
    opportunitiesHref: PUBLIC_DEMO_OPPORTUNITIES_PATH,
    nextActions: [
      {
        id: "demo-next-explore",
        label: "Review Identity & Access",
        description: "Inspect the top-priority pillar intelligence.",
        href: publicDemoExplorePillarPath("identity_access"),
      },
      {
        id: "demo-next-project",
        label: "Open Identity Governance project",
        description: "See task-based delivery progress for the active initiative.",
        href: publicDemoProjectPath(DEMO_PROJECTS[0]!.id),
      },
      {
        id: "demo-next-sign-in",
        label: "Sign in to StackScore",
        description: "Continue with your own workspace when ready.",
        href: "/login",
      },
    ],
  };
}

function projectMatchesView(
  status: DemoProjectFixture["status"],
  view: CustomerProjectViewFilter,
): boolean {
  if (view === "all") return true;
  if (view === "planned") return CUSTOMER_PLANNED_PROJECT_STATUSES.includes(status);
  if (view === "active") return CUSTOMER_ACTIVE_PROJECT_STATUSES.includes(status);
  return status === "completed";
}

export function getPublicDemoProjects(
  view: CustomerProjectViewFilter = "all",
): CustomerProjectsExperienceDto {
  const now = new Date("2026-10-15T12:00:00.000Z");
  const summary = {
    plannedCount: DEMO_PROJECTS.filter((p) =>
      CUSTOMER_PLANNED_PROJECT_STATUSES.includes(p.status),
    ).length,
    activeCount: DEMO_PROJECTS.filter((p) =>
      CUSTOMER_ACTIVE_PROJECT_STATUSES.includes(p.status),
    ).length,
    completedCount: DEMO_PROJECTS.filter((p) => p.status === "completed").length,
    upcomingTargetDateCount: DEMO_PROJECTS.filter((p) => {
      if (!p.targetCompletionDate || p.status === "completed") return false;
      return new Date(p.targetCompletionDate).getTime() >= now.getTime();
    }).length,
  };

  return {
    clientId: PUBLIC_DEMO_WORKSPACE_ID,
    companyName: PUBLIC_DEMO_COMPANY_NAME,
    summary,
    view,
    projects: DEMO_PROJECTS.filter((p) => projectMatchesView(p.status, view)).map(
      (project) => {
        const progress = computeProjectProgress(project.tasks);
        return {
          id: project.id,
          title: project.title,
          status: project.status,
          statusLabel: PROJECT_STATUS_LABELS[project.status],
          priority: project.priority,
          priorityLabel: PRIORITY_LABELS[project.priority],
          descriptionPreview: project.description,
          startDateLabel: optionalDateLabel(project.startDate),
          targetCompletionDateLabel: optionalDateLabel(project.targetCompletionDate),
          pillarName: pillarName(project.pillarCode),
          pillarHref: publicDemoExplorePillarPath(project.pillarCode),
          progressPercent: progress.progressPercent,
          href: publicDemoProjectPath(project.id),
        };
      },
    ),
    opportunitiesHref: PUBLIC_DEMO_OPPORTUNITIES_PATH,
    roadmapHref: PUBLIC_DEMO_ROADMAP_PATH,
  };
}

export function getPublicDemoProjectDetail(
  projectId: string,
): CustomerProjectDetailDto | null {
  const project = DEMO_PROJECTS.find((p) => p.id === projectId);
  if (!project) return null;

  const progress = computeProjectProgress(project.tasks);
  const opp = DEMO_OPPORTUNITIES.find((o) => o.id === project.opportunityId);
  const tasks = project.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    statusLabel: TASK_STATUS_LABEL[task.status],
    dueDateLabel: optionalDateLabel(task.dueDate),
    completedAtLabel: optionalDateLabel(task.completedAt),
    group:
      task.status === "completed"
        ? ("completed" as const)
        : task.status === "in_progress"
          ? ("in_progress" as const)
          : ("up_next" as const),
  }));

  const now = new Date("2026-10-15T12:00:00.000Z");
  const milestones = project.milestones.map((milestone) => {
    const target = milestone.targetDate ? new Date(milestone.targetDate) : null;
    const isComplete = Boolean(milestone.completedAt);
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      targetDateLabel: optionalDateLabel(milestone.targetDate),
      completedAtLabel: optionalDateLabel(milestone.completedAt),
      isComplete,
      isOverdue: Boolean(!isComplete && target && target.getTime() < now.getTime()),
    };
  });

  const nextOpen = milestones.find((m) => !m.isComplete) ?? null;

  return {
    clientId: PUBLIC_DEMO_WORKSPACE_ID,
    companyName: PUBLIC_DEMO_COMPANY_NAME,
    id: project.id,
    title: project.title,
    status: project.status,
    statusLabel: PROJECT_STATUS_LABELS[project.status],
    priority: project.priority,
    priorityLabel: PRIORITY_LABELS[project.priority],
    description: project.description,
    expectedOutcome: opp?.expectedOutcome ?? null,
    startDateLabel: optionalDateLabel(project.startDate),
    targetCompletionDateLabel: optionalDateLabel(project.targetCompletionDate),
    completedAtLabel: optionalDateLabel(project.completedAt),
    pillarName: pillarName(project.pillarCode),
    pillarHref: publicDemoExplorePillarPath(project.pillarCode),
    progressPercent: progress.progressPercent,
    tasksTotal: progress.tasksTotal,
    tasksCompleted: progress.tasksCompleted,
    tasks,
    taskGroups: groupCustomerProjectTasks(tasks),
    milestones,
    nextMilestone: nextOpen
      ? {
          id: nextOpen.id,
          title: nextOpen.title,
          targetDateLabel: nextOpen.targetDateLabel,
          isOverdue: nextOpen.isOverdue,
        }
      : null,
    recommendations: opp
      ? [
          {
            id: opp.id,
            title: opp.title,
            status: opp.status,
            statusLabel: STATUS_LABELS[opp.status] ?? opp.status,
            href: publicDemoOpportunityPath(opp.id),
          },
        ]
      : [],
    roadmapInitiatives: [
      {
        id: project.phaseId,
        title: project.title,
        phaseName: project.phaseName,
        href: publicDemoRoadmapPhasePath(project.phaseId),
      },
    ],
    activity: project.activity.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      occurredAtLabel: optionalDateLabel(event.occurredAt) ?? "",
      eventType: event.eventType,
      kindLabel: ACTIVITY_KIND_LABEL[event.eventType] ?? "Update",
    })),
    publishedUpdates: [],
    completionReportHref: null,
    listHref: PUBLIC_DEMO_PROJECTS_PATH,
  };
}

export function getPublicDemoOpportunity(id: string): DemoOpportunityFixture | null {
  return DEMO_OPPORTUNITIES.find((row) => row.id === id) ?? null;
}

export function getPublicDemoOpportunities(): DemoOpportunityFixture[] {
  return DEMO_OPPORTUNITIES;
}

function demoOpportunityRows(): OpportunityRowInput[] {
  return DEMO_OPPORTUNITIES.map((row) => {
    const related = DEMO_INITIATIVES.filter((init) => init.opportunityId === row.id);
    return {
      id: row.id,
      title: row.title,
      description: [
        `Finding: ${row.finding}`,
        `Recommended action: ${row.recommendedAction}`,
        `Expected outcome: ${row.expectedOutcome}`,
      ].join("\n\n"),
      businessImpact: row.businessImpact,
      suggestedService: null,
      priority: row.priority,
      status: row.status,
      estimatedImpactPoints: row.priority === "critical" ? 8 : row.priority === "high" ? 5 : 3,
      categoryCode: row.pillarCode,
      categoryName: pillarName(row.pillarCode),
      roadmapInitiatives: related.map((init) => ({
        id: init.id,
        title: init.title,
        phaseId: init.phaseId,
        phaseName: init.phaseName,
      })),
    };
  });
}

function remapDemoOpportunityItem(item: CustomerOpportunityItem): CustomerOpportunityItem {
  return {
    ...item,
    pillarHref: publicDemoExplorePillarPath(item.pillarCode),
    roadmap: item.roadmap
      ? {
          ...item.roadmap,
          href: publicDemoRoadmapPhasePath(item.roadmap.phaseId),
        }
      : null,
  };
}

/** Shared customer Opportunities DTO for the public demo list experience. */
export function getPublicDemoOpportunitiesDto(input?: {
  filters?: CustomerOpportunityFilters;
  selectedId?: string | null;
}): CustomerOpportunitiesDto {
  const dto = buildCustomerOpportunitiesDto({
    clientId: PUBLIC_DEMO_WORKSPACE_ID,
    rows: demoOpportunityRows(),
    filters: input?.filters ?? { status: "active" },
    selectedId: input?.selectedId ?? null,
  });
  return {
    ...dto,
    opportunities: dto.opportunities.map(remapDemoOpportunityItem),
  };
}

export function getPublicDemoReports(): CustomerReportsExperienceDto {
  const sampleCard: CustomerReportCard = {
    id: "demo-sample-assessment-report",
    title: "Technology Maturity Assessment — Sample",
    typeLabel: "Sample assessment report",
    periodLabel: "Full assessment",
    completedAtLabel: assessedAtLabel(),
    companyName: `${PUBLIC_DEMO_COMPANY_NAME} (sample)`,
    actions: [
      {
        id: "view",
        label: "View sample preview",
        href: PUBLIC_DEMO_SAMPLE_REPORT_PATH,
        download: false,
      },
    ],
  };

  return {
    clientId: PUBLIC_DEMO_WORKSPACE_ID,
    companyName: PUBLIC_DEMO_COMPANY_NAME,
    latest: sampleCard,
    history: [],
    executiveReports: [
      {
        id: "demo-sample-progress",
        title: "Executive progress snapshot — Sample",
        typeLabel: "Sample executive report",
        periodLabel: "Since Sep 2026 assessment",
        completedAtLabel: "Oct 15, 2026",
        companyName: `${PUBLIC_DEMO_COMPANY_NAME} (sample)`,
        actions: [
          {
            id: "view",
            label: "View sample preview",
            href: PUBLIC_DEMO_SAMPLE_REPORT_PATH,
            download: false,
          },
        ],
      },
    ],
    businessReviews: null,
    guide: [
      {
        id: "assessment",
        title: "Assessment report",
        body: "Shows maturity scores, findings, and prioritized recommendations after an assessment completes.",
        href: PUBLIC_DEMO_SAMPLE_REPORT_PATH,
        actionLabel: "Sample preview",
      },
      {
        id: "opportunities",
        title: "Improvement opportunities",
        body: "Active recommendations that feed roadmap and project work.",
        href: PUBLIC_DEMO_OPPORTUNITIES_PATH,
        actionLabel: "View sample opportunities",
      },
      {
        id: "roadmap",
        title: "Roadmap",
        body: "Phased initiatives that organize improvement work without changing official StackScore until reassessment.",
        href: PUBLIC_DEMO_ROADMAP_PATH,
        actionLabel: "View sample roadmap",
      },
      {
        id: "business-review",
        title: "Business reviews",
        body: "Published advisory reviews appear here for subscribed customers. This demo shows sample metadata only.",
        href: null,
        actionLabel: null,
      },
    ],
    resumeAssessmentHref: null,
  };
}

export type PublicDemoWorkspace = {
  workspaceId: string;
  companyName: string;
  sampleNotice: string;
  overview: CustomerOverviewDto;
  explore: CustomerExploreDto;
  roadmap: CustomerRoadmapExperienceDto;
  projects: CustomerProjectsExperienceDto;
  reports: CustomerReportsExperienceDto;
};

export function getPublicDemoWorkspace(): PublicDemoWorkspace {
  return {
    workspaceId: PUBLIC_DEMO_WORKSPACE_ID,
    companyName: PUBLIC_DEMO_COMPANY_NAME,
    sampleNotice: PUBLIC_DEMO_SAMPLE_NOTICE,
    overview: getPublicDemoOverview(),
    explore: getPublicDemoExplore(),
    roadmap: getPublicDemoRoadmap(),
    projects: getPublicDemoProjects(),
    reports: getPublicDemoReports(),
  };
}

/** Security helper — every public demo entity id must use the demo prefix. */
export function listPublicDemoEntityIds(): string[] {
  return [
    PUBLIC_DEMO_WORKSPACE_ID,
    ...DEMO_OPPORTUNITIES.map((o) => o.id),
    ...DEMO_PROJECTS.map((p) => p.id),
    ...DEMO_INITIATIVES.map((i) => i.id),
    ...DEMO_PHASES.map((p) => p.id),
  ];
}
