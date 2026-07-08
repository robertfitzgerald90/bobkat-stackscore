import { describe, expect, it } from "vitest";
import { SNAPSHOT_QUESTIONS } from "@/lib/technology-snapshot/questions";
import {
  buildSnapshotResult,
  calculateTotalScore,
  classifySnapshotScore,
  getAnswerPoints,
  getLowestScoringPillars,
} from "@/lib/technology-snapshot/scoring";
import type { SnapshotAnswers } from "@/lib/technology-snapshot/types";

function allAnswers(value: SnapshotAnswers[keyof SnapshotAnswers]): SnapshotAnswers {
  return Object.fromEntries(
    SNAPSHOT_QUESTIONS.map((question) => [question.pillarCode, value]),
  ) as SnapshotAnswers;
}

describe("technology snapshot scoring", () => {
  it("assigns points per answer option", () => {
    expect(getAnswerPoints("yes")).toBe(3);
    expect(getAnswerPoints("partially")).toBe(2);
    expect(getAnswerPoints("unsure")).toBe(1);
    expect(getAnswerPoints("no")).toBe(0);
  });

  it("calculates max score of 24 when all answers are yes", () => {
    expect(calculateTotalScore(allAnswers("yes"))).toBe(24);
  });

  it("classifies score bands", () => {
    expect(classifySnapshotScore(24)).toBe("healthy");
    expect(classifySnapshotScore(21)).toBe("healthy");
    expect(classifySnapshotScore(20)).toBe("needs_attention");
    expect(classifySnapshotScore(15)).toBe("needs_attention");
    expect(classifySnapshotScore(14)).toBe("elevated_risk");
    expect(classifySnapshotScore(8)).toBe("elevated_risk");
    expect(classifySnapshotScore(7)).toBe("immediate_action");
    expect(classifySnapshotScore(0)).toBe("immediate_action");
  });

  it("returns lowest scoring pillars for observations", () => {
    const answers = allAnswers("yes");
    answers.identity_access = "no";
    answers.security_operations = "no";
    answers.technology_strategy = "partially";

    const lowest = getLowestScoringPillars(answers, 3);
    expect(lowest).toHaveLength(3);
    expect(lowest[0]?.score).toBe(0);
    expect(lowest[1]?.score).toBe(0);
    expect(lowest[2]?.score).toBe(2);
  });

  it("builds a result with observations", () => {
    const answers = allAnswers("no");
    const result = buildSnapshotResult(answers);

    expect(result.totalScore).toBe(0);
    expect(result.classification).toBe("immediate_action");
    expect(result.observations).toHaveLength(3);
  });
});
