import type { Priority } from "@/generated/prisma/client";
import type {
  QbrBudgetForecast,
  QbrCategoryImprovement,
  QbrRecommendationSummary,
  QbrReportData,
  QbrRoadmapPhaseSummary,
} from "@/lib/qbr/types";

export type QbrDashboardKpi = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "warning" | "critical";
};

export type QbrPriorityGroup = {
  priority: Priority;
  label: string;
  tone: "critical" | "high" | "medium" | "low";
  items: QbrRecommendationSummary[];
};

const PRIORITY_ORDER: Priority[] = ["critical", "high", "medium", "low"];

const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function formatQbrCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSignedPoints(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value > 0) return `+${value}`;
  return String(value);
}

export function getRoadmapCompletionPercent(phases: QbrRoadmapPhaseSummary[]): number | null {
  if (phases.length === 0) return null;
  const completed = phases.filter((phase) => {
    const status = (phase.status ?? "").toLowerCase();
    return status === "completed" || status === "complete";
  }).length;
  return Math.round((completed / phases.length) * 100);
}

export function getBudgetUtilizationPercent(budget: QbrBudgetForecast | null): number | null {
  if (!budget || budget.plannedInvestment <= 0) return null;
  return Math.round((budget.completedInvestment / budget.plannedInvestment) * 100);
}

export function getCriticalOpportunityCount(items: QbrRecommendationSummary[]): number {
  return items.filter((item) => item.priority === "critical" || item.priority === "high").length;
}

export type QbrPdfDashboardMetric = {
  id: string;
  label: string;
  value: string;
  secondary?: string;
  icon: "roadmap" | "projects" | "resolved" | "risks" | "budget" | "investment";
  tone?: "default" | "positive" | "warning";
};

export type QbrExecutiveHealthSummary = {
  overallHealth: string;
  biggestWin: string;
  largestConcern: string;
  overallRecommendation: string;
};

/** Six executive metrics for the Business Review PDF dashboard (3×2). */
export function buildQbrPdfDashboardMetrics(data: QbrReportData): QbrPdfDashboardMetric[] {
  const roadmapCompletion = getRoadmapCompletionPercent(data.roadmapPhases);
  const budgetUtilization = getBudgetUtilizationPercent(data.budgetForecast);
  const remainingCritical = getCriticalOpportunityCount(data.remainingOpportunities);
  const openRiskCount = data.technologyRisks.length || remainingCritical;

  return [
    {
      id: "roadmap",
      label: "Roadmap Progress",
      value: roadmapCompletion !== null ? `${roadmapCompletion}%` : "—",
      secondary:
        data.roadmapPhases.length > 0
          ? `${data.roadmapPhases.length} phases tracked`
          : "No roadmap phases yet",
      icon: "roadmap",
      tone: roadmapCompletion !== null && roadmapCompletion >= 50 ? "positive" : "default",
    },
    {
      id: "projects",
      label: "Projects Completed",
      value: String(data.projectsCompletedInPeriod),
      secondary:
        data.assessmentsCompletedInPeriod > 0
          ? `${data.assessmentsCompletedInPeriod} assessment${data.assessmentsCompletedInPeriod === 1 ? "" : "s"} this period`
          : "Delivery completed in period",
      icon: "projects",
      tone: data.projectsCompletedInPeriod > 0 ? "positive" : "default",
    },
    {
      id: "resolved",
      label: "Recommendations Closed",
      value: String(data.recommendationsResolvedInPeriod),
      secondary: `${data.remainingOpportunities.length} still open`,
      icon: "resolved",
      tone: data.recommendationsResolvedInPeriod > 0 ? "positive" : "default",
    },
    {
      id: "risks",
      label: "Open Risks",
      value: String(openRiskCount),
      secondary:
        remainingCritical > 0
          ? `${remainingCritical} critical / high items`
          : "No elevated exposure flagged",
      icon: "risks",
      tone: openRiskCount > 0 ? "warning" : "positive",
    },
    {
      id: "budget",
      label: "Budget Utilized",
      value: budgetUtilization !== null ? `${budgetUtilization}%` : "—",
      secondary: data.budgetForecast
        ? `${formatQbrCurrency(data.budgetForecast.completedInvestment)} completed`
        : "Forecast unavailable",
      icon: "budget",
    },
    {
      id: "investment",
      label: "Planned Investment",
      value: data.budgetForecast
        ? formatQbrCurrency(data.budgetForecast.plannedInvestment)
        : "—",
      secondary: data.budgetForecast
        ? `${formatQbrCurrency(data.budgetForecast.monthlyServices)}/mo services`
        : "Investment plan pending",
      icon: "investment",
    },
  ];
}

