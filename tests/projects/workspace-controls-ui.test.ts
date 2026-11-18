// @vitest-environment jsdom
import { createElement, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectWorkspaceControls } from "@/components/projects/project-workspace-controls";
import { TaskDueDateControl } from "@/components/projects/task-due-date-control";
const navigation = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));
vi.mock("@/components/projects/project-delivery-panel", () => ({
  ProjectDeliveryPanel: () =>
    createElement("p", null, "Delivery checklist editor"),
}));
vi.mock("@/components/projects/project-customer-update-panel", () => ({
  ProjectCustomerUpdatePanel: function UpdateEditor() {
    const [text, setText] = useState("");
    return createElement("input", {
      "aria-label": "Update draft",
      value: text,
      onChange: (e: { target: { value: string } }) => setText(e.target.value),
    });
  },
}));
vi.mock("@/components/admin/project-admin-actions", () => ({
  ProjectAdminActions: () => createElement("p", null, "Admin record actions"),
}));
const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function mount(isAdmin = true) {
  return render(
    createElement(ProjectWorkspaceControls, {
      projectId: "p1",
      clientId: "c1",
      title: "Recovery plan",
      initialStatus: "in_progress",
      initialNotes: "Existing objective",
      isAdmin,
    }),
  );
}

describe("staff project workspace", () => {
  it("opens delivery first and preserves unsaved update drafts while switching sections", async () => {
    mount();
    const user = userEvent.setup();
    expect(screen.getByText("Delivery checklist editor")).toBeTruthy();
    expect(screen.queryByLabelText("Update draft")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Customer updates" }));
    await user.type(
      screen.getByLabelText("Update draft"),
      "Review before sending",
    );
    await user.click(
      screen.getByRole("button", { name: "Tasks & milestones" }),
    );
    await user.click(screen.getByRole("button", { name: "Customer updates" }));
    expect(
      (screen.getByLabelText("Update draft") as HTMLInputElement).value,
    ).toBe("Review before sending");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("keeps edits on failed save, allows retry, and marks a successful save clean", async () => {
    mount();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Project details" }));
    expect(
      (
        screen.getByRole("button", {
          name: "Save project",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await user.type(screen.getByLabelText("Project description"), " updated");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Save failed" }),
    });
    await user.click(screen.getByRole("button", { name: "Save project" }));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Save failed",
    );
    expect(
      (screen.getByLabelText("Project description") as HTMLTextAreaElement)
        .value,
    ).toBe("Existing objective updated");
    fetchMock.mockResolvedValueOnce({ ok: true });
    await user.click(screen.getByRole("button", { name: "Save project" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(
        "Project changes saved.",
      ),
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Save project",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(navigation.refresh).toHaveBeenCalledOnce();
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      status: "in_progress",
      notes: "Existing objective updated",
    });
  });
  it("hides record management from technicians", () => {
    mount(false);
    expect(
      screen.queryByRole("button", { name: "Record management" }),
    ).toBeNull();
    expect(screen.queryByText("Admin record actions")).toBeNull();
  });
  it("saves and clears due dates explicitly, retaining edits on a failed save", async () => {
    const save = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    render(
      createElement(TaskDueDateControl, {
        title: "Restore",
        dueDate: "2026-11-10T12:00:00.000Z",
        disabled: false,
        onSave: save,
      }),
    );
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Due date for Restore"));
    expect(save).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Save due date" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("not saved"),
    );
    await user.click(screen.getByRole("button", { name: "Save due date" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("Due date saved."),
    );
    expect(save).toHaveBeenLastCalledWith(null);
  });
  it("sends a selected calendar day in the API's ISO date format", async () => {
    const save = vi.fn().mockResolvedValue(true);
    render(
      createElement(TaskDueDateControl, {
        title: "Restore",
        dueDate: null,
        disabled: false,
        onSave: save,
      }),
    );
    fireEvent.change(screen.getByLabelText("Due date for Restore"), {
      target: { value: "2026-11-12" },
    });
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Save due date" }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith("2026-11-12T23:59:59.999Z"),
    );
  });
  it("opens delivery when the shared next-step link is activated", async () => {
    mount();
    render(createElement("a", { href: "#project-delivery" }, "View delivery"));
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Project details" }));
    expect(
      screen.queryByText("Delivery checklist editor", { selector: "p" }),
    ).toBeTruthy();
    await user.click(screen.getByRole("link", { name: "View delivery" }));
    expect(
      screen
        .getByRole("button", { name: "Tasks & milestones" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
