import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import {
  aiReviewConfig,
  AiReviewError,
  AI_REVIEW_PROMPT_VERSION,
} from "./config";
import { buildReviewSnapshot, snapshotHash } from "./snapshot";
import { generateReview } from "./provider";
import { validateDraft, type AssessmentAiSnapshot } from "./schema";
import type { z } from "zod";
import { reviewMutationSchema } from "./schema";

function enabled() {
  const config = aiReviewConfig();
  if (!config.enabled)
    throw new AiReviewError(
      "AI assessment review is not configured. Enable it and configure the server-side API key and model first.",
      503,
    );
  return config;
}
const asJson = (value: object) => value as Prisma.InputJsonValue;
const expiry = () => new Date(Date.now() - 10 * 60_000);
const historySelect = {
  id: true,
  status: true,
  createdAt: true,
  approvedAt: true,
  model: true,
  promptVersion: true,
  revision: true,
} as const;

export async function getReviewData(assessmentId: string, reviewId?: string) {
  const config = aiReviewConfig();
  if (!config.enabled)
    return {
      enabled: false,
      snapshot: null,
      inputHash: null,
      review: null,
      history: [],
    };
  const snapshot = await buildReviewSnapshot(assessmentId);
  // A terminated serverless worker can be retried explicitly; do not silently spend again.
  await prisma.assessmentAiReview.updateMany({
    where: {
      assessmentId,
      status: { in: ["queued", "generating"] },
      createdAt: { lt: expiry() },
    },
    data: {
      status: "failed",
      errorCode: "WORKER_EXPIRED",
      finishedAt: new Date(),
    },
  });
  const history = await prisma.assessmentAiReview.findMany({
    where: { assessmentId, clientId: snapshot.clientId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 10,
    select: historySelect,
  });
  const selected = reviewId ?? history[0]?.id;
  const review = selected
    ? await prisma.assessmentAiReview.findFirst({
        where: { id: selected, assessmentId, clientId: snapshot.clientId },
      })
    : null;
  if (reviewId && !review)
    throw new AiReviewError("Review not found for this assessment.", 404);
  return {
    enabled: true,
    snapshot,
    inputHash: snapshotHash(snapshot),
    history,
    review: review
      ? {
          ...history.find((item) => item.id === review.id),
          id: review.id,
          status: review.status,
          revision: review.revision,
          model: review.model,
          promptVersion: review.promptVersion,
          createdAt: review.createdAt.toISOString(),
          approvedAt: review.approvedAt?.toISOString() ?? null,
          snapshot: review.snapshot,
          draft: review.draft,
          usage: review.usage,
          errorCode: review.errorCode,
          stale: review.inputHash !== snapshotHash(snapshot),
        }
      : null,
  };
}

export async function enqueueReview(
  assessmentId: string,
  actorId: string,
  expectedHash: string,
) {
  const config = enabled();
  return prisma.$transaction(
    async (tx) => {
      // Short durable admission lock: prevents duplicate jobs and races around the daily spend cap.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('stackscore-ai-review-admission'))::text`;
      const snapshot = await buildReviewSnapshot(assessmentId, tx);
      if (snapshotHash(snapshot) !== expectedHash)
        throw new AiReviewError(
          "Source data changed since your preview. Reload and review it before generating.",
          409,
        );
      await tx.assessmentAiReview.updateMany({
        where: {
          assessmentId,
          status: { in: ["queued", "generating"] },
          createdAt: { lt: expiry() },
        },
        data: {
          status: "failed",
          errorCode: "WORKER_EXPIRED",
          finishedAt: new Date(),
        },
      });
      const active = await tx.assessmentAiReview.findFirst({
        where: { assessmentId, status: { in: ["queued", "generating"] } },
      });
      if (active)
        throw new AiReviewError(
          "A review is already generating for this assessment.",
          409,
        );
      const recent = await tx.assessmentAiReview.findFirst({
        where: { assessmentId },
        orderBy: { createdAt: "desc" },
      });
      if (recent && recent.createdAt.getTime() > Date.now() - 60_000)
        throw new AiReviewError(
          "Please wait one minute before generating another draft.",
          429,
        );
      const daily = await tx.assessmentAiReview.count({
        where: { createdAt: { gte: new Date(Date.now() - 86_400_000) } },
      });
      if (daily >= 20)
        throw new AiReviewError(
          "The daily AI review limit has been reached. Try again tomorrow.",
          429,
        );
      return tx.assessmentAiReview.create({
        data: {
          assessmentId,
          clientId: snapshot.clientId,
          createdByUserId: actorId,
          snapshot: asJson(snapshot),
          inputHash: snapshotHash(snapshot),
          model: config.model,
          promptVersion: AI_REVIEW_PROMPT_VERSION,
        },
        select: { id: true },
      });
    },
    { timeout: 15_000 },
  );
}

export async function processReview(reviewId: string) {
  const claimed = await prisma.assessmentAiReview.updateMany({
    where: { id: reviewId, status: "queued" },
    data: { status: "generating", startedAt: new Date() },
  });
  if (claimed.count !== 1) return;
  try {
    enabled();
    const record = await prisma.assessmentAiReview.findUniqueOrThrow({
      where: { id: reviewId },
    });
    const snapshot = record.snapshot as unknown as AssessmentAiSnapshot;
    if (
      snapshotHash(snapshot) !== record.inputHash ||
      snapshot.schemaVersion !== 1 ||
      record.promptVersion !== AI_REVIEW_PROMPT_VERSION
    )
      throw new Error("SNAPSHOT_VERSION");
    const result = await generateReview(
      snapshot,
      record.model,
      process.env.OPENAI_API_KEY!,
    );
    // A stale worker cannot overwrite a failed or otherwise transitioned record.
    await prisma.assessmentAiReview.updateMany({
      where: { id: reviewId, status: "generating" },
      data: {
        status: "draft",
        draft: asJson(result.draft),
        usage: asJson(result.usage),
        finishedAt: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const errorCode = /^PROVIDER_(HTTP_\d{3}|INCOMPLETE|REFUSAL)$/.test(message)
      ? message
      : "GENERATION_OR_VALIDATION_FAILED";
    await prisma.assessmentAiReview.updateMany({
      where: { id: reviewId, status: "generating" },
      data: { status: "failed", errorCode, finishedAt: new Date() },
    });
  }
}

export async function mutateReview(
  assessmentId: string,
  actorId: string,
  mutation: z.infer<typeof reviewMutationSchema>,
) {
  enabled();
  return prisma.$transaction(
    async (tx) => {
      const record = await tx.assessmentAiReview.findFirst({
        where: { id: mutation.reviewId, assessmentId },
      });
      if (!record)
        throw new AiReviewError("Review not found for this assessment.", 404);
      if (record.status !== "draft" || record.revision !== mutation.revision)
        throw new AiReviewError(
          "This draft changed or has already been approved. Reload before continuing.",
          409,
        );
      const snapshot = record.snapshot as unknown as AssessmentAiSnapshot;
      if (mutation.action === "approve") {
        const current = await buildReviewSnapshot(assessmentId, tx);
        if (
          current.clientId !== record.clientId ||
          snapshotHash(current) !== record.inputHash
        )
          throw new AiReviewError(
            "Assessment or delivery context has changed. Generate a fresh draft before approval.",
            409,
          );
      }
      const draft = validateDraft(
        mutation.action === "save" ? mutation.draft : record.draft,
        snapshot,
      );
      const updated = await tx.assessmentAiReview.updateMany({
        where: {
          id: record.id,
          assessmentId,
          clientId: record.clientId,
          status: "draft",
          revision: mutation.revision,
        },
        data: {
          draft: asJson(draft),
          revision: { increment: 1 },
          ...(mutation.action === "approve"
            ? {
                status: "approved",
                approvedAt: new Date(),
                approvedByUserId: actorId,
              }
            : {}),
        },
      });
      if (updated.count !== 1)
        throw new AiReviewError(
          "The draft was changed by another reviewer. Reload and try again.",
          409,
        );
      return { ok: true };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 15_000,
    },
  );
}
