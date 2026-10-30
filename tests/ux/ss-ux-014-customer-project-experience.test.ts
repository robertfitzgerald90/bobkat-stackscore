import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCustomerProjectDetail,
  groupCustomerProjectTasks,
  isCustomerProjectActivityEvent,
  type CustomerProjectRowInput,
} from "@/lib/customer-portal/projects-dto";

function projectRow(
  overrides: Partial<CustomerProjectRowInput> & Pick<CustomerProjectRowInput, "id" | "status">,
): CustomerProjectRowInput {
  return {
    title: "Harden privileged access",
    description: "Implement stronger administrative controls.",
    priority: "high",
    startDate: "2026-01-10T00:00:00.000Z",
    targetCompletionDate: "2026-12-31T00:00:00.000Z",
    completedAt: null,
    categoryCode: "identity_access",
    categoryName: "Identity & Access",
    recommendation: {
      id: "rec-1",
      title: "Require MFA for privileged accounts",
      status: "accepted",
      businessImpact: "Reduce account takeover risk.",
      templateCode: "REC-MFA-1",
    },
    ...overrides,
  };
}

const now = new Date("2026-10-30T12:00:00.000Z");

describe("SS-UX-014 — Customer project tracking experience", () => {
  it("builds overview with null progress when there are no tasks", () => {
    const detail = buildCustomerProjectDetail({
      clientId: "client-1",
      companyName: "ABC LLC",
      row: projectRow({ id: "p1", status: "in_progress" }),
      recommendationVisible: true,
      initiatives: [],
      activity: [],
      now,
    });

    expect(detail.progressPercent).toBeNull();
    expect(detail.tasksTotal).toBe(0);
    expect(detail.tasksCompleted).toBe(0);
    expect(detail.nextMilestone).toBeNull();
    expect(detail.startDateLabel).toBeTruthy();
    expect(detail.targetCompletionDateLabel).toBeTruthy();
    expect(detail.pillarName).toBeTruthy();
  });

  it("groups tasks and reports partial progress without inventing percentages", () => {
    const detail = buildCustomerProjectDetail({
      clientId: "client-1",
      companyName: "ABC LLC",
      row: projectRow({ id: "p1", status: "in_progress" }),
      recommendationVisible: true,
      initiatives: [],
      activity: [],
      tasks: [
        {
          id: "t1",
          title: "Active work",
          description: "Visible description",
          status: "in_progress",
          dueDate: "2026-11-01T00:00:00.000Z",
          completedAt: null,
        },
        {
          id: "t2",
          title: "Queued",
          description: null,
          status: "not_started",
          dueDate: null,
          completedAt: null,
        },
        {
          id: "t3",
          title: "Done",
          description: "Finished step",
          status: "completed",
          dueDate: null,
          completedAt: "2026-10-15T00:00:00.000Z",
        },
      ],
      progressPercent: 33,
      tasksTotal: 3,
      tasksCompleted: 1,
      now,
    });

    expect(detail.progressPercent).toBe(33);
    expect(detail.tasksCompleted).toBe(1);
    expect(detail.tasksTotal).toBe(3);
    expect(detail.taskGroups.inProgress).toHaveLength(1);
    expect(detail.taskGroups.upNext).toHaveLength(1);
    expect(detail.taskGroups.completed).toHaveLength(1);
    expect(detail.taskGroups.completed[0]?.completedAtLabel).toBeTruthy();
    expect(JSON.stringify(detail)).not.toMatch(/internalNotes/i);
  });

  it("marks 100% when all tasks are complete without auto-completing the project", () => {
    const detail = buildCustomerProjectDetail({
      clientId: "client-1",
      companyName: "ABC LLC",
      row: projectRow({ id: "p1", status: "in_progress" }),
      recommendationVisible: true,
      initiatives: [],
      activity: [],
      tasks: [
        {
          id: "t1",
          title: "A",
          description: null,
          status: "completed",
          dueDate: null,
          completedAt: "2026-10-01T00:00:00.000Z",
        },
        {
          id: "t2",
          title: "B",
          description: null,
          status: "completed",
          dueDate: null,
          completedAt: "2026-10-02T00:00:00.000Z",
        },
      ],
      progressPercent: 100,
      tasksTotal: 2,
      tasksCompleted: 2,
      now,
    });

    expect(detail.progressPercent).toBe(100);
    expect(detail.status).toBe("in_progress");
    expect(detail.taskGroups.completed).toHaveLength(2);
    expect(detail.taskGroups.inProgress).toHaveLength(0);
  });

  it("selects next milestone and flags overdue open milestones", () => {
    const detail = buildCustomerProjectDetail({
      clientId: "client-1",
      companyName: "ABC LLC",
      row: projectRow({ id: "p1", status: "in_progress" }),
      recommendationVisible: true,
      initiatives: [],
      activity: [],
      milestones: [
        {
          id: "m-done",
          title: "Kickoff",
          description: "Done",
          targetDate: "2026-09-01T00:00:00.000Z",
          completedAt: "2026-09-02T00:00:00.000Z",
        },
        {
          id: "m-overdue",
          title: "Controls published",
          description: "Late",
          targetDate: "2026-10-01T00:00:00.000Z",
          completedAt: null,
        },
        {
          id: "m-future",
          title: "Final review",
          description: "Later",
          targetDate: "2026-12-01T00:00:00.000Z",
          completedAt: null,
        },
      ],
      now,
    });

    expect(detail.milestones).toHaveLength(3);
    expect(detail.milestones.find((m) => m.id === "m-overdue")?.isOverdue).toBe(true);
    expect(detail.milestones.find((m) => m.id === "m-future")?.isOverdue).toBe(false);
    expect(detail.milestones.find((m) => m.id === "m-done")?.isOverdue).toBe(false);
    expect(detail.nextMilestone).toEqual({
      id: "m-overdue",
      title: "Controls published",
      targetDateLabel: expect.any(String),
      isOverdue: true,
    });
  });

  it("supports multiple linked recommendations and filters non-project activity", () => {
    const detail = buildCustomerProjectDetail({
      clientId: "client-1",
      companyName: "ABC LLC",
      row: projectRow({ id: "p1", status: "completed", completedAt: "2026-10-20T00:00:00.000Z" }),
      recommendationVisible: true,
      recommendations: [
        {
          id: "rec-1",
          title: "MFA",
          status: "completed",
          statusLabel: "completed",
          href: "/clients/client-1/recommendations?selected=rec-1",
        },
        {
          id: "rec-2",
          title: "Privileged groups",
          status: "accepted",
          statusLabel: "accepted",
          href: "/clients/client-1/recommendations?selected=rec-2",
        },
      ],
      initiatives: [
        {
          id: "init-1",
          title: "Phase MFA",
          phaseId: "phase-1",
          phaseName: "Stabilize",
        },
      ],
      activity: [
        {
          id: "a1",
          title: "Task completed: Enroll admins",
          description: null,
          occurredAt: "2026-10-15T00:00:00.000Z",
          eventType: "project_task_completed",
          category: "PROJECT",
          sourceRecordType: "Project",
          sourceRecordId: "p1",
        },
        {
          id: "a2",
          title: "Internal note",
          description: "secret",
          occurredAt: "2026-10-16T00:00:00.000Z",
          eventType: "staff_internal_note",
          category: "PROJECT",
          sourceRecordType: "Project",
          sourceRecordId: "p1",
        },
        {
          id: "a3",
          title: "Project completed",
          description: null,
          occurredAt: "2026-10-20T00:00:00.000Z",
          eventType: "project_completed",
          category: "PROJECT",
          sourceRecordType: "Project",
          sourceRecordId: "p1",
        },
      ],
      now,
    });

    expect(detail.recommendations).toHaveLength(2);
    expect(detail.roadmapInitiatives[0]?.href).toContain("/roadmap/phases/");
    expect(detail.activity).toHaveLength(2);
    expect(detail.activity.map((event) => event.eventType)).toEqual([
      "project_task_completed",
      "project_completed",
    ]);
    expect(detail.activity[0]?.kindLabel).toBe("Task completed");
    expect(detail.completionReportHref).toContain("/completion-report");
    expect(isCustomerProjectActivityEvent("staff_internal_note")).toBe(false);
  });

  it("keeps empty milestone projects without fabricating next milestone", () => {
    const detail = buildCustomerProjectDetail({
      clientId: "client-1",
      companyName: "ABC LLC",
      row: projectRow({ id: "p1", status: "proposed" }),
      recommendationVisible: false,
      initiatives: [],
      activity: [],
      milestones: [],
      now,
    });
    expect(detail.milestones).toEqual([]);
    expect(detail.nextMilestone).toBeNull();
    expect(detail.recommendations).toEqual([]);
  });

  it("groups helper preserves order within buckets", () => {
    const grouped = groupCustomerProjectTasks([
      {
        id: "1",
        title: "A",
        description: null,
        status: "not_started",
        statusLabel: "Not Started",
        dueDateLabel: null,
        completedAtLabel: null,
        group: "up_next",
      },
      {
        id: "2",
        title: "B",
        description: null,
        status: "in_progress",
        statusLabel: "In Progress",
        dueDateLabel: null,
        completedAtLabel: null,
        group: "in_progress",
      },
      {
        id: "3",
        title: "C",
        description: null,
        status: "not_started",
        statusLabel: "Not Started",
        dueDateLabel: null,
        completedAtLabel: null,
        group: "up_next",
      },
    ]);
    expect(grouped.upNext.map((task) => task.id)).toEqual(["1", "3"]);
    expect(grouped.inProgress.map((task) => task.id)).toEqual(["2"]);
  });

  it("wires customer detail UI to grouped tasks, timeline, and related improvements", () => {
    const detailUi = readFileSync(
      join(
        process.cwd(),
        "src/components/customer-portal/projects/customer-project-detail.tsx",
      ),
      "utf8",
    );
    const experience = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/projects-experience.ts"),
      "utf8",
    );

    expect(detailUi).toContain("taskGroups");
    expect(detailUi).toContain("In Progress");
    expect(detailUi).toContain("Up Next");
    expect(detailUi).toContain("Completed");
    expect(detailUi).toContain("Milestone timeline");
    expect(detailUi).toContain("nextMilestone");
    expect(detailUi).toContain("<details");
    expect(detailUi).not.toMatch(/method:\s*["']POST["']/);
    expect(detailUi).not.toContain("internalNotes");
    expect(experience).toContain("Never selects estimatedCost");
    expect(experience).not.toContain("internalNotes");
  });
});
