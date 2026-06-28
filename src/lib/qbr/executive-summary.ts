import type { QbrReportData } from "@/lib/qbr/types";

export function buildQbrExecutiveSummary(data: Pick<
  QbrReportData,
  | "clientName"
  | "reviewPeriodLabel"
  | "scoreAtPeriodStart"
  | "scoreAtPeriodEnd"
  | "scoreChange"
  | "projectsCompletedInPeriod"
  | "recommendationsResolvedInPeriod"
  | "assessmentsCompletedInPeriod"
  | "completedProjects"
  | "resolvedRecommendations"
  | "remainingOpportunities"
  | "categoryImprovements"
  | "businessGoalLabel"
  | "nextQuarterPriorities"
>): string {
  const improvedCategories = data.categoryImprovements
    .filter((row) => row.change !== null && row.change > 0)
    .slice(0, 2)
    .map((row) => row.categoryName.toLowerCase());

  const scorePhrase =
    data.scoreChange !== null && data.scoreAtPeriodEnd !== null
      ? data.scoreChange > 0
        ? `Technology Profile improved by ${data.scoreChange} points to ${data.scoreAtPeriodEnd}.`
        : data.scoreChange < 0
          ? `Technology Profile declined by ${Math.abs(data.scoreChange)} points to ${data.scoreAtPeriodEnd}.`
          : `Technology Profile held steady at ${data.scoreAtPeriodEnd}.`
      : data.scoreAtPeriodEnd !== null
        ? `Current Technology Profile score is ${data.scoreAtPeriodEnd}.`
        : "Technology progress was documented this quarter.";

  const deliveryParts: string[] = [];
  if (data.projectsCompletedInPeriod > 0) {
    deliveryParts.push(
      `${data.projectsCompletedInPeriod} project${
        data.projectsCompletedInPeriod === 1 ? "" : "s"
      } completed`,
    );
  }
  if (data.recommendationsResolvedInPeriod > 0) {
    deliveryParts.push(
      `${data.recommendationsResolvedInPeriod} recommendation${
        data.recommendationsResolvedInPeriod === 1 ? "" : "s"
      } resolved`,
    );
  }
  if (data.assessmentsCompletedInPeriod > 0) {
    deliveryParts.push(
      `${data.assessmentsCompletedInPeriod} assessment${
        data.assessmentsCompletedInPeriod === 1 ? "" : "s"
      } completed`,
    );
  }

  const deliveryPhrase =
    deliveryParts.length > 0
      ? `BobKat IT delivered measurable progress through ${deliveryParts.join(", ")}.`
      : "BobKat IT continued advisory and planning support to strengthen the client's technology foundation.";

  const categoryPhrase =
    improvedCategories.length > 0
      ? ` Strongest gains appeared in ${improvedCategories.join(" and ")}.`
      : "";

  const goalPhrase = data.businessGoalLabel
    ? ` This work supports the client's stated goal to ${data.businessGoalLabel.toLowerCase()}.`
    : "";

  const openCount = data.remainingOpportunities.length;
  const priorityPhrase =
    openCount > 0
      ? ` ${openCount} prioritized improvement${
          openCount === 1 ? "" : "s"
        } remain for the next quarter.`
      : " The client is well positioned to focus on optimization and maintenance next quarter.";

  const nextStep =
    data.nextQuarterPriorities[0] ??
    (openCount > 0 ? data.remainingOpportunities[0]?.title : null);
  const nextPhrase = nextStep ? ` Next priority: ${nextStep}.` : "";

  return `During ${data.reviewPeriodLabel}, ${data.clientName}'s ${scorePhrase} ${deliveryPhrase}${categoryPhrase}${goalPhrase}${priorityPhrase}${nextPhrase}`;
}
