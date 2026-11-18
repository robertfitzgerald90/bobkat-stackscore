import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  assessment: { findUnique: vi.fn() },
  assessmentRecommendation: { findMany: vi.fn() },
  project: { findMany: vi.fn() },
  clientRoadmapInitiative: { findMany: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ prisma: db }));
import { buildReviewSnapshot } from "@/lib/ai-assessment/snapshot";
import { assessmentId } from "./fixtures";
beforeEach(() => {
  vi.resetAllMocks();
  db.assessment.findUnique.mockResolvedValue({
    id: assessmentId,
    clientId: "client-a",
    status: "completed",
    completedAt: new Date("2026-11-18T00:00:00Z"),
    overallScore: 53,
    scoringEngineVersion: "v2",
    hasCriticalExposure: false,
    internalNotes: "do-not-send-private-notes",
    client: {
      industry: "Manufacturing",
      employeeCount: 25,
      primaryBusinessGoal: null,
      highestTechnologyPriority: null,
      technologyVision: null,
      primaryContactEmail: "do-not-send@example.com",
    },
    categoryScores: [],
    responses: [
      {
        questionId: "q1",
        scoreEarned: 0,
        notes: "Recorded response",
        evidence: "No restore test",
        question: {
          code: "Q1",
          questionText: "Are restores tested?",
          adminNotes: "private-library-notes",
        },
        selectedAnswerOption: {
          answerText: "No",
          triggersCriticalFlag: false,
          triggersRecommendation: true,
          recommendationTemplateId: "template-a",
        },
      },
    ],
  });
  db.assessmentRecommendation.findMany.mockResolvedValue([
    {
      id: "r1",
      title: "Validate restores",
      description: "Test restore capability",
      businessImpact: "Recovery readiness",
      priority: "high",
      recommendationTemplateId: "template-a",
      recommendationTemplate: { code: "DP-001" },
    },
    {
      id: "r2",
      title: "Unlinked manual recommendation",
      description: "Manual",
      businessImpact: "Unknown",
      priority: "high",
      recommendationTemplateId: null,
      recommendationTemplate: null,
    },
  ]);
  db.project.findMany.mockResolvedValue([]);
  db.clientRoadmapInitiative.findMany.mockResolvedValue([]);
});
describe("assessment source minimization", () => {
  it("excludes contact, staff and library-private fields while preserving explicit evidence", async () => {
    const value = await buildReviewSnapshot(assessmentId);
    const serialized = JSON.stringify(value);
    expect(serialized).not.toMatch(/do-not-send|private-library/);
    expect(value.responses[0].evidence).toBe("No restore test");
    expect(value.recommendations).toHaveLength(1);
    expect(value.recommendations[0].questionIds).toEqual(["q1"]);
    expect(db.assessmentRecommendation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ clientId: "client-a" }),
      }),
    );
  });
  it("rejects draft assessments and missing scores before retrieving recommendations", async () => {
    db.assessment.findUnique.mockResolvedValueOnce({
      status: "draft",
      overallScore: null,
      responses: [],
    });
    await expect(buildReviewSnapshot(assessmentId)).rejects.toThrow(
      /completed, scored/,
    );
    expect(db.assessmentRecommendation.findMany).not.toHaveBeenCalled();
  });
});
