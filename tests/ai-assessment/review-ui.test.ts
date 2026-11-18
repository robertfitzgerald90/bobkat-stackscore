// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssessmentAiReview } from "@/components/ai-assessment/assessment-ai-review";
import { assessmentId, reviewId, snapshot, draft } from "./fixtures";
const request = vi.fn();
function view(withDraft = false) {
  return {
    enabled: true,
    inputHash: "a".repeat(64),
    snapshot: snapshot(),
    history: withDraft
      ? [{ id: reviewId, status: "draft", createdAt: "2026-11-18T12:00:00Z" }]
      : [],
    review: withDraft
      ? {
          id: reviewId,
          status: "draft",
          revision: 0,
          model: "test",
          promptVersion: "v1",
          createdAt: "2026-11-18T12:00:00Z",
          approvedAt: null,
          stale: false,
          errorCode: null,
          snapshot: snapshot(),
          draft: draft(),
        }
      : null,
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", request);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("admin AI review interface", () => {
  it("shows disabled setup without offering a generation action", async () => {
    request.mockResolvedValue({
      ok: true,
      json: async () => ({
        enabled: false,
        review: null,
        snapshot: null,
        inputHash: null,
        history: [],
      }),
    });
    render(createElement(AssessmentAiReview, { assessmentId }));
    expect(await screen.findByText(/AI review is disabled/)).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /Generate new draft/ }),
    ).toBeNull();
  });
  it("requires explicit consent and sends only the current preview fingerprint", async () => {
    request.mockImplementation(async (_url, init) => ({
      ok: true,
      json: async () => (init?.method === "POST" ? { reviewId } : view()),
    }));
    render(createElement(AssessmentAiReview, { assessmentId }));
    const generate = await screen.findByRole("button", {
      name: /Generate new draft/,
    });
    expect((generate as HTMLButtonElement).disabled).toBe(true);
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox"));
    await user.click(generate);
    await waitFor(() =>
      expect(
        request.mock.calls.some((call) => call[1]?.method === "POST"),
      ).toBe(true),
    );
    const post = request.mock.calls.find((call) => call[1]?.method === "POST")!;
    expect(JSON.parse(post[1].body)).toEqual({
      consent: true,
      inputHash: "a".repeat(64),
    });
  });
  it("retains edits after a failed save and blocks approval while dirty", async () => {
    request.mockImplementation(async (_url, init) =>
      init?.method === "PATCH"
        ? {
            ok: false,
            json: async () => ({ error: "A concurrent edit needs review." }),
          }
        : { ok: true, json: async () => view(true) },
    );
    render(createElement(AssessmentAiReview, { assessmentId }));
    const summary = await screen.findByLabelText("Executive summary");
    fireEvent.change(summary, {
      target: { value: "Revised evidence-backed summary." },
    });
    expect(
      (
        screen.getByRole("button", {
          name: "Approve internal review",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Save draft" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "concurrent edit",
    );
    expect((summary as HTMLTextAreaElement).value).toBe(
      "Revised evidence-backed summary.",
    );
    const patch = request.mock.calls.find(
      (call) => call[1]?.method === "PATCH",
    )!;
    expect(JSON.parse(patch[1].body)).toMatchObject({
      action: "save",
      reviewId,
      revision: 0,
    });
  });
  it("locks approved versions and does not offer customer publishing", async () => {
    const data = view(true);
    data.review!.status = "approved";
    request.mockResolvedValue({ ok: true, json: async () => data });
    render(createElement(AssessmentAiReview, { assessmentId }));
    expect(
      (
        (await screen.findByLabelText(
          "Executive summary",
        )) as HTMLTextAreaElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Approve internal review",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.queryByRole("button", { name: /Publish/ })).toBeNull();
  });
});
