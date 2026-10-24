import type { UserRole } from "@/generated/prisma/client";
import { isStubRecommendationTemplate } from "@/lib/recommendations/stubs";

/**
 * Fields that stay on the consulting side of the portal (DOC-122 §10 / §12).
 * Trigger evidence exposes question/answer engine logic. Template and dedupe
 * keys are playbook / catalog identifiers. Assessor ids are staff metadata.
 */
const CLIENT_HIDDEN_RECOMMENDATION_KEYS = [
  "latestTriggerReason",
  "triggerReason",
  "templateCode",
  "recommendationTemplateId",
  "recommendationTemplate",
  "dedupeKey",
  "consolidationGroupId",
  "createdByUserId",
  "createdBy",
] as const;

export function isClientFacingRecommendationAudience(role: UserRole): boolean {
  return role === "client";
}

function resolveTemplateCode(recommendation: Record<string, unknown>): string | null {
  if (typeof recommendation.templateCode === "string") {
    return recommendation.templateCode;
  }
  const nested = recommendation.recommendationTemplate;
  if (nested && typeof nested === "object" && nested !== null && "code" in nested) {
    const code = (nested as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  // Some list serializers expose the catalog id only via recommendationTemplateId join;
  // stub detection requires a catalog code, so unknown codes are treated as non-deliverable
  // for clients when no template relation is present (fail closed for portal).
  return null;
}

/**
 * Mechanical pre-OPT-003 stub titles. Rows still carrying this pattern are not
 * approved customer copy even if the catalog template has been published.
 */
export function hasUnpublishedStubTitle(title: unknown): boolean {
  return typeof title === "string" && title.startsWith("Improve ");
}

/**
 * Stub catalog rows stay visible to consultants; they are withheld from client
 * portal delivery until SS-OPT-003 approves copy.
 */
export function isClientDeliverableRecommendation(
  recommendation: Record<string, unknown>,
  role: UserRole,
): boolean {
  if (!isClientFacingRecommendationAudience(role)) {
    return true;
  }
  // Fail closed: leftover generator stub titles must not ship as client copy.
  if (hasUnpublishedStubTitle(recommendation.title)) {
    return false;
  }
  const templateCode = resolveTemplateCode(recommendation);
  // Fail closed: without a resolvable template code, do not publish to clients.
  if (!templateCode) {
    return false;
  }
  return !isStubRecommendationTemplate(templateCode);
}

/**
 * Strips consulting-only recommendation fields for portal users.
 * Staff receive the record unchanged.
 */
export function presentRecommendationForRole<T extends Record<string, unknown>>(
  recommendation: T,
  role: UserRole,
): T {
  if (!isClientFacingRecommendationAudience(role)) {
    return recommendation;
  }

  const next = { ...recommendation } as T & Record<string, unknown>;
  for (const key of CLIENT_HIDDEN_RECOMMENDATION_KEYS) {
    if (key in next) {
      delete next[key];
    }
  }
  return next;
}

export function presentRecommendationsForRole<T extends Record<string, unknown>>(
  recommendations: T[],
  role: UserRole,
): T[] {
  const deliverable = filterClientDeliverableRecommendations(recommendations, role);
  if (!isClientFacingRecommendationAudience(role)) {
    return deliverable;
  }
  return deliverable.map((row) => presentRecommendationForRole(row, role));
}

/**
 * Fail-closed filter for client-facing exports (PDF, APIs, email payloads).
 * Staff/consultant audiences retain stub rows for internal review.
 */
export function filterClientDeliverableRecommendations<T extends Record<string, unknown>>(
  recommendations: T[],
  role: UserRole,
): T[] {
  return recommendations.filter((row) => isClientDeliverableRecommendation(row, role));
}
