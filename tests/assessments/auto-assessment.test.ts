import { describe, expect, it } from "vitest";
import { resolveAutoAssessmentParams } from "@/lib/assessments/auto-assessment";

const NOW = new Date("2026-06-23T12:00:00.000Z");

describe("resolveAutoAssessmentParams", () => {
  it("creates an initial assessment when none are completed", () => {
    expect(
      resolveAutoAssessmentParams({
        completedAssessments: [],
        now: NOW,
      }),
    ).toEqual({
      kind: "initial",
      assessmentName: "Initial Assessment",
      assessmentType: "initial",
    });
  });

  it("creates a follow-up reassessment for a recent completion", () => {
    expect(
      resolveAutoAssessmentParams({
        completedAssessments: [
          {
            id: "a1",
            completedAt: "2026-05-01T00:00:00.000Z",
            assessmentType: "initial",
          },
        ],
        now: NOW,
      }),
    ).toEqual({
      kind: "reassessment",
      assessmentName: "Follow-up Assessment",
      assessmentType: "followup",
      sourceAssessmentId: "a1",
    });
  });

  it("creates a quarterly reassessment when overdue", () => {
    expect(
      resolveAutoAssessmentParams({
        completedAssessments: [
          {
            id: "a1",
            completedAt: "2026-05-01T00:00:00.000Z",
            assessmentType: "initial",
          },
        ],
        nextRecommendedAssessmentAt: "2026-06-01T00:00:00.000Z",
        now: NOW,
      }),
    ).toEqual({
      kind: "reassessment",
      assessmentName: "Quarterly Assessment",
      assessmentType: "quarterly",
      sourceAssessmentId: "a1",
    });
  });

  it("creates an annual reassessment after a year", () => {
    expect(
      resolveAutoAssessmentParams({
        completedAssessments: [
          {
            id: "a1",
            completedAt: "2025-01-01T00:00:00.000Z",
            assessmentType: "quarterly",
          },
        ],
        now: NOW,
      }),
    ).toEqual({
      kind: "reassessment",
      assessmentName: "Annual Assessment",
      assessmentType: "annual",
      sourceAssessmentId: "a1",
    });
  });
});
