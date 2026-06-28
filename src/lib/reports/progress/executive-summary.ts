import type { ProgressReportData } from "@/lib/reports/progress/types";

export function buildProgressExecutiveSummary(
  data: Pick<
    ProgressReportData,
    | "clientName"
    | "reportPeriodLabel"
    | "scoreChange"
    | "previousStackScore"
    | "currentStackScore"
    | "completedProjectsSinceAssessment"
    | "activeProjectCount"
    | "openRecommendationsCount"
    | "categoryChanges"
    | "nextSteps"
  >,
): string {
  const improvedCategories = data.categoryChanges
    .filter((row) => row.change !== null && row.change > 0)
    .slice(0, 2)
    .map((row) => row.categoryName.toLowerCase());

  const scorePhrase =
    data.scoreChange !== null && data.currentStackScore !== null
      ? data.scoreChange > 0
        ? `StackScore improved by ${data.scoreChange} points to ${data.currentStackScore} ${data.reportPeriodLabel.toLowerCase()}.`
        : data.scoreChange < 0
          ? `StackScore declined by ${Math.abs(data.scoreChange)} points to ${data.currentStackScore} ${data.reportPeriodLabel.toLowerCase()}.`
          : `StackScore held steady at ${data.currentStackScore} ${data.reportPeriodLabel.toLowerCase()}.`
      : data.currentStackScore !== null
        ? `Current StackScore is ${data.currentStackScore}.`
        : "Technology progress is being tracked for this client.";

  const completedCount = data.completedProjectsSinceAssessment.length;
  const deliveryPhrase =
    completedCount > 0
      ? `${completedCount} improvement project${completedCount === 1 ? "" : "s"} completed ${data.reportPeriodLabel.toLowerCase()}, with ${data.activeProjectCount} still in progress.`
      : data.activeProjectCount > 0
        ? `${data.activeProjectCount} improvement project${data.activeProjectCount === 1 ? "" : "s"} remain in progress.`
        : "Implementation work is planned through the active improvement roadmap.";

  const categoryPhrase =
    improvedCategories.length > 0
      ? ` Strongest movement appeared in ${improvedCategories.join(" and ")}.`
      : "";

  const openPhrase =
    data.openRecommendationsCount > 0
      ? ` ${data.openRecommendationsCount} prioritized improvement${data.openRecommendationsCount === 1 ? "" : "s"} remain open.`
      : " The client is positioned to focus on optimization and maintenance.";

  const nextStepPhrase =
    data.nextSteps.length > 0
      ? ` Recommended next focus: ${data.nextSteps[0]?.toLowerCase() ?? "continue the improvement roadmap"}.`
      : "";

  return `${data.clientName}'s technology environment continues to evolve. ${scorePhrase} ${deliveryPhrase}${categoryPhrase}${openPhrase}${nextStepPhrase}`;
}
