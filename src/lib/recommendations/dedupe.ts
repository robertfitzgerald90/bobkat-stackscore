import type { Priority, RecommendationStatus } from "@/generated/prisma/client";
import catalog from "../../../data/RecommendationRuleCatalog.json";
import type { GeneratedRecommendation, TriggeredResponse } from "./engine";

/** Statuses that count as a single active recommendation per dedupe key. */
export const ACTIVE_RECOMMENDATION_STATUSES: RecommendationStatus[] = [
  "open",
  "accepted",
  "in_progress",
  "deferred",
];

/** Statuses preserved when the same issue retriggers on a new assessment. */
export const PRESERVED_RECOMMENDATION_STATUSES: RecommendationStatus[] = [
  "accepted",
  "in_progress",
  "deferred",
];

const HIGH_PRIORITY_REOPEN: Priority[] = ["critical", "high"];

export type DedupeKeyInput = {
  recommendationTemplateId?: string | null;
  templateCode: string;
  categoryId?: string;
};

/**
 * Stable per-client dedupe key. Uses catalog template code (e.g. REC-IA-001) when
 * available so keys are consistent across environments and DB migrations.
 */
export function buildDedupeKey(input: DedupeKeyInput): string {
  if (input.templateCode) {
    return `template:${input.templateCode}`;
  }
  if (input.categoryId) {
    return `category:${input.categoryId}:type:unknown`;
  }
  return "type:unknown";
}

export function shouldReopenDeclinedRecommendation(priority: Priority): boolean {
  return HIGH_PRIORITY_REOPEN.includes(priority);
}

export function shouldPreserveStatus(status: RecommendationStatus): boolean {
  return PRESERVED_RECOMMENDATION_STATUSES.includes(status);
}

export function resolveStatusOnRetrigger(
  currentStatus: RecommendationStatus,
): RecommendationStatus {
  if (shouldPreserveStatus(currentStatus)) {
    return currentStatus;
  }
  return "open";
}

/** Human-readable evidence for why a recommendation fired. */
export function buildTriggerReason(
  templateCodes: string[],
  triggeredResponses: TriggeredResponse[],
): string | null {
  const codeSet = new Set(templateCodes);
  const matches = triggeredResponses.filter((response) =>
    codeSet.has(response.templateCode),
  );
  if (matches.length === 0) {
    return null;
  }

  const parts = matches.map(
    (response) => `${response.questionCode}: ${response.answerText}`,
  );
  return parts.join("; ");
}

function memberTemplateCodes(recommendation: GeneratedRecommendation): string[] {
  if (!recommendation.isConsolidated) {
    return [recommendation.templateCode];
  }

  const group = catalog.consolidationGroups.find(
    (entry) => entry.id === recommendation.templateCode,
  );
  return group?.memberTemplateIds ?? [recommendation.templateCode];
}

export function buildTriggerReasonMap(
  generated: GeneratedRecommendation[],
  triggeredResponses: TriggeredResponse[],
): Map<string, string | null> {
  const map = new Map<string, string | null>();
  for (const recommendation of generated) {
    map.set(
      recommendation.templateCode,
      buildTriggerReason(memberTemplateCodes(recommendation), triggeredResponses),
    );
  }
  return map;
}
