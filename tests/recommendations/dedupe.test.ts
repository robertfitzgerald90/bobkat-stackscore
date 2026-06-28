import { describe, expect, it } from "vitest";
import {
  ACTIVE_RECOMMENDATION_STATUSES,
  buildDedupeKey,
  buildTriggerReason,
  buildTriggerReasonMap,
  resolveStatusOnRetrigger,
  shouldPreserveStatus,
  shouldReopenDeclinedRecommendation,
} from "@/lib/recommendations/dedupe";
import type { GeneratedRecommendation, TriggeredResponse } from "@/lib/recommendations";

describe("recommendation dedupe", () => {
  it("builds stable dedupe keys from template id", () => {
    expect(
      buildDedupeKey({
        recommendationTemplateId: "tpl-123",
        templateCode: "SEC-MFA-ALL",
      }),
    ).toBe("template:tpl-123");
  });

  it("falls back to category and template code when no template id", () => {
    expect(
      buildDedupeKey({
        templateCode: "CONSOL-M365-SECURITY",
        categoryId: "cat-security",
      }),
    ).toBe("category:cat-security:type:CONSOL-M365-SECURITY");
  });

  it("preserves accepted, in_progress, and deferred status on retrigger", () => {
    expect(resolveStatusOnRetrigger("accepted")).toBe("accepted");
    expect(resolveStatusOnRetrigger("in_progress")).toBe("in_progress");
    expect(resolveStatusOnRetrigger("deferred")).toBe("deferred");
    expect(resolveStatusOnRetrigger("open")).toBe("open");
  });

  it("only reopens declined recommendations for critical or high priority", () => {
    expect(shouldReopenDeclinedRecommendation("critical")).toBe(true);
    expect(shouldReopenDeclinedRecommendation("high")).toBe(true);
    expect(shouldReopenDeclinedRecommendation("medium")).toBe(false);
    expect(shouldReopenDeclinedRecommendation("low")).toBe(false);
  });

  it("builds trigger reason from matching responses", () => {
    const responses: TriggeredResponse[] = [
      {
        questionCode: "Q01",
        answerText: "No",
        scoreValue: 0,
        weight: 3,
        templateCode: "SEC-MFA-ALL",
        triggersCriticalFlag: true,
      },
    ];

    expect(buildTriggerReason(["SEC-MFA-ALL"], responses)).toBe("Q01: No");
  });

  it("aggregates member triggers for consolidated recommendations", () => {
    const generated: GeneratedRecommendation[] = [
      {
        templateCode: "CONSOL-M365-SECURITY",
        consolidationGroupId: "CONSOL-M365-SECURITY",
        title: "Microsoft 365 Security Hardening",
        description: "desc",
        businessImpact: "impact",
        suggestedService: "Microsoft 365 Protection",
        priority: "critical",
        estimatedImpactPoints: 12,
        categoryName: "Security",
        isConsolidated: true,
      },
    ];

    const responses: TriggeredResponse[] = [
      {
        questionCode: "Q01",
        answerText: "No",
        scoreValue: 0,
        weight: 3,
        templateCode: "SEC-MFA-ALL",
        triggersCriticalFlag: true,
      },
      {
        questionCode: "Q02",
        answerText: "No",
        scoreValue: 0,
        weight: 3,
        templateCode: "SEC-MFA-ADMIN",
        triggersCriticalFlag: true,
      },
    ];

    const reasons = buildTriggerReasonMap(generated, responses);
    expect(reasons.get("CONSOL-M365-SECURITY")).toBe("Q01: No; Q02: No");
  });

  it("defines active statuses used for uniqueness", () => {
    expect(ACTIVE_RECOMMENDATION_STATUSES).toContain("deferred");
    expect(shouldPreserveStatus("deferred")).toBe(true);
  });
});
