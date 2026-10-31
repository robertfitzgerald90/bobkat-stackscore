import type { Priority } from "@/generated/prisma/client";
import {
  getTechnologyMaturityLevel,
  TECHNOLOGY_MATURITY_LEVEL_DESCRIPTIONS,
} from "@/lib/scoring/v2/maturity-level";
import { sortByRecommendationPriority } from "@/lib/recommendations/display";
import { hasUnpublishedStubTitle } from "@/lib/recommendations/visibility";
import { buildCustomerOpportunityFollowThroughParagraph } from "@/lib/assessments/customer-trust";

export type ExecutiveSummaryRecommendation = {
  title: string;
  priority: Priority;
};

export type BuildAssessmentExecutiveSummaryInput = {
  clientName?: string;
  overallScore: number;
  /** Retained for callers; opening copy uses DOC-119 maturity only (SS-REL-013). */
  overallRatingLabel: string;
  hasCriticalExposure: boolean;
  strengths: string[];
  risks: string[];
  topRecommendations: ExecutiveSummaryRecommendation[];
  projectedScore?: number;
  /**
   * When false (customer surfaces), omit catalog-impact projected StackScore figures (SS-REL-015).
   * Defaults to true for staff/internal narrative compatibility.
   */
  includeCatalogProjectedMaturity?: boolean;
  /** When omitted, derived from overallScore via DOC-119 maturity levels. */
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
    return `${clientName.trim()}`;
  }
  return "This organization";
}

/** English indefinite article before a maturity label ("an initial", "a basic"). */
function indefiniteArticleFor(word: string): "a" | "an" {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}

/**
 * Normalize recommendation titles for executive prose.
 * Drops unfinished stub titles and strips mechanical "Improve {Pillar}:" prefixes.
 */
export function recommendationTopic(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) return null;
  if (hasUnpublishedStubTitle(trimmed)) return null;

  const topic = trimmed
    .replace(/^Improve\s+[^:]+:\s*/i, "")
    .replace(/\?+$/, "")
    .trim();

  // Reject leftover raw question stems.
  if (/^(is|are|do|does|did|has|have|can|should|will)\b/i.test(topic)) {
    return null;
  }

  if (topic.length < 8) return null;

  // Prefer sentence-case for imperative titles already written as recommendations.
  if (/^[A-Z]/.test(topic) && !topic.includes(":")) {
    return topic.charAt(0).toLowerCase() + topic.slice(1);
  }

  return topic.toLowerCase();
}

function buildOpeningParagraph(input: BuildAssessmentExecutiveSummaryInput): string {
  const level = getTechnologyMaturityLevel(input.overallScore);
  const maturityLabel = input.maturityTierLabel ?? level.label;
  const maturityDescription = TECHNOLOGY_MATURITY_LEVEL_DESCRIPTIONS[level.code];
  const subject = subjectPhrase(input.clientName);

  const maturityLower = maturityLabel.toLowerCase();
  const article = indefiniteArticleFor(maturityLower);
  return `${subject} currently reflects ${article} ${maturityLower} level of technology maturity. ${maturityDescription} The overall StackScore of ${input.overallScore} establishes a clear baseline for improvement planning.`;
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

  const topics = prioritized
    .map((recommendation) => recommendationTopic(recommendation.title))
    .filter((topic): topic is string => Boolean(topic));

  if (topics.length === 0) {
    return "Priority improvement opportunities from this assessment should be reviewed with Bobkat IT to confirm sequencing, ownership, and implementation scope.";
  }

  const topicList = formatNaturalList(topics);
  const hasUrgent = prioritized.some(
    (recommendation) =>
      recommendation.priority === "critical" || recommendation.priority === "high",
  );

  if (topics.length === 1) {
    return hasUrgent
      ? `The most urgent improvement opportunity is ${topicList}, which should be addressed in the near term to reduce exposure.`
      : `A key improvement opportunity is ${topicList}, which would strengthen overall technology maturity when addressed.`;
  }

  const opener = hasUrgent
    ? "Near-term priorities should focus on"
    : "Recommended improvements include";

  return `${opener} ${topicList}. These items represent the highest-priority opportunities identified during the assessment and provide a practical starting point for remediation planning.`;
}

function buildProjectionParagraph(input: BuildAssessmentExecutiveSummaryInput): string {
  if (input.includeCatalogProjectedMaturity === false) {
    return buildCustomerOpportunityFollowThroughParagraph();
  }

  const projectedScore = input.projectedScore ?? input.overallScore;
  const gain = projectedScore - input.overallScore;

  if (gain <= 0) {
    return "Addressing the recommendations in this report will help sustain current maturity levels and reduce residual risk across the environment. Actual outcomes depend on implementation quality, sequencing, and organizational follow-through.";
  }

  const projectedLevel = getTechnologyMaturityLevel(projectedScore);
  let trajectory: string;
  if (projectedScore >= 80) {
    trajectory = `That trajectory would place the organization in the ${projectedLevel.label.toLowerCase()} maturity band on the StackScore scale, subject to successful implementation.`;
  } else if (projectedScore >= 70) {
    trajectory = `That trajectory would move the organization toward the managed maturity band associated with more consistent technology operations, subject to successful implementation.`;
  } else {
    trajectory = `That trajectory would strengthen the foundation for further maturity gains; additional approved initiatives would be required to reach higher maturity bands.`;
  }

  return `If the prioritized recommendations in this report are implemented, the StackScore could improve from ${input.overallScore} to ${projectedScore}, a potential gain of ${gain} point${gain === 1 ? "" : "s"}. ${trajectory}`;
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
