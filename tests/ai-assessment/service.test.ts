import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => {
  const reviews = {
    updateMany: vi.fn(),
    findFirst: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  };
  return {
    reviews,
    transaction: vi.fn(),
    lock: vi.fn(),
    snapshot: vi.fn(),
    provider: vi.fn(),
  };
});
vi.mock("@/lib/db", () => ({
  prisma: {
    assessmentAiReview: mocks.reviews,
    $transaction: mocks.transaction,
  },
}));
vi.mock("@/lib/ai-assessment/snapshot", async () => ({
  ...(await vi.importActual("@/lib/ai-assessment/snapshot")),
  buildReviewSnapshot: mocks.snapshot,
}));
vi.mock("@/lib/ai-assessment/provider", () => ({
  generateReview: mocks.provider,
}));
import {
  enqueueReview,
  getReviewData,
  mutateReview,
  processReview,
} from "@/lib/ai-assessment/service";
import { snapshotHash } from "@/lib/ai-assessment/snapshot";
import { AI_REVIEW_PROMPT_VERSION } from "@/lib/ai-assessment/config";
import { assessmentId, reviewId, snapshot, draft } from "./fixtures";
function record() {
  const source = snapshot();
  return {
    id: reviewId,
    assessmentId,
    clientId: source.clientId,
    status: "draft",
    revision: 0,
    snapshot: source,
    inputHash: snapshotHash(source),
    draft: draft(),
    model: "test-model",
    promptVersion: AI_REVIEW_PROMPT_VERSION,
  };
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("AI_ASSESSMENT_REVIEW_ENABLED", "true");
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubEnv("OPENAI_ASSESSMENT_MODEL", "test-model");
  mocks.snapshot.mockResolvedValue(snapshot());
  mocks.reviews.updateMany.mockResolvedValue({ count: 1 });
  mocks.reviews.count.mockResolvedValue(0);
  mocks.reviews.findFirst.mockResolvedValue(null);
  mocks.reviews.create.mockResolvedValue({ id: reviewId });
  mocks.transaction.mockImplementation((fn: (tx: unknown) => unknown) =>
    fn({ assessmentAiReview: mocks.reviews, $queryRaw: mocks.lock }),
  );
});
afterEach(() => vi.unstubAllEnvs());
describe("versioned AI assessment review workflow", () => {
  it("fails closed without configuration and does not touch the new table", async () => {
    vi.stubEnv("AI_ASSESSMENT_REVIEW_ENABLED", "false");
    expect(await getReviewData(assessmentId)).toMatchObject({
      enabled: false,
      review: null,
    });
    await expect(
      enqueueReview(assessmentId, "admin", snapshotHash(snapshot())),
    ).rejects.toThrow(/not configured/);
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.snapshot).not.toHaveBeenCalled();
  });
  it("requires the preview fingerprint and prevents concurrent jobs", async () => {
    await expect(enqueueReview(assessmentId, "admin", "stale")).rejects.toThrow(
      /Source data changed/,
    );
    mocks.reviews.findFirst.mockResolvedValueOnce({ status: "generating" });
    await expect(
      enqueueReview(assessmentId, "admin", snapshotHash(snapshot())),
    ).rejects.toThrow(/already generating/);
    expect(mocks.reviews.create).not.toHaveBeenCalled();
  });
  it("enforces daily generation admission and preserves immutable snapshots", async () => {
    mocks.reviews.count.mockResolvedValueOnce(20);
    await expect(
      enqueueReview(assessmentId, "admin", snapshotHash(snapshot())),
    ).rejects.toThrow(/daily/);
    await enqueueReview(assessmentId, "admin", snapshotHash(snapshot()));
    expect(mocks.reviews.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          assessmentId,
          clientId: "client-a",
          createdByUserId: "admin",
          snapshot: snapshot(),
          inputHash: snapshotHash(snapshot()),
          promptVersion: AI_REVIEW_PROMPT_VERSION,
        }),
      }),
    );
    expect(mocks.lock).toHaveBeenCalled();
  });
  it("does not call the provider when another worker already claimed the job", async () => {
    mocks.reviews.updateMany.mockResolvedValueOnce({ count: 0 });
    await processReview(reviewId);
    expect(mocks.provider).not.toHaveBeenCalled();
  });
  it("marks failed or invalid generations without storing raw provider errors", async () => {
    mocks.reviews.findUniqueOrThrow.mockResolvedValue(record());
    mocks.provider.mockRejectedValue(
      new Error("secret customer data in provider message"),
    );
    await processReview(reviewId);
    expect(mocks.reviews.updateMany).toHaveBeenLastCalledWith({
      where: { id: reviewId, status: "generating" },
      data: expect.objectContaining({
        status: "failed",
        errorCode: "GENERATION_OR_VALIDATION_FAILED",
      }),
    });
  });
  it("rejects stale context and foreign review IDs before approval", async () => {
    mocks.reviews.findFirst.mockResolvedValueOnce(null);
    await expect(
      mutateReview(assessmentId, "admin", {
        action: "approve",
        reviewId,
        revision: 0,
      }),
    ).rejects.toThrow(/not found/);
    mocks.reviews.findFirst.mockResolvedValueOnce(record());
    mocks.snapshot.mockResolvedValueOnce({ ...snapshot(), officialScore: 70 });
    await expect(
      mutateReview(assessmentId, "admin", {
        action: "approve",
        reviewId,
        revision: 0,
      }),
    ).rejects.toThrow(/changed/);
  });
  it("approves only a current saved revision and never writes to scoring or roadmap tables", async () => {
    mocks.reviews.findFirst.mockResolvedValueOnce(record());
    await mutateReview(assessmentId, "admin", {
      action: "approve",
      reviewId,
      revision: 0,
    });
    expect(mocks.reviews.updateMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: reviewId,
          assessmentId,
          clientId: "client-a",
          revision: 0,
          status: "draft",
        }),
        data: expect.objectContaining({
          status: "approved",
          approvedByUserId: "admin",
          revision: { increment: 1 },
        }),
      }),
    );
  });
  it("rejects edits to approved reviews and stale editor revisions", async () => {
    mocks.reviews.findFirst.mockResolvedValueOnce({
      ...record(),
      status: "approved",
    });
    await expect(
      mutateReview(assessmentId, "admin", {
        action: "save",
        reviewId,
        revision: 0,
        draft: draft(),
      }),
    ).rejects.toThrow(/already been approved/);
    mocks.reviews.findFirst.mockResolvedValueOnce({ ...record(), revision: 2 });
    await expect(
      mutateReview(assessmentId, "admin", {
        action: "approve",
        reviewId,
        revision: 0,
      }),
    ).rejects.toThrow(/changed/);
  });
});
