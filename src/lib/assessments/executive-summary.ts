import type { Priority } from "@/generated/prisma/client";
import {
  MATURITY_TIER_DESCRIPTIONS,
  MATURITY_TIER_LABELS,
  getMaturityTier,
} from "@/lib/scoring/maturity";
import { sortByRecommendationPriority } from "@/lib/recommendations/display";

export type ExecutiveSummaryRecommendation = {
  title: string;
  priority: Priority;
};

export type BuildAssessmentExecutiveSummaryInput = {
  clientName?: string;
  overallScore: number;
  overallRatingLabel: string;
  hasCriticalExposure: boolean;
  strengths: string[];
  risks: string[];
  topRecommendations: ExecutiveSummaryRecommendation[];
  projectedScore?: number;
  /** When omitted, derived from overallScore via DOC-113 maturity tiers. */
  maturityTierLabel?: string;
};

function formatNaturalList(items: string[]): string {
  const filtered = items.filter(Boolean);
  if (filtered.length === 0) return "";
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;
  return `${filtered.slice(0, -1).join(", ")}, and ${filtered[filtered.length - 1]}`;
}

function subjectPhrase(clientName?: string): string {
  if (clientName?.trim()) {
    return `${clientName.trim()}'s organization`;
  }
  return "This organization";
}

function recommendationTopic(title: string): string {
  return title.trim().replace(/\?+$/, "").toLowerCase();
}

function buildOpeningParagraph(input: BuildAssessmentExecutiveSummaryInput): string {
  const tier = getMaturityTier(input.overallScore);
  const maturityLabel = input.maturityTierLabel ?? MATURITY_TIER_LABELS[tier];
  const maturityDescription = MATURITY_TIER_DESCRIPTIONS[tier].toLowerCase();
  const subject = subjectPhrase(input.clientName);

  return `${subject} currently reflects a ${maturityLabel.toLowerCase()} level of technology health. ${maturityDescription.charAt(0).toUpperCase()}${maturityDescription.slice(1)} The overall StackScore of ${input.overallScore} places the environment in the ${input.overallRatingLabel.toLowerCase()} range, establishing a clear baseline for improvement planning.`;
}

function buildStrengthsParagraph(strengths: string[]): string {
  const pillars = strengths.slice(0, 3);
  const pillarList = formatNaturalList(pillars);

  if (pillars.length === 1) {
    return `${pillars[0]} represents the strongest area of the technology environment and provides a practical foundation to extend improvements into weaker domains.`;
  }

  return `Relative strengths appear in ${pillarList}. These pillars scored highest in the assessment and can serve as anchors while attention shifts to higher-risk areas.`;
}

function buildRisksParagraph(input: BuildAssessmentExecutiveSummaryInput): string {
  const risks = input.risks.slice(0, 3);

  if (risks.length === 0) {
    return input.hasCriticalExposure
      ? "Although no single pillar dominated the risk profile, the assessment flagged critical security or recovery gaps that should be treated as immediate priorities."
      : "No single technology pillar dominated the risk profile, though continued attention across all domains will support steady maturity gains.";
  }

  const riskList = formatNaturalList(risks);
  let paragraph =
    risks.length === 1
      ? `The greatest concern is ${risks[0]}, where maturity lagged relative to the rest of the environment.`
      : `The highest-risk areas are ${riskList}, where maturity scores indicate the greatest exposure to operational or security disruption.`;

  if (input.hasCriticalExposure) {
    paragraph +=
      " The assessment also identified critical security or recovery gaps that warrant prompt remediation before broader initiatives proceed.";
  }

  return paragraph;
}

function buildRecommendationsParagraph(
  recommendations: ExecutiveSummaryRecommendation[],
): string {
  const prioritized = sortByRecommendationPriority(
    recommendations.map((recommendation, index) => ({
      ...recommendation,
      estimatedImpactPoints: recommendations.length - index,
    })),
  ).slice(0, 5);

  if (prioritized.length === 0) {
    return "";
  }

  const topics = prioritized.map((recommendation) => recommendationTopic(recommendation.title));
  const topicList = formatNaturalList(topics);
  const hasUrgent = prioritized.some(
    (recommendation) =>
      recommendation.priority === "critical" || recommendation.priority === "high",
  );

  if (prioritized.length === 1) {
    return hasUrgent
      ? `The most urgent improvement opportunity is ${topicList}, which should be addressed in the near term to reduce exposure.`
      : `A key improvement opportunity is ${topicList}, which would strengthen overall technology maturity when addressed.`;
  }

  const opener = hasUrgent
    ? "Near-term priorities should focus on"
    : "Recommended improvements include";

  return `${opener} ${topicList}. These items represent the highest-impact opportunities identified during the assessment and are sequenced to deliver the strongest maturity gains first.`;
}

function buildProjectionParagraph(input: BuildAssessmentExecutiveSummaryInput): string {
  const projectedScore = input.projectedScore ?? input.overallScore;
  const gain = projectedScore - input.overallScore;

  if (gain <= 0) {
    return "Addressing the recommendations in this report will help sustain current maturity levels and reduce residual risk across the environment.";
  }

  return `If the prioritized recommendations in this report are implemented, the StackScore could improve from ${input.overallScore} to ${projectedScore}, a gain of ${gain} point${gain === 1 ? "" : "s"}. That trajectory moves the organization meaningfully toward the 80+ maturity threshold associated with reliable, well-governed technology operations.`;
}

function buildClosingParagraph(): string {
  return "This report is designed to support informed leadership decisions and forms the basis of your upcoming Technology Assessment Strategy Session, where we will review these findings together and align on a practical path forward.";
}

export function buildAssessmentExecutiveSummary(
  input: BuildAssessmentExecutiveSummaryInput,
): string {
  const paragraphs = [buildOpeningParagraph(input)];

  if (input.strengths.length > 0) {
    paragraphs.push(buildStrengthsParagraph(input.strengths));
  }

  paragraphs.push(buildRisksParagraph(input));

  const recommendationsParagraph = buildRecommendationsParagraph(input.topRecommendations);
  if (recommendationsParagraph) {
    paragraphs.push(recommendationsParagraph);
  }

  paragraphs.push(buildProjectionParagraph(input));
  paragraphs.push(buildClosingParagraph());

  return paragraphs.join("\n\n");
}

/** @deprecated Use buildAssessmentExecutiveSummary */
export const buildExecutiveSummary = buildAssessmentExecutiveSummary;
