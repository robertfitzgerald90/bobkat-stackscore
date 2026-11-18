import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { isClientDeliverableRecommendation } from "@/lib/recommendations/visibility";
import { AiReviewError } from "./config";
import type { AssessmentAiSnapshot } from "./schema";

export { snapshotHash } from "./snapshot-hash";

/** Explicit allowlist. No contact details, assessment internal notes, staff IDs, attachments or billing data. */
export async function buildReviewSnapshot(
  assessmentId: string,
  db: Pick<
    Prisma.TransactionClient,
    | "assessment"
    | "assessmentRecommendation"
    | "project"
    | "clientRoadmapInitiative"
  > = prisma,
): Promise<AssessmentAiSnapshot> {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      clientId: true,
      status: true,
      completedAt: true,
      overallScore: true,
      scoringEngineVersion: true,
      hasCriticalExposure: true,
      client: {
        select: {
          industry: true,
          employeeCount: true,
          primaryBusinessGoal: true,
          highestTechnologyPriority: true,
          technologyVision: true,
        },
      },
      responses: {
        orderBy: { questionId: "asc" },
        select: {
          questionId: true,
          scoreEarned: true,
          notes: true,
          evidence: true,
          question: { select: { code: true, questionText: true } },
          selectedAnswerOption: {
            select: {
              answerText: true,
              triggersCriticalFlag: true,
              triggersRecommendation: true,
              recommendationTemplateId: true,
            },
          },
        },
      },
      categoryScores: {
        orderBy: { categoryId: "asc" },
        select: {
          percentScore: true,
          category: { select: { code: true, name: true } },
        },
      },
    },
  });
  if (!assessment) throw new AiReviewError("Assessment not found.", 404);
  if (
    assessment.status !== "completed" ||
    assessment.overallScore === null ||
    !assessment.responses.length
  )
    throw new AiReviewError(
      "AI review requires a completed, scored assessment with saved answers.",
      409,
    );
  const recommendations = await db.assessmentRecommendation.findMany({
    where: {
      clientId: assessment.clientId,
      status: { in: ["open", "accepted"] },
      OR: [{ assessmentId }, { triggers: { some: { assessmentId } } }],
    },
    orderBy: { id: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      businessImpact: true,
      priority: true,
      recommendationTemplateId: true,
      recommendationTemplate: { select: { code: true } },
    },
  });
  const eligible = recommendations
    .filter((r) => isClientDeliverableRecommendation(r, "client"))
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      businessImpact: r.businessImpact,
      priority: r.priority,
      // Only explicit answer-option/template links establish recommendation evidence.
      questionIds: assessment.responses
        .filter(
          (answer) =>
            answer.selectedAnswerOption.triggersRecommendation &&
            r.recommendationTemplateId !== null &&
            answer.selectedAnswerOption.recommendationTemplateId ===
              r.recommendationTemplateId,
        )
        .map((answer) => answer.questionId),
    }))
    .filter((r) => r.questionIds.length > 0);
  const ids = eligible.map((r) => r.id);
  const [projects, initiatives] = await Promise.all([
    db.project.findMany({
      where: {
        clientId: assessment.clientId,
        OR: [
          { recommendationId: { in: ids } },
          { recommendationLinks: { some: { recommendationId: { in: ids } } } },
        ],
      },
      orderBy: { id: "asc" },
      select: {
        recommendationId: true,
        title: true,
        status: true,
        recommendationLinks: {
          orderBy: { recommendationId: "asc" },
          select: { recommendationId: true },
        },
      },
    }),
    db.clientRoadmapInitiative.findMany({
      where: {
        recommendationId: { in: ids },
        phase: { roadmap: { clientId: assessment.clientId } },
      },
      orderBy: { id: "asc" },
      select: {
        recommendationId: true,
        title: true,
        phase: { select: { status: true } },
      },
    }),
  ]);
  const snapshot: AssessmentAiSnapshot = {
    schemaVersion: 1,
    assessmentId,
    clientId: assessment.clientId,
    businessContext: {
      industry: assessment.client.industry,
      employeeCount: assessment.client.employeeCount,
      primaryBusinessGoal: assessment.client.primaryBusinessGoal,
      highestTechnologyPriority: assessment.client.highestTechnologyPriority,
      technologyVision: assessment.client.technologyVision,
    },
    scoringEngineVersion: assessment.scoringEngineVersion,
    completedAt: assessment.completedAt?.toISOString() ?? null,
    officialScore: Number(assessment.overallScore),
    hasCriticalExposure: assessment.hasCriticalExposure,
    categoryScores: assessment.categoryScores.map((row) => ({
      code: row.category.code,
      name: row.category.name,
      score: Number(row.percentScore),
    })),
    responses: assessment.responses.map((row) => ({
      questionId: row.questionId,
      code: row.question.code,
      question: row.question.questionText,
      answer: row.selectedAnswerOption.answerText,
      scoreEarned: row.scoreEarned,
      criticalExposure: row.selectedAnswerOption.triggersCriticalFlag,
      notes: row.notes,
      evidence: row.evidence,
    })),
    recommendations: eligible,
    existingWork: [
      ...projects.flatMap((p) =>
        [
          ...new Set([
            p.recommendationId,
            ...p.recommendationLinks.map((link) => link.recommendationId),
          ]),
        ]
          .filter((id) => ids.includes(id))
          .map((recommendationId) => ({
            recommendationId,
            kind: "project" as const,
            title: p.title,
            status: p.status,
          })),
      ),
      ...initiatives.map((i) => ({
        recommendationId: i.recommendationId,
        kind: "roadmap" as const,
        title: i.title,
        status: i.phase.status,
      })),
    ],
  };
  if (
    !Number.isFinite(snapshot.officialScore) ||
    Buffer.byteLength(JSON.stringify(snapshot), "utf8") > 100_000
  )
    throw new AiReviewError(
      "Assessment context is too large or incomplete for AI review. Review the source records before generating.",
      422,
    );
  return snapshot;
}
