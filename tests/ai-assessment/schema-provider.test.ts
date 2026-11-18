import { afterEach, describe, expect, it, vi } from "vitest";
import { validateDraft } from "@/lib/ai-assessment/schema";
import {
  generateReview,
  providerSchema,
  REVIEW_INSTRUCTIONS,
} from "@/lib/ai-assessment/provider";
import { snapshotHash } from "@/lib/ai-assessment/snapshot-hash";
import { snapshot, draft } from "./fixtures";
afterEach(() => vi.unstubAllGlobals());
describe("grounded AI review validation", () => {
  it("keeps source fingerprints stable after JSONB reorders object keys", () => {
    function reorder(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(reorder);
      if (value && typeof value === "object")
        return Object.fromEntries(
          Object.entries(value)
            .reverse()
            .map(([key, child]) => [key, reorder(child)]),
        );
      return value;
    }
    const source = snapshot();
    expect(snapshotHash(reorder(source) as typeof source)).toBe(
      snapshotHash(source),
    );
  });
  it("preserves official scores and accepts a fully referenced draft", () => {
    const source = snapshot();
    expect(validateDraft(draft(), source)).toEqual(draft());
    expect(source.officialScore).toBe(53);
  });
  it("rejects unknown evidence and foreign recommendation references", () => {
    const value = draft();
    value.findings[0].questionIds = ["another-client-question"];
    expect(() => validateDraft(value, snapshot())).toThrow();
    const foreign = draft();
    foreign.initiatives[0].recommendationId = "another-client-recommendation";
    expect(() => validateDraft(foreign, snapshot())).toThrow();
  });
  it("requires evidence linked to the recommendation, not just any answer", () => {
    const value = draft();
    value.initiatives[0].questionIds = ["q2"];
    expect(() => validateDraft(value, snapshot())).toThrow(/does not support/);
  });
  it("rejects duplicate initiatives and already planned work", () => {
    const value = draft();
    value.initiatives.push({ ...value.initiatives[0] });
    expect(() => validateDraft(value, snapshot())).toThrow(/Duplicate/);
    const source = snapshot();
    source.existingWork.push({
      recommendationId: "r1",
      kind: "project",
      title: "Restore project",
      status: "in_progress",
    });
    expect(() => validateDraft(draft(), source)).toThrow(/already planned/);
  });
  it("rejects cycles, missing dependencies and later-phase prerequisites", () => {
    const value = draft();
    value.initiatives[0].dependsOnRecommendationIds = ["r1"];
    expect(() => validateDraft(value, snapshot())).toThrow(/Circular/);
    value.initiatives[0].dependsOnRecommendationIds = ["missing"];
    expect(() => validateDraft(value, snapshot())).toThrow(/dependency/);
    value.initiatives[0].dependsOnRecommendationIds = ["r2"];
    value.initiatives.push({
      ...value.initiatives[0],
      recommendationId: "r2",
      questionIds: ["q2"],
      horizon: "later",
      dependsOnRecommendationIds: [],
    });
    expect(() => validateDraft(value, snapshot())).toThrow(/dependency/);
  });
  it("rejects invented score fields and requires evidence-backed findings", () => {
    expect(() =>
      validateDraft({ ...draft(), overallScore: 99 }, snapshot()),
    ).toThrow();
    expect(() =>
      validateDraft({ ...draft(), findings: [] }, snapshot()),
    ).toThrow();
  });
  it("allows an honest empty roadmap when no extra work is justified", () => {
    expect(
      validateDraft({ ...draft(), initiatives: [] }, snapshot()).initiatives,
    ).toEqual([]);
  });
});
describe("provider contract", () => {
  it("uses strict structured outputs, bounded output, no tools and no provider response storage", async () => {
    const request = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "completed",
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: JSON.stringify(draft()) }],
          },
        ],
        usage: { input_tokens: 100, output_tokens: 80 },
      }),
    });
    vi.stubGlobal("fetch", request);
    const result = await generateReview(
      snapshot(),
      "test-model",
      "test-secret",
    );
    const body = JSON.parse(request.mock.calls[0][1].body);
    expect(body.store).toBe(false);
    expect(body.model).toBe("test-model");
    expect(body.max_output_tokens).toBe(6500);
    expect(body.text.format.strict).toBe(true);
    expect(body.text.format.type).toBe("json_schema");
    expect(body.tools).toBeUndefined();
    expect(body.instructions).toBe(REVIEW_INSTRUCTIONS);
    expect(body.input).toBe(JSON.stringify(snapshot()));
    expect(result.usage).toEqual({ inputTokens: 100, outputTokens: 80 });
    const schema = providerSchema();
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toContain("findings");
  });
  it("handles refusal, incomplete output and invalid provenance as failures", async () => {
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    request.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: "completed",
        output: [{ type: "message", content: [{ type: "refusal" }] }],
      }),
    });
    await expect(generateReview(snapshot(), "test", "key")).rejects.toThrow(
      "PROVIDER_REFUSAL",
    );
    request.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "incomplete" }),
    });
    await expect(generateReview(snapshot(), "test", "key")).rejects.toThrow(
      "PROVIDER_INCOMPLETE",
    );
    request.mockResolvedValueOnce({ ok: false, status: 429 });
    await expect(generateReview(snapshot(), "test", "key")).rejects.toThrow(
      "PROVIDER_HTTP_429",
    );
  });
});
