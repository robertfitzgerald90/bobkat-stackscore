import { describe, expect, it } from "vitest";
import {
  calculateProjectionImpacts,
  evaluateTriggers,
  type TriggeredResponse,
} from "@/lib/recommendations";
import { generateRecommendations } from "@/lib/recommendations/generate";
import {
  getPriorityTimeline,
  groupRecommendationsByPriority,
  sortByRecommendationPriority,
} from "@/lib/recommendations/display";

describe("recommendation engine", () => {
  it("returns empty array when no triggers match", () => {
    expect(evaluateTriggers([])).toEqual([]);
  });

  it("calculates zero projection impact for empty recommendations", () => {
    expect(calculateProjectionImpacts([])).toBe(0);
  });

  it("triggers MFA recommendation when answer is No", () => {
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

    const result = evaluateTriggers(responses);
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toContain("Multi-Factor Authentication");
    expect(result[0]?.priority).toBe("critical");
    expect(result[0]?.estimatedImpactPoints).toBe(8);
    expect(result[0]?.businessImpact).toContain("compromised");
  });

  it("triggers partial-score admin MFA when alsoTriggerOnPartial applies", () => {
    const responses: TriggeredResponse[] = [
      {
        questionCode: "Q02",
        answerText: "Partial",
        scoreValue: 1,
        weight: 3,
        templateCode: "SEC-MFA-ADMIN",
        triggersCriticalFlag: false,
      },
    ];

    const result = evaluateTriggers(responses);
    expect(result).toHaveLength(1);
    expect(result[0]?.templateCode).toBe("SEC-MFA-ADMIN");
  });

  it("consolidates related MFA templates into one program recommendation", () => {
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
        triggersCriticalFlag: false,
      },
    ];

    const result = evaluateTriggers(responses);
    expect(result).toHaveLength(1);
    expect(result[0]?.templateCode).toBe("CONSOL-M365-SECURITY");
    expect(result[0]?.isConsolidated).toBe(true);
    expect(result[0]?.estimatedImpactPoints).toBe(12);
  });

  it("sorts by priority then estimated impact points", () => {
    const sorted = sortByRecommendationPriority([
      {
        priority: "medium",
        estimatedImpactPoints: 10,
        templateCode: "a",
        consolidationGroupId: null,
        title: "a",
        description: "",
        businessImpact: "",
        suggestedService: "",
        categoryName: "Security",
        isConsolidated: false,
      },
      {
        priority: "critical",
        estimatedImpactPoints: 4,
        templateCode: "b",
        consolidationGroupId: null,
        title: "b",
        description: "",
        businessImpact: "",
        suggestedService: "",
        categoryName: "Security",
        isConsolidated: false,
      },
      {
        priority: "critical",
        estimatedImpactPoints: 12,
        templateCode: "c",
        consolidationGroupId: null,
        title: "c",
        description: "",
        businessImpact: "",
        suggestedService: "",
        categoryName: "Security",
        isConsolidated: false,
      },
    ]);

    expect(sorted.map((item) => item.templateCode)).toEqual(["c", "b", "a"]);
  });

  it("deduplicates projection impact per category using max points", () => {
    const impact = calculateProjectionImpacts([
      {
        templateCode: "SEC-MFA-ALL",
        consolidationGroupId: null,
        title: "MFA",
        description: "",
        businessImpact: "",
        suggestedService: "",
        priority: "critical",
        estimatedImpactPoints: 8,
        categoryName: "Security & Protection",
        isConsolidated: false,
      },
      {
        templateCode: "SEC-ENDPOINT-DEPLOY",
        consolidationGroupId: null,
        title: "Endpoint",
        description: "",
        businessImpact: "",
        suggestedService: "",
        priority: "critical",
        estimatedImpactPoints: 10,
        categoryName: "Security & Protection",
        isConsolidated: false,
      },
      {
        templateCode: "BKP-SERVER",
        consolidationGroupId: null,
        title: "Backup",
        description: "",
        businessImpact: "",
        suggestedService: "",
        priority: "critical",
        estimatedImpactPoints: 6,
        categoryName: "Backup & Recovery",
        isConsolidated: false,
      },
    ]);

    expect(impact).toBe(16);
  });

  it("exposes DOC-112 priority timelines", () => {
    expect(getPriorityTimeline("critical")).toBe("0-30 days");
    expect(getPriorityTimeline("low")).toBe("180+ days");
  });

  it("groups recommendations by priority for display", () => {
    const groups = groupRecommendationsByPriority([
      { priority: "high", id: "1" },
      { priority: "critical", id: "2" },
      { priority: "low", id: "3" },
    ]);

    expect(groups.map((group) => group.priority)).toEqual(["critical", "high", "low"]);
    expect(groups[0]?.items).toHaveLength(1);
  });

  it("generates recommendations and projected score from assessment responses", () => {
    const result = generateRecommendations(
      [
        {
          question: { code: "Q01", weight: 3 },
          scoreEarned: 0,
          selectedAnswerOption: {
            answerText: "No",
            triggersRecommendation: true,
            triggersCriticalFlag: true,
            recommendationTemplate: { code: "SEC-MFA-ALL" },
          },
        },
      ],
      42,
    );

    expect(result.recommendations).toHaveLength(1);
    expect(result.projectionImpact).toBe(8);
    expect(result.projectedScore).toBeGreaterThan(42);
  });
});
