import { deriveCustomerNextAction } from "@/lib/customer-portal/next-action";
import { PRIORITY_LABELS } from "@/lib/display";
import { executiveKpiLabel, executiveRiskLabel, greetingForHour } from "@/lib/executive-os/business-language";
import { conciseFocusTitle } from "@/lib/client-workspace";
import { takeTopRecommendations } from "@/lib/recommendations/sort";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

export type BriefingChangeItem = {
  tone: "positive" | "attention" | "neutral";
  message: string;
};

export type ExecutiveBriefingModel = {
  greeting: string;
  welcomeName: string;
  companyName: string;
  headline: string;
  changes: BriefingChangeItem[];
  overallHealthScore: number | null;
  overallHealthMax: number;
  maturityTrend: string | null;
  riskTrend: string | null;
  recommendedAction: {
    title: string;
    businessImpact: string;
    effort: string;
  } | null;
};

function effortFromPriority(priority: string): string {
  switch (priority) {
    case "critical":
    case "high":
      return "Medium–High";
    case "medium":
      return "Medium";
    default:
      return "Low–Medium";
  }
}

function impactFromPriority(priority: string): string {
  switch (priority) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Moderate";
    default:
      return "Focused";
  }
}

export function buildExecutiveBriefing(
  detail: TechnologyProfileDetail,
  companyName: string,
  welcomeName: string,
  now = new Date(),
): ExecutiveBriefingModel {
  const {
    profile,
    pillarInsights,
    openRecommendations,
    journeyScores,
    scoreDeltaSincePrevious,
  } = detail;

  const score = profile.overallStackScore;
  const changes: BriefingChangeItem[] = [];
  const hasAssessment = detail.journey.assessmentsCompleted > 0;

  if (!hasAssessment) {
    return {
      greeting: greetingForHour(now.getHours()),
      welcomeName,
      companyName,
      headline: "Your executive technology briefing is ready when you complete your first assessment.",
      changes: [],
      overallHealthScore: null,
      overallHealthMax: 100,
      maturityTrend: null,
      riskTrend: null,
      recommendedAction: {
        title: "Start your Technology Maturity Assessment",
        businessImpact: "Establish your baseline StackScore and strategic priorities",
        effort: "One-time assessment",
      },
    };
  }

  for (const pillar of pillarInsights) {
    if (pillar.trendDelta === null || pillar.trendDelta === 0) continue;
    const label = executiveKpiLabel(pillar.pillarCode, pillar.pillarName);
    if (pillar.trendDelta > 0) {
      changes.push({
        tone: "positive",
        message: `${label} improved`,
      });
    } else if (pillar.trendDelta < -2) {
      changes.push({
        tone: "attention",
        message: `${label} needs attention`,
      });
    }
  }

  if (scoreDeltaSincePrevious !== null && scoreDeltaSincePrevious > 0) {
    changes.push({
      tone: "positive",
      message: "Overall technology health continues to trend upward",
    });
  }

  const topPriority = takeTopRecommendations(openRecommendations, 1)[0];
  if (topPriority && (topPriority.priority === "critical" || topPriority.priority === "high")) {
    changes.push({
      tone: "attention",
      message: `One ${PRIORITY_LABELS[topPriority.priority].toLowerCase()}-priority recommendation requires attention`,
    });
  }

  if (changes.length === 0) {
    changes.push({
      tone: "neutral",
      message: "Technology posture is stable since your last review",
    });
  }

  const maturityTrend =
    scoreDeltaSincePrevious !== null && scoreDeltaSincePrevious > 0
      ? "Technology maturity continues to trend upward."
      : scoreDeltaSincePrevious !== null && scoreDeltaSincePrevious < 0
        ? "Review recent changes to restore momentum."
        : "Technology maturity is holding steady.";

  const riskLevel = executiveRiskLabel(score);
  const riskTrend =
    score !== null && score >= 70
      ? "Business risk continues to decrease."
      : score !== null
        ? "Addressing open priorities will reduce business exposure."
        : null;

  const nextAction = deriveCustomerNextAction(detail);
  const recommendedAction = topPriority
    ? {
        title: conciseFocusTitle(topPriority.title),
        businessImpact: impactFromPriority(topPriority.priority),
        effort: effortFromPriority(topPriority.priority),
      }
    : nextAction
      ? {
          title: nextAction.label,
          businessImpact: "Advances your technology strategy",
          effort: "Low",
        }
      : null;

  return {
    greeting: greetingForHour(now.getHours()),
    welcomeName,
    companyName,
    headline: "Here's what changed since your last review.",
    changes: changes.slice(0, 5),
    overallHealthScore: score,
    overallHealthMax: 100,
    maturityTrend,
    riskTrend,
    recommendedAction,
  };
}
