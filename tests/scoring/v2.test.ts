import { describe, expect, it } from "vitest";
import {
  calculateOverallStackScore,
  calculatePillarScore,
  calculateV2Scores,
  getTechnologyMaturityLevel,
  normalizeAnswerScore,
} from "@/lib/scoring/v2";

describe("scoring v2 (DOC-119)", () => {
  it("normalizes standard answers", () => {
    expect(normalizeAnswerScore("Yes")).toBe(100);
    expect(normalizeAnswerScore("Partially")).toBe(50);
    expect(normalizeAnswerScore("No")).toBe(0);
    expect(normalizeAnswerScore("Not Applicable")).toBeNull();
  });

  it("calculates weighted pillar score excluding N/A", () => {
    const questions = [
      { id: "IA-001", pillarCode: "identity_access" as const, weight: 5 },
      { id: "IA-002", pillarCode: "identity_access" as const, weight: 5 },
    ];
    const responses = new Map([
      ["IA-001", { questionId: "IA-001", answerText: "Yes" }],
      ["IA-002", { questionId: "IA-002", answerText: "No" }],
    ]);

    const result = calculatePillarScore("identity_access", questions, responses);
    expect(result.status).toBe("complete");
    expect(result.percentScore).toBe(50);
    expect(result.maturityLevel?.label).toBe("Basic");
  });

  it("marks incomplete pillar when questions are unanswered", () => {
    const questions = [
      { id: "IA-001", pillarCode: "identity_access" as const, weight: 5 },
      { id: "IA-002", pillarCode: "identity_access" as const, weight: 3 },
    ];
    const responses = new Map([
      ["IA-001", { questionId: "IA-001", answerText: "No" }],
    ]);

    const result = calculatePillarScore("identity_access", questions, responses);
    expect(result.status).toBe("incomplete");
    expect(result.percentScore).toBeNull();
  });

  it("renormalizes overall StackScore over complete pillars only", () => {
    const pillarScores = [
      {
        pillarCode: "identity_access" as const,
        status: "complete" as const,
        percentScore: 80,
        maturityLevel: getTechnologyMaturityLevel(80),
        questionsTotal: 10,
        questionsAnswered: 10,
        scorableWeightTotal: 10,
        weightedPointsEarned: 800,
      },
      {
        pillarCode: "endpoint_management" as const,
        status: "complete" as const,
        percentScore: 60,
        maturityLevel: getTechnologyMaturityLevel(60),
        questionsTotal: 10,
        questionsAnswered: 10,
        scorableWeightTotal: 10,
        weightedPointsEarned: 600,
      },
      {
        pillarCode: "network_connectivity" as const,
        status: "incomplete" as const,
        percentScore: null,
        maturityLevel: null,
        questionsTotal: 10,
        questionsAnswered: 2,
        scorableWeightTotal: 0,
        weightedPointsEarned: 0,
      },
    ];

    expect(calculateOverallStackScore(pillarScores)).toBe(70);
  });

  it("returns null overall when no pillars are complete", () => {
    const result = calculateV2Scores({
      questions: [{ id: "IA-001", pillarCode: "identity_access", weight: 5 }],
      responses: [],
      pillarCodes: ["identity_access"],
    });
    expect(result.overallStackScore).toBeNull();
    expect(result.completePillarCount).toBe(0);
  });

  it("maps DOC-119 maturity bands", () => {
    expect(getTechnologyMaturityLevel(96).label).toBe("Optimized");
    expect(getTechnologyMaturityLevel(90).label).toBe("Mature");
    expect(getTechnologyMaturityLevel(75).label).toBe("Managed");
    expect(getTechnologyMaturityLevel(60).label).toBe("Developing");
    expect(getTechnologyMaturityLevel(45).label).toBe("Basic");
    expect(getTechnologyMaturityLevel(20).label).toBe("Initial");
  });
});
