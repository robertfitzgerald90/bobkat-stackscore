import { describe, expect, it } from "vitest";
import { validateQuestionLibrary } from "@/lib/assessment-library/validate";
import {
  EXPECTED_V2_PILLAR_COUNT,
  EXPECTED_V2_QUESTION_COUNT,
  V2_CATALOG_BY_ID,
  V2_PILLAR_CODES,
} from "@/lib/assessment-library/v2-catalog";

describe("validateQuestionLibrary (DOC-151 pillar bank)", () => {
  it("expects 80 questions across 8 pillars", () => {
    expect(EXPECTED_V2_QUESTION_COUNT).toBe(80);
    expect(EXPECTED_V2_PILLAR_COUNT).toBe(8);
    expect(V2_PILLAR_CODES).toHaveLength(8);
  });

  it("validates a complete aligned active pillar bank", () => {
    const questions = [...V2_CATALOG_BY_ID.values()].map((entry) => ({
      code: entry.id,
      v2QuestionId: entry.id,
      categoryCode: entry.pillarCode,
      capability: entry.capability,
      isActive: true,
    }));

    const result = validateQuestionLibrary(questions);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("ignores archived v1 questions when validating the active bank", () => {
    const activeQuestions = [...V2_CATALOG_BY_ID.values()].map((entry) => ({
      code: entry.id,
      v2QuestionId: entry.id,
      categoryCode: entry.pillarCode,
      capability: entry.capability,
      isActive: true,
    }));

    const archivedV1 = {
      code: "Q01",
      v2QuestionId: "SEC-001",
      categoryCode: "security",
      capability: "MFA",
      isActive: false,
    };

    const result = validateQuestionLibrary([...activeQuestions, archivedV1]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("reports missing active questions", () => {
    const questions = [...V2_CATALOG_BY_ID.values()]
      .slice(1)
      .map((entry) => ({
        code: entry.id,
        v2QuestionId: entry.id,
        categoryCode: entry.pillarCode,
        capability: entry.capability,
        isActive: true,
      }));

    const result = validateQuestionLibrary(questions);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("Expected 80 active pillar questions"))).toBe(
      true,
    );
  });

  it("reports pillar mismatches", () => {
    const entry = [...V2_CATALOG_BY_ID.values()][0];
    const questions = [...V2_CATALOG_BY_ID.values()].map((catalogEntry) => ({
      code: catalogEntry.id,
      v2QuestionId: catalogEntry.id,
      categoryCode:
        catalogEntry.id === entry.id ? "wrong_pillar" : catalogEntry.pillarCode,
      capability: catalogEntry.capability,
      isActive: true,
    }));

    const result = validateQuestionLibrary(questions);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("pillar mismatch"))).toBe(true);
  });
});
