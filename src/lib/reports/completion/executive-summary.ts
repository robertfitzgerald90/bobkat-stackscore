import { BRAND } from "@/lib/branding";
import type { CompletionReportData } from "@/lib/reports/completion/types";

export function buildCompletionExecutiveSummary(
  data: Pick<
    CompletionReportData,
    | "clientName"
    | "projectTitle"
    | "recommendationBusinessImpact"
    | "scoreChange"
    | "scoreAfter"
    | "actualImpactPoints"
    | "estimatedImpactPoints"
  >,
): string {
  const impactPhrase = data.recommendationBusinessImpact.trim()
    ? data.recommendationBusinessImpact.trim()
    : `Completed work on ${data.projectTitle.toLowerCase()} strengthens the client's technology foundation.`;

  const scorePhrase =
    data.scoreChange !== null && data.scoreAfter !== null
      ? data.scoreChange > 0
        ? ` Technology Maturity Profile improved by ${data.scoreChange} points to ${data.scoreAfter}.`
        : data.scoreChange === 0
          ? ` Technology Maturity Profile remains at ${data.scoreAfter}.`
          : ` Technology Maturity Profile is ${data.scoreAfter} following this engagement.`
      : "";

  const variancePhrase =
    data.estimatedImpactPoints !== null && data.actualImpactPoints !== null
      ? data.actualImpactPoints >= data.estimatedImpactPoints
        ? ` Delivered impact met or exceeded the projected +${data.estimatedImpactPoints} point improvement.`
        : ` Actual impact of +${data.actualImpactPoints} points was recorded against a projected +${data.estimatedImpactPoints} points.`
      : data.actualImpactPoints !== null
        ? ` Recorded impact: +${data.actualImpactPoints} StackScore points.`
        : "";

  return `${data.clientName} completed ${data.projectTitle}. ${impactPhrase}${scorePhrase}${variancePhrase} ${BRAND.companyName} remains available for warranty support and next-phase planning.`;
}

export function buildCompletionBusinessImpactBullets(
  data: Pick<
    CompletionReportData,
    | "projectTitle"
    | "recommendationBusinessImpact"
    | "scoreChange"
    | "categoryChanges"
  >,
): string[] {
  const bullets: string[] = [];

  if (data.recommendationBusinessImpact.trim()) {
    bullets.push(data.recommendationBusinessImpact.trim());
  }

  bullets.push(`Delivered initiative: ${data.projectTitle}`);

  const improvedCategories = data.categoryChanges
    .filter((row) => row.change !== null && row.change > 0)
    .slice(0, 3)
    .map((row) => `${row.categoryName} improved by ${row.change} points`);

  bullets.push(...improvedCategories);

  if (data.scoreChange !== null && data.scoreChange > 0) {
    bullets.push(`Overall StackScore increased by ${data.scoreChange} points`);
  }

  if (bullets.length === 0) {
    bullets.push("Completed work reduces operational risk and strengthens business continuity.");
  }

  return bullets.slice(0, 6);
}

export const DEFAULT_WARRANTY_NOTES = [
  `${BRAND.companyName} provides warranty support for delivered work per the approved statement of work.`,
  "Report defects or service issues promptly so remediation can be scheduled without disrupting business operations.",
  "Warranty coverage applies to implemented scope only and excludes unrelated third-party changes.",
];
