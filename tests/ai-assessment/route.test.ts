import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  get: vi.fn(),
  enqueue: vi.fn(),
  mutate: vi.fn(),
  process: vi.fn(),
  after: vi.fn(),
}));
vi.mock("@/lib/api/helpers", async () => ({
  ...(await vi.importActual("@/lib/api/helpers")),
  getSessionUser: mocks.user,
}));
vi.mock("@/lib/ai-assessment/service", () => ({
  getReviewData: mocks.get,
  enqueueReview: mocks.enqueue,
  mutateReview: mocks.mutate,
  processReview: mocks.process,
}));
vi.mock("next/server", async () => ({
  ...(await vi.importActual("next/server")),
  after: mocks.after,
}));
import {
  GET,
  POST,
  PATCH,
} from "@/app/api/v1/assessments/[id]/ai-review/route";
import { assessmentId, reviewId } from "./fixtures";
const context = () => ({ params: Promise.resolve({ id: assessmentId }) });
const url = `https://stackscore.tech/api/v1/assessments/${assessmentId}/ai-review`;
const request = (method: string, body: object) =>
  new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ id: "admin", role: "admin" });
});
describe("AI assessment review authorization", () => {
  it.each([null, "client", "technician"])(
    "rejects %s before reading or mutating data",
    async (role) => {
      mocks.user.mockResolvedValue(role ? { id: "u", role } : null);
      for (const [method, req] of [
        [GET, new Request(url)],
        [POST, request("POST", { consent: true })],
        [PATCH, request("PATCH", {})],
      ] as const) {
        const response = await method(req, context());
        expect(response.status).toBe(role ? 403 : 401);
      }
      expect(mocks.get).not.toHaveBeenCalled();
      expect(mocks.enqueue).not.toHaveBeenCalled();
      expect(mocks.mutate).not.toHaveBeenCalled();
    },
  );
  it("requires explicit provider consent and the preview fingerprint", async () => {
    expect(
      (await POST(request("POST", { consent: false }), context())).status,
    ).toBe(400);
    mocks.enqueue.mockResolvedValue({ id: reviewId });
    expect(
      (
        await POST(
          request("POST", { consent: true, inputHash: "a".repeat(64) }),
          context(),
        )
      ).status,
    ).toBe(202);
    expect(mocks.enqueue).toHaveBeenCalledWith(
      assessmentId,
      "admin",
      "a".repeat(64),
    );
    expect(mocks.after).toHaveBeenCalledOnce();
  });
  it("rejects cross-origin mutations", async () => {
    const req = new Request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://untrusted.example",
      },
      body: JSON.stringify({ consent: true, inputHash: "a".repeat(64) }),
    });
    expect((await POST(req, context())).status).toBe(403);
    expect(mocks.enqueue).not.toHaveBeenCalled();
  });
  it("keeps reads private and does not accept a foreign review through an unscoped service call", async () => {
    mocks.get.mockResolvedValue({ enabled: false });
    const response = await GET(
      new Request(url + `?reviewId=${reviewId}`),
      context(),
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.get).toHaveBeenCalledWith(assessmentId, reviewId);
  });
});
