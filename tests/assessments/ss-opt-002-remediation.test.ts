import { describe, expect, it } from "vitest";
import { evaluateV2CompletionGuards } from "@/lib/assessments/completion-guards";
import {
  ASSESSMENT_INCOMPLETE_LABEL,
  calculateV2Scores,
  getTechnologyMaturityLevel,
  isRecognizedV2Answer,
  normalizeAnswerScore,
} from "@/lib/scoring/v2";
import { getMaturityTier, getMaturityTierLabel } from "@/lib/scoring/maturity";
import { buildRiskSummaryFromPriorities } from "@/lib/recommendations/risk-summary";
import {
  isStubRecommendationTemplate,
  filterOutStubRecommendations,
} from "@/lib/recommendations/stubs";
import { presentRecommendationsForRole } from "@/lib/recommendations/visibility";
import { buildDedupeKey } from "@/lib/recommendations/dedupe";
import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";

const PILLARS = TECHNOLOGY_PILLARS.map((pillar) => pillar.code);

function questionsForPillars(
  perPillar: number,
): Array<{ id: string; pillarCode: TechnologyPillarCode; weight: number }> {
  const questions: Array<{ id: string; pillarCode: TechnologyPillarCode; weight: number }> = [];
  for (const pillarCode of PILLARS) {
    for (let index = 0; index < perPillar; index += 1) {
      questions.push({
        id: `${pillarCode}-${index}`,
        pillarCode,
        weight: 3,
      });
    }
  }
  return questions;
}