/** Narrative health panel derived only from existing Business Review data. */
export function buildQbrExecutiveHealthSummary(data: QbrReportData): QbrExecutiveHealthSummary {
  const scoreEnd = data.scoreAtPeriodEnd ?? data.currentStackScore;
  const maturity = data.currentMaturityLabel;

  let overallHealth: string;
  if (scoreEnd == null && !maturity) {
    overallHealth = "Technology health is still establishing a measurable baseline.";
  } else if (data.scoreChange != null && data.scoreChange > 0) {
    overallHealth = `Technology posture is ${maturity ? maturity.toLowerCase() : "improving"} at StackScore ${scoreEnd}, with measurable gains this period.`;
  } else if (data.scoreChange != null && data.scoreChange < 0) {
    overallHealth = `Technology posture is ${maturity ? maturity.toLowerCase() : "under pressure"} at StackScore ${scoreEnd}, with decline versus the prior review.`;
  } else {
    overallHealth = `Technology posture is ${maturity ? maturity.toLowerCase() : "stable"}${scoreEnd != null ? ` at StackScore ${scoreEnd}` : ""}.`;
  }

  const topCategoryWin = [...data.categoryImprovements]
    .filter((row) => row.change != null && row.change > 0)
    .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))[0];
  const topProject = data.completedProjects[0];
  const topResolved = data.resolvedRecommendations[0];

  let biggestWin: string;
  if (topCategoryWin) {
    biggestWin = `${topCategoryWin.categoryName} improved ${formatSignedPoints(topCategoryWin.change)} points.`;
  } else if (topResolved) {
    biggestWin = `Closed “${topResolved.title}” in ${topResolved.categoryName}.`;
  } else if (topProject) {
    biggestWin = `Completed “${topProject.title}” during this review period.`;
  } else if (data.recommendationsResolvedInPeriod > 0) {
    biggestWin = `${data.recommendationsResolvedInPeriod} recommendations were closed this period.`;
  } else {
    biggestWin = "No single standout win is recorded for this period yet.";
  }

  const topRisk = data.technologyRisks[0];
  const topOpportunity = [...data.remainingOpportunities].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    return order[a.priority] - order[b.priority];
  })[0];

  let largestConcern: string;
  if (topRisk) {
    largestConcern = topRisk;
  } else if (topOpportunity) {
    largestConcern = `${topOpportunity.priority.toUpperCase()} — ${topOpportunity.title}`;
  } else {
    largestConcern = "No elevated risks are currently flagged for leadership attention.";
  }

  const overallRecommendation =
    data.strategicRecommendations[0] ??
    data.nextQuarterPriorities[0] ??
    "Maintain execution cadence and reassess priorities at the next Business Review.";

  return {
    overallHealth,
    biggestWin,
    largestConcern,
    overallRecommendation,
  };
}

