// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverviewNextMoves } from "@/components/customer-portal/overview/overview-next-moves";
import type { CustomerOverviewOpportunity } from "@/lib/customer-portal/overview-dto";
const navigation = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));
const priorities: CustomerOverviewOpportunity[] = Array.from(
  { length: 4 },
  (_, i) => ({
    id: `00000000-0000-4000-8000-00000000000${i}`,
    title: `Action ${i + 1}`,
    priority: "high",
    priorityLabel: "High",
    href: `/recommendations/${i}`,
    pillarCode: "identity_access",
    pillarName: "Identity & Access",
    description:
      "Finding: Recovery access is untested.\nRecommended action: Test recovery access.\nExpected outcome: Recover access reliably.",
    businessImpact: "Reduced downtime",
  }),
);
const task = {
  id: "saved-task",
  title: "Action 1",
  description: "",
  steps: "Test recovery access.",
  horizon: "now",
  status: "in_progress",
  pillarCode: "identity_access",
  owner: "Roy",
  dueDate: null,
  sourceRecommendationId: priorities[0].id,
};
const fetchMock = vi.fn();
function mount(readOnly = false) {
  return render(
    createElement(OverviewNextMoves, {
      priorities,
      tasks: [],
      clientId: "client-a",
      roadmapHref: "/clients/client-a/roadmap",
      recommendationsHref: "/recommendations",
      readOnly,
    }),
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  window.matchMedia = vi
    .fn()
    .mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ task }) });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("next best moves modal", () => {
  it("shows at most three real recommendations, opens their guidance, and closes with Escape", async () => {
    mount();
    const user = userEvent.setup();
    expect(screen.getAllByRole("button", { name: /View action/ })).toHaveLength(
      3,
    );
    expect(screen.queryByText("Action 4")).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "View action: Action 1" }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Test recovery access.")).toBeTruthy();
    expect(within(dialog).getByText("Recover access reliably.")).toBeTruthy();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("saves statuses to a linked task, then updates the same task without creating duplicates", async () => {
    mount();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "View action: Action 1" }),
    );
    const select = within(await screen.findByRole("dialog")).getByRole(
      "combobox",
      { name: "Action status" },
    );
    await user.selectOptions(select, "in_progress");
    await screen.findByText("Action status saved to your planner.");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      sourceRecommendationId: priorities[0].id,
      status: "in_progress",
    });
    await user.selectOptions(select, "blocked");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0]).toBe(
      "/api/v1/clients/client-a/planner/saved-task",
    );
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      status: "blocked",
    });
    expect(navigation.refresh).toHaveBeenCalled();
  });
  it("keeps the prior status when saving fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Save unavailable" }),
    });
    mount();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "View action: Action 1" }),
    );
    const select = within(await screen.findByRole("dialog")).getByRole(
      "combobox",
      { name: "Action status" },
    );
    await user.selectOptions(select, "in_progress");
    await screen.findByRole("alert");
    expect((select as HTMLSelectElement).value).toBe("planned");
    expect(navigation.refresh).not.toHaveBeenCalled();
  });
  it("creates a planned action before opening its exact location in the roadmap", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ task: { ...task, status: "planned" } }),
    });
    mount();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "View action: Action 1" }),
    );
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Open in roadmap",
      }),
    );
    await waitFor(() =>
      expect(navigation.push).toHaveBeenCalledWith(
        "/clients/client-a/roadmap#task-saved-task",
      ),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).status).toBe("planned");
  });
  it("keeps public previews read-only", async () => {
    mount(true);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "View action: Action 1" }),
    );
    expect(
      (
        within(await screen.findByRole("dialog")).getByRole(
          "combobox",
        ) as HTMLSelectElement
      ).disabled,
    ).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