describe("SS-OPT-002 completion guards", () => {
  const questions = questionsForPillars(1);

  it("rejects zero-answer completion attempts", () => {
    const result = evaluateV2CompletionGuards({
      unansweredCount: questions.length,
      responses: [],
      questions,
      scoringResponses: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/remain unanswered/i);
      expect(result.message).toContain(String(questions.length));
    }
  });

  it("rejects one-answer completion attempts", () => {
    const result = evaluateV2CompletionGuards({
      unansweredCount: questions.length - 1,
      responses: [{ questionCode: questions[0].id, answerText: "Yes" }],
      questions,
      scoringResponses: [{ questionId: questions[0].id, answerText: "Yes" }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/remain unanswered/i);
    }
  });

  it("accepts fully answered assessments with a numeric overall", () => {
    const responses = questions.map((question) => ({
      questionCode: question.id,
      answerText: "Yes" as const,
    }));
    const result = evaluateV2CompletionGuards({
      unansweredCount: 0,
      responses,
      questions,
      scoringResponses: responses.map((response) => ({
        questionId: response.questionCode,
        answerText: response.answerText,
      })),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.overallStackScore).toBe(100);
      expect(result.scoring.overallStackScore).not.toBeNull();
    }
  });

  it("rejects all-N/A assessments (null overall)", () => {
    const responses = questions.map((question) => ({
      questionCode: question.id,
      answerText: "Not Applicable" as const,
    }));
    const result = evaluateV2CompletionGuards({
      unansweredCount: 0,
      responses,
      questions,
      scoringResponses: responses.map((response) => ({
        questionId: response.questionCode,
        answerText: response.answerText,
      })),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/no valid overall StackScore/i);
    }
  });

  it("rejects unrecognized answer labels", () => {
    const responses = questions.map((question, index) => ({
      questionCode: question.id,
      answerText: index === 0 ? "Kinda" : "Yes",
    }));
    const result = evaluateV2CompletionGuards({
      unansweredCount: 0,
      responses,
      questions,
      scoringResponses: responses.map((response) => ({
        questionId: response.questionCode,
        answerText: response.answerText,
      })),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/Unrecognized answer label/i);
    }
  });
});

describe("SS-OPT-002 null overall vs zero", () => {
  it("keeps overall null when no pillars are scorable", () => {
    const result = calculateV2Scores({
      questions: [{ id: "IA-001", pillarCode: "identity_access", weight: 5 }],
      responses: [{ questionId: "IA-001", answerText: "Not Applicable" }],
      pillarCodes: ["identity_access"],
    });
    expect(result.overallStackScore).toBeNull();
    expect(result.overallStackScore).not.toBe(0);
  });

  it("allows a legitimate overall of zero when all answered No", () => {
    const questions = questionsForPillars(1);
    const responses = questions.map((question) => ({
      questionId: question.id,
      answerText: "No",
    }));
    const result = calculateV2Scores({ questions, responses });
    expect(result.overallStackScore).toBe(0);
  });
});

describe("SS-OPT-002 incomplete pillar labeling", () => {
  it("exposes Assessment Incomplete for unfinished pillars", () => {
    expect(ASSESSMENT_INCOMPLETE_LABEL).toBe("Assessment Incomplete");
    const result = calculateV2Scores({
      questions: [
        { id: "IA-001", pillarCode: "identity_access", weight: 5 },
        { id: "IA-002", pillarCode: "identity_access", weight: 5 },
      ],
      responses: [{ questionId: "IA-001", answerText: "Yes" }],
      pillarCodes: ["identity_access"],
    });
    expect(result.pillarScores[0]?.status).toBe("incomplete");
    expect(result.pillarScores[0]?.percentScore).toBeNull();
    expect(result.pillarScores[0]?.maturityLevel).toBeNull();
  });
});

describe("SS-OPT-002 DOC-119 maturity boundaries", () => {
  it("classifies band edges", () => {
    expect(getTechnologyMaturityLevel(0).label).toBe("Initial");
    expect(getTechnologyMaturityLevel(39).label).toBe("Initial");
    expect(getTechnologyMaturityLevel(40).label).toBe("Basic");
    expect(getTechnologyMaturityLevel(54).label).toBe("Basic");
    expect(getTechnologyMaturityLevel(55).label).toBe("Developing");
    expect(getTechnologyMaturityLevel(69).label).toBe("Developing");
    expect(getTechnologyMaturityLevel(70).label).toBe("Managed");
    expect(getTechnologyMaturityLevel(84).label).toBe("Managed");
    expect(getTechnologyMaturityLevel(85).label).toBe("Mature");
    expect(getTechnologyMaturityLevel(94).label).toBe("Mature");
    expect(getTechnologyMaturityLevel(95).label).toBe("Optimized");
    expect(getTechnologyMaturityLevel(100).label).toBe("Optimized");
  });

  it("uses DOC-119 labels for display while bridging profile enum storage", () => {
    expect(getMaturityTierLabel(72)).toBe("Managed");
    expect(getMaturityTier(72)).toBe("mature");
    expect(getMaturityTierLabel(42)).toBe("Basic");
    expect(getMaturityTier(42)).toBe("foundational");
  });
});

describe("SS-OPT-002 answer validation", () => {
  it("recognizes only standard labels", () => {
    expect(isRecognizedV2Answer("Yes")).toBe(true);
    expect(isRecognizedV2Answer("Partially")).toBe(true);
    expect(isRecognizedV2Answer("No")).toBe(true);
    expect(isRecognizedV2Answer("Not Applicable")).toBe(true);
    expect(isRecognizedV2Answer("N/A")).toBe(false);
    expect(isRecognizedV2Answer("yes")).toBe(false);
  });

  it("preserves N/A exclusion without treating it as zero", () => {
    expect(normalizeAnswerScore("Not Applicable")).toBeNull();
    expect(normalizeAnswerScore("No")).toBe(0);
  });
});

describe("SS-OPT-002 technology profile risk summary", () => {
  it("counts priorities without hardcoded zeros", () => {
    const summary = buildRiskSummaryFromPriorities(
      [
        { priority: "critical" },
        { priority: "critical" },
        { priority: "high" },
        { priority: "medium" },
        { priority: "low" },
        { priority: "low" },
      ],
      true,
    );
    expect(summary).toEqual({
      critical: 2,
      high: 1,
      medium: 1,
      low: 2,
      criticalExposure: true,
    });
  });
});

describe("SS-OPT-002 recommendation stubs and dedupe", () => {
  it("identifies stub catalog templates", () => {
    // REC-IA-001 is published (Batch B1); remaining non-B1 templates stay stubs.
    expect(isStubRecommendationTemplate("REC-IA-001")).toBe(false);
    expect(isStubRecommendationTemplate("REC-EP-001")).toBe(true);
    expect(isStubRecommendationTemplate("NOT-A-REAL-CODE")).toBe(false);
  });

  it("filters stubs from client delivery while keeping them for staff", () => {
    const rows = [
      {
        id: "1",
        title: "Stub rec",
        templateCode: "REC-EP-001",
        latestTriggerReason: "hidden",
      },
      {
        id: "2",
        title: "Approved-looking",
        templateCode: "REC-IA-001",
        latestTriggerReason: "staff-only",
      },
    ];

    const forClient = presentRecommendationsForRole(rows, "client");
    expect(forClient).toHaveLength(1);
    expect(forClient[0]?.id).toBe("2");
    expect(forClient[0]?.latestTriggerReason).toBeUndefined();

    const forStaff = presentRecommendationsForRole(rows, "admin");
    expect(forStaff).toHaveLength(2);
    expect(filterOutStubRecommendations(rows)).toHaveLength(1);
  });

  it("builds stable dedupe keys for recommendation sync", () => {
    const keyA = buildDedupeKey({
      recommendationTemplateId: "tmpl-1",
      templateCode: "REC-IA-001",
      categoryId: "cat-1",
    });
    const keyB = buildDedupeKey({
      recommendationTemplateId: "tmpl-1",
      templateCode: "REC-IA-001",
      categoryId: "cat-1",
    });
    expect(keyA).toBe(keyB);
  });
});

describe("SS-OPT-002 historical score stability contract", () => {
  it("does not coerce null overall into zero in scoring result objects", () => {
    const incomplete = calculateV2Scores({
      questions: [{ id: "IA-001", pillarCode: "identity_access", weight: 5 }],
      responses: [],
      pillarCodes: ["identity_access"],
    });
    expect(incomplete.overallStackScore).toBeNull();

    const zero = calculateV2Scores({
      questions: [{ id: "IA-001", pillarCode: "identity_access", weight: 5 }],
      responses: [{ questionId: "IA-001", answerText: "No" }],
      pillarCodes: ["identity_access"],
    });
    expect(zero.overallStackScore).toBe(0);
    expect(Object.is(zero.overallStackScore, incomplete.overallStackScore)).toBe(false);
  });
});
