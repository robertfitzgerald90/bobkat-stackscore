// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectDeliveryPanel } from "@/components/projects/project-delivery-panel";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const request = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", request);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("delivery workspace recovery", () => {
  it("replaces a failed loader with retry and recovers without writing records", async () => {
    request
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          progress: { progressPercent: null, tasksTotal: 0, tasksCompleted: 0 },
          tasks: [],
          milestones: [],
          recommendations: [],
        }),
      });
    render(
      createElement(ProjectDeliveryPanel, { projectId: "p1", clientId: "c1" }),
    );
    expect((await screen.findByRole("alert")).textContent).toContain(
      "could not be loaded",
    );
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Retry delivery details" }));
    expect(await screen.findByLabelText("New task title")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(request).toHaveBeenCalledTimes(2);
    for (const call of request.mock.calls)
      expect(call).toEqual(["/api/v1/projects/p1/delivery"]);
  });
});
