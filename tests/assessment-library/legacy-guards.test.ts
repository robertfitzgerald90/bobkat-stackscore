import { describe, expect, it } from "vitest";
import {
  isLegacyModeRequest,
  requiresLegacyModeForCategoryActivation,
  requiresLegacyModeForQuestionActivation,
} from "@/lib/assessment-library/legacy-guards";
import {
  isV1CategoryCode,
  isV1QuestionCode,
  V1_CATEGORY_CODES,
  V1_QUESTION_CODES,
} from "@/lib/assessment-library/v1-library";

describe("v1-library identifiers", () => {
  it("defines seven archived v1 categories and fifty question codes", () => {
    expect(V1_CATEGORY_CODES).toHaveLength(7);
    expect(V1_QUESTION_CODES).toHaveLength(50);
    expect(V1_QUESTION_CODES[0]).toBe("Q01");
    expect(V1_QUESTION_CODES[49]).toBe("Q50");
  });

  it("recognizes v1 codes and rejects pillar codes", () => {
    expect(isV1CategoryCode("security")).toBe(true);
    expect(isV1CategoryCode("identity_access")).toBe(false);
    expect(isV1QuestionCode("Q01")).toBe(true);
    expect(isV1QuestionCode("IA-001")).toBe(false);
  });
});

describe("legacy mode guards", () => {
  it("requires legacy mode to reactivate archived v1 categories", () => {
    expect(requiresLegacyModeForCategoryActivation("security", true)).toBe(true);
    expect(requiresLegacyModeForCategoryActivation("security", false)).toBe(false);
    expect(requiresLegacyModeForCategoryActivation("identity_access", true)).toBe(false);
  });

  it("requires legacy mode to reactivate archived v1 questions", () => {
    expect(
      requiresLegacyModeForQuestionActivation("identity_access", "Q01", true),
    ).toBe(true);
    expect(
      requiresLegacyModeForQuestionActivation("identity_access", "IA-001", true),
    ).toBe(false);
    expect(
      requiresLegacyModeForQuestionActivation("security", "IA-001", false),
    ).toBe(false);
  });

  it("accepts explicit legacy mode flag in request bodies", () => {
    expect(isLegacyModeRequest({ legacyMode: true })).toBe(true);
    expect(isLegacyModeRequest({ legacyMode: false })).toBe(false);
    expect(isLegacyModeRequest({})).toBe(false);
  });
});
