import type {
  AiReviewDraft,
  AssessmentAiSnapshot,
} from "@/lib/ai-assessment/schema";
export const assessmentId = "11111111-1111-4111-8111-111111111111";
export const reviewId = "22222222-2222-4222-8222-222222222222";
export function snapshot(): AssessmentAiSnapshot {
  return {
    schemaVersion: 1,
    assessmentId,
    clientId: "client-a",
    scoringEngineVersion: "v2",
    completedAt: "2026-11-18T00:00:00.000Z",
    officialScore: 53,
    hasCriticalExposure: true,
    businessContext: {
      industry: "Manufacturing",
      employeeCount: 25,
      primaryBusinessGoal: null,
      highestTechnologyPriority: null,
      technologyVision: null,
    },
    categoryScores: [
      { code: "data_protection", name: "Data protection", score: 50 },
    ],
    responses: [
      {
        questionId: "q1",
        code: "Q1",
        question: "Are restores tested?",
        answer: "No",
        scoreEarned: 0,
        criticalExposure: true,
        evidence: "No restore evidence recorded",
        notes: null,
      },
      {
        questionId: "q2",
        code: "Q2",
        question: "Is recovery ownership defined?",
        answer: "Partially",
        scoreEarned: 1,
        criticalExposure: false,
        evidence: null,
        notes: null,
      },
    ],
    recommendations: [
      {
        id: "r1",
        title: "Validate restore capability",
        description: "Test an isolated restore",
        businessImpact: "Recovery readiness",
        priority: "high",
        questionIds: ["q1"],
      },
      {
        id: "r2",
        title: "Document recovery responsibilities",
        description: "Agree on accountable roles",
        businessImpact: "Repeatable recovery",
        priority: "medium",
        questionIds: ["q2"],
      },
    ],
    existingWork: [],
  };
}
export function draft(): AiReviewDraft {
  return {
    executiveSummary:
      "Restore testing needs attention based on the recorded assessment.",
    findings: [
      {
        title: "Recovery is untested",
        analysis: "No successful recovery exercise is recorded.",
        questionIds: ["q1"],
      },
    ],
    initiatives: [
      {
        recommendationId: "r1",
        title: "Validate recovery",
        horizon: "now",
        rationale: "Address documented recovery uncertainty.",
        questionIds: ["q1"],
        dependsOnRecommendationIds: [],
        steps: ["Restore a sample in an isolated environment."],
        completionEvidence: ["A reviewed restore test record."],
      },
    ],
    assumptions: [],
    openQuestions: ["What recovery time does the business require?"],
  };
}
