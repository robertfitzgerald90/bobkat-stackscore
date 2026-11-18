import { z } from "zod";

const text = z.string().trim().min(1).max(2400);
const references = z.array(z.string().min(1).max(100)).min(1).max(20);
export const aiReviewDraftSchema = z
  .object({
    executiveSummary: text,
    findings: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(180),
            analysis: text,
            questionIds: references,
          })
          .strict(),
      )
      .min(1)
      .max(15),
    initiatives: z
      .array(
        z
          .object({
            recommendationId: z.string().min(1).max(100),
            title: z.string().trim().min(1).max(180),
            horizon: z.enum(["now", "next", "later"]),
            rationale: text,
            questionIds: references,
            dependsOnRecommendationIds: z
              .array(z.string().min(1).max(100))
              .max(15),
            steps: z.array(z.string().trim().min(1).max(500)).min(1).max(8),
            completionEvidence: z
              .array(z.string().trim().min(1).max(500))
              .min(1)
              .max(6),
          })
          .strict(),
      )
      .max(20),
    assumptions: z.array(z.string().trim().min(1).max(600)).max(12),
    openQuestions: z.array(z.string().trim().min(1).max(600)).max(12),
  })
  .strict();
export type AiReviewDraft = z.infer<typeof aiReviewDraftSchema>;
export const reviewMutationSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("save"),
      reviewId: z.string().uuid(),
      revision: z.number().int().min(0),
      draft: aiReviewDraftSchema,
    })
    .strict(),
  z
    .object({
      action: z.literal("approve"),
      reviewId: z.string().uuid(),
      revision: z.number().int().min(0),
    })
    .strict(),
]);

export type AssessmentAiSnapshot = {
  schemaVersion: 1;
  businessContext: {
    industry: string | null;
    employeeCount: number | null;
    primaryBusinessGoal: string | null;
    highestTechnologyPriority: string | null;
    technologyVision: string | null;
  };
  assessmentId: string;
  clientId: string;
  scoringEngineVersion: string;
  completedAt: string | null;
  officialScore: number;
  hasCriticalExposure: boolean;
  categoryScores: Array<{ code: string; name: string; score: number }>;
  responses: Array<{
    questionId: string;
    code: string;
    question: string;
    answer: string;
    scoreEarned: number;
    criticalExposure: boolean;
    notes: string | null;
    evidence: string | null;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    businessImpact: string;
    priority: string;
    questionIds: string[];
  }>;
  existingWork: Array<{
    recommendationId: string;
    kind: "project" | "roadmap";
    title: string;
    status: string;
  }>;
};

/** Validate provenance, uniqueness and a dependency DAG in addition to JSON shape. */
export function validateDraft(
  value: unknown,
  snapshot: AssessmentAiSnapshot,
): AiReviewDraft {
  const draft = aiReviewDraftSchema.parse(value);
  const questions = new Set(snapshot.responses.map((q) => q.questionId));
  const recommendations = new Map(
    snapshot.recommendations.map((r) => [r.id, r]),
  );
  const linked = new Set(
    snapshot.existingWork.map((work) => work.recommendationId),
  );
  const seen = new Set<string>();
  const selected = new Map(
    draft.initiatives.map((i) => [i.recommendationId, i]),
  );
  const horizon = { now: 0, next: 1, later: 2 };
  const checkQuestions = (ids: string[]) => {
    if (
      new Set(ids).size !== ids.length ||
      ids.some((id) => !questions.has(id))
    )
      throw new Error("Invalid assessment evidence reference.");
  };
  for (const finding of draft.findings) checkQuestions(finding.questionIds);
  for (const initiative of draft.initiatives) {
    const recommendation = recommendations.get(initiative.recommendationId);
    if (
      !recommendation ||
      seen.has(initiative.recommendationId) ||
      linked.has(initiative.recommendationId)
    )
      throw new Error(
        "Duplicate, unavailable, or already planned recommendation.",
      );
    seen.add(initiative.recommendationId);
    checkQuestions(initiative.questionIds);
    if (
      initiative.questionIds.some(
        (id) => !recommendation.questionIds.includes(id),
      )
    )
      throw new Error(
        "Initiative evidence does not support its recommendation.",
      );
    if (
      new Set(initiative.dependsOnRecommendationIds).size !==
      initiative.dependsOnRecommendationIds.length
    )
      throw new Error("Duplicate dependencies.");
    for (const id of initiative.dependsOnRecommendationIds) {
      const dependency = selected.get(id);
      if (
        !dependency ||
        horizon[dependency.horizon] > horizon[initiative.horizon]
      )
        throw new Error("Invalid or out-of-order dependency.");
    }
  }
  const visited = new Set<string>();
  const visiting = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) throw new Error("Circular roadmap dependency.");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of selected.get(id)?.dependsOnRecommendationIds ?? [])
      visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of selected.keys()) visit(id);
  return draft;
}
