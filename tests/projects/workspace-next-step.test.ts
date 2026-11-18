import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildCustomerProjectDetail } from "@/lib/customer-portal/projects-dto";
import { getProjectNextStep } from "@/lib/projects/workspace-next-step";
import { CustomerProjectDetail } from "@/components/customer-portal/projects/customer-project-detail";

function detail() {
  return buildCustomerProjectDetail({
    clientId: "c1",
    companyName: "Example",
    recommendationVisible: false,
    row: {
      id: "p1",
      title: "Recovery plan",
      description: "Test restores",
      priority: "high",
      status: "in_progress",
      startDate: null,
      targetCompletionDate: null,
      completedAt: null,
      categoryCode: "data_protection",
      categoryName: "Data protection",
      recommendation: null,
    },
    tasks: [
      {
        id: "t1",
        title: "Run restore test",
        description: null,
        status: "in_progress",
        dueDate: null,
        completedAt: null,
      },
    ],
    milestones: [],
    initiatives: [],
    activity: [],
    now: new Date("2026-11-06T12:00:00Z"),
  });
}
describe("shared project next step", () => {
  it("prioritizes a recorded overdue milestone over queued delivery work", () => {
    const data = detail();
    data.milestones = [
      {
        id: "m1",
        title: "Approve recovery evidence",
        description: null,
        targetDateLabel: "Nov 1, 2026",
        completedAtLabel: null,
        isComplete: false,
        isOverdue: true,
      },
    ];
    expect(getProjectNextStep(data)).toMatchObject({
      title: "Approve recovery evidence",
      urgent: true,
      href: "#project-delivery",
    });
  });
  it("uses current work and preserves unavailable dates", () => {
    expect(getProjectNextStep(detail())).toMatchObject({
      title: "Run restore test",
      description: "Currently in progress · Due date not set",
      urgent: false,
    });
  });
  it("does not suggest unfinished tasks for a completed or cancelled project", () => {
    const data = detail();
    data.status = "completed";
    expect(getProjectNextStep(data).title).toBe("Project complete");
    data.status = "cancelled";
    expect(getProjectNextStep(data)).toMatchObject({
      title: "Project cancelled",
      href: data.listHref,
    });
  });
  it("does not invent progress, task ownership, or customer obligations for an empty plan", () => {
    const data = detail();
    data.tasks = [];
    data.taskGroups = { inProgress: [], upNext: [], completed: [] };
    data.tasksTotal = 0;
    data.tasksCompleted = 0;
    expect(getProjectNextStep(data).title).toBe(
      "Delivery plan to be confirmed",
    );
  });
  it("shows one delivery view for each role with valid navigation targets", () => {
    const data = detail();
    const customer = renderToStaticMarkup(
      createElement(CustomerProjectDetail, { detail: data }),
    );
    expect(customer).toContain("Run restore test");
    expect(customer).toContain('id="project-delivery"');
    expect(customer).toContain("No published updates yet");
    const staff = renderToStaticMarkup(
      createElement(CustomerProjectDetail, {
        detail: data,
        management: createElement("div", null, "Staff delivery controls"),
      }),
    );
    expect(staff).toContain("Staff delivery controls");
    expect(staff).not.toContain("No upcoming tasks queued.");
    expect(customer).not.toContain("Staff delivery controls");
  });
});