export function buildQbrDashboardKpis(data: QbrReportData): QbrDashboardKpi[] {
  const roadmapCompletion = getRoadmapCompletionPercent(data.roadmapPhases);
  const budgetUtilization = getBudgetUtilizationPercent(data.budgetForecast);
  const remainingCritical = getCriticalOpportunityCount(data.remainingOpportunities);
  const scoreTone =
    data.scoreChange === null
      ? "default"
      : data.scoreChange > 0
        ? "positive"
        : data.scoreChange < 0
          ? "warning"
          : "default";

  return [
    {
      label: "Technology Score",
      value:
        data.scoreAtPeriodEnd !== null && data.scoreAtPeriodEnd !== undefined
          ? String(data.scoreAtPeriodEnd)
          : "—",
      hint: data.currentMaturityLabel ?? undefined,
    },
    {
      label: "Improvement Since Last Review",
      value: formatSignedPoints(data.scoreChange),
      hint:
        data.scoreAtPeriodStart !== null
          ? `From ${data.scoreAtPeriodStart}`
          : "Vs prior period",
      tone: scoreTone,
    },
    {
      label: "Roadmap Progress",
      value: roadmapCompletion !== null ? `${roadmapCompletion}%` : "—",
      hint:
        data.roadmapPhases.length > 0
          ? `${data.roadmapPhases.length} phases tracked`
          : "No roadmap phases yet",
    },
    {
      label: "Projects Completed",
      value: String(data.projectsCompletedInPeriod),
      hint: `${data.assessmentsCompletedInPeriod} assessment${data.assessmentsCompletedInPeriod === 1 ? "" : "s"}`,
    },
    {
      label: "Recommendations Closed",
      value: String(data.recommendationsResolvedInPeriod),
      hint: `${data.remainingOpportunities.length} remaining`,
      tone: data.recommendationsResolvedInPeriod > 0 ? "positive" : "default",
    },
    {
      label: "Budget Utilized",
      value: budgetUtilization !== null ? `${budgetUtilization}%` : "—",
      hint: data.budgetForecast
        ? `${formatQbrCurrency(data.budgetForecast.completedInvestment)} completed`
        : "Forecast unavailable",
    },
    {
      label: "Open Risks",
      value: String(data.technologyRisks.length || remainingCritical),
      hint:
        remainingCritical > 0
          ? `${remainingCritical} critical/high opportunities`
          : "Monitor remaining work",
      tone: remainingCritical > 0 || data.technologyRisks.length > 0 ? "warning" : "positive",
    },
    {
      label: "Planned Investment",
      value: data.budgetForecast
        ? formatQbrCurrency(data.budgetForecast.plannedInvestment)
        : "—",
      hint: data.budgetForecast
        ? `${formatQbrCurrency(data.budgetForecast.monthlyServices)}/mo services`
        : undefined,
    },
  ];
}

export function groupOpportunitiesByPriority(
  opportunities: QbrRecommendationSummary[],
): QbrPriorityGroup[] {
  return PRIORITY_ORDER.map((priority) => ({
    priority,
    label: PRIORITY_LABELS[priority],
    tone: priority as QbrPriorityGroup["tone"],
    items: opportunities.filter((item) => item.priority === priority),
  })).filter((group) => group.items.length > 0);
}

export function getCategoryDeltaTone(
  change: number | null,
): "positive" | "warning" | "neutral" {
  if (change === null) return "neutral";
  if (change > 0) return "positive";
  if (change < 0) return "warning";
  return "neutral";
}

export function categoryIconKey(categoryName: string): string {
  const normalized = categoryName.toLowerCase();
  if (normalized.includes("security") || normalized.includes("compliance")) return "security";
  if (normalized.includes("backup") || normalized.includes("data") || normalized.includes("recovery")) {
    return "data";
  }
  if (normalized.includes("infrastructure") || normalized.includes("network")) {
    return "infrastructure";
  }
  if (normalized.includes("endpoint") || normalized.includes("operation")) return "operations";
  if (normalized.includes("document")) return "documentation";
  if (normalized.includes("continuity") || normalized.includes("bc") || normalized.includes("dr")) {
    return "continuity";
  }
  if (normalized.includes("strategic") || normalized.includes("planning")) return "strategy";
  if (normalized.includes("application") || normalized.includes("productiv")) return "apps";
  return "default";
}

export function summarizeCategoryImprovement(row: QbrCategoryImprovement): string {
  if (row.change === null) {
    return "Score history is still building for this category.";
  }
  if (row.change > 0) {
    return `Improved ${row.change} point${row.change === 1 ? "" : "s"} since the last review.`;
  }
  if (row.change < 0) {
    return `Declined ${Math.abs(row.change)} point${Math.abs(row.change) === 1 ? "" : "s"} — needs attention.`;
  }
  return "Held steady versus the prior period.";
}

export function roadmapPhaseTone(
  status?: string,
): "completed" | "in_progress" | "awaiting" | "future" {
  const normalized = (status ?? "").toLowerCase();
  if (normalized.includes("complete")) return "completed";
  if (normalized.includes("progress") || normalized.includes("active")) return "in_progress";
  if (normalized.includes("await") || normalized.includes("approval") || normalized.includes("proposed")) {
    return "awaiting";
  }
  return "future";
}

export function roadmapPhaseLabel(status?: string): string {
  const tone = roadmapPhaseTone(status);
  switch (tone) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "awaiting":
      return "Awaiting Approval";
    default:
      return status ? status.replaceAll("_", " ") : "Future";
  }
}
