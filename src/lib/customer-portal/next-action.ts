import { clientRecommendationsPath, clientTechnologyProfilePath } from "@/lib/clients/paths";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

export type CustomerNextAction = {
  label: string;
  description: string;
  href: string;
};

export function deriveCustomerNextAction(
  detail: TechnologyProfileDetail,
): CustomerNextAction | null {
  const { profile, draftAssessmentId, journey, openRecommendations } = detail;
  const clientId = profile.clientId;
  const dashboardHref = clientTechnologyProfilePath(clientId);
  const reportHref = profile.currentAssessmentId
    ? `/assessments/${profile.currentAssessmentId}/report`
    : null;

  if (draftAssessmentId) {
    return {
      label: "Resume Assessment",
      description: "Continue where you left off — your answers are saved automatically.",
      href: "/assessment/start",
    };
  }

  if (journey.assessmentsCompleted === 0) {
    return null;
  }

  if (reportHref) {
    return {
      label: "Review Assessment Report",
      description: "Read your executive report, maturity analysis, and prioritized recommendations.",
      href: reportHref,
    };
  }

  if (openRecommendations.length > 0) {
    return {
      label: "Review Top Priorities",
      description: "See the highest-impact opportunities identified in your assessment.",
      href: clientRecommendationsPath(clientId),
    };
  }

  return {
    label: "Return to Assessment Dashboard",
    description: "Review your current technology health summary and next steps.",
    href: dashboardHref,
  };
}
