import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCustomerProjectDetail,
  isCustomerProjectActivityEvent,
  type CustomerProjectRowInput,
} from "@/lib/customer-portal/projects-dto";
import {
  applyDraftEdits,
  buildCustomerFacingUpdateSections,
  buildProjectUpdateDraft,
  draftHasSendableContent,
  type ProjectUpdateDraftPayload,
} from "@/lib/projects/customer-update-draft";

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
const since = new Date("2026-10-01T00:00:00.000Z");

function sampleDraft(): ProjectUpdateDraftPayload {
  return buildProjectUpdateDraft({
    projectId: "p1",
    projectName: "Harden privileged access",
    projectStatus: "in_progress",
    tasks: [
      {
        id: "t-done",
        title: "Enroll admins in MFA",
        description: "Customer-visible step",
        status: "completed",
        dueDate: "2026-09-15T00:00:00.000Z",
        completedAt: "2026-10-15T00:00:00.000Z",
      },
      {
        id: "t-active",
        title: "Configure conditional access",
        description: null,
        status: "in_progress",
        dueDate: "2026-11-01T00:00:00.000Z",
        completedAt: null,
      },
      {
        id: "t-next",
        title: "Document break-glass procedure",
        description: null,
        status: "not_started",
        dueDate: "2026-11-15T00:00:00.000Z",
        completedAt: null,
      },
    ],
    milestones: [
      {
        id: "m-done",
        title: "MFA live for admins",
        description: null,
        targetDate: "2026-10-20T00:00:00.000Z",
        completedAt: "2026-10-18T00:00:00.000Z",
      },
      {
        id: "m-next",
        title: "Conditional access policies live",
        description: null,
        targetDate: "2026-11-30T00:00:00.000Z",
        completedAt: null,
      },
    ],
    statusEvents: [
      {
        id: "ev-status",
        title: "Status changed to In Progress",
        description: "Project moved from Scheduled to In Progress",
        occurredAt: "2026-10-10T00:00:00.000Z",
      },
    ],
    sincePublishedAt: since,
    now,
  });
}

describe("SS-UX-015 — Project updates & customer communications", () => {
  describe("customer-safe activity selection", () => {
    it("includes published update and status change events", () => {
      expect(isCustomerProjectActivityEvent("project_task_completed")).toBe(true);
      expect(isCustomerProjectActivityEvent("project_milestone_completed")).toBe(true);
      expect(isCustomerProjectActivityEvent("project_status_changed")).toBe(true);
      expect(isCustomerProjectActivityEvent("project_customer_update_published")).toBe(true);
      expect(isCustomerProjectActivityEvent("note_created")).toBe(false);
      expect(isCustomerProjectActivityEvent("internal_ops")).toBe(false);
    });

    it("filters internal activity out of customer detail", () => {
      const detail = buildCustomerProjectDetail({
        clientId: "client-1",
        companyName: "ABC LLC",
        row: projectRow({ id: "p1", status: "in_progress" }),
        recommendationVisible: true,
        initiatives: [],
        activity: [
          {
            id: "a1",
            title: "Task completed",
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
            description: "Staff-only",
            occurredAt: "2026-10-16T00:00:00.000Z",
            eventType: "note_created",
            category: "NOTE",
            sourceRecordType: "Note",
            sourceRecordId: "n1",
          },
        ],
        now,
      });

      expect(detail.activity).toHaveLength(1);
      expect(detail.activity[0]?.eventType).toBe("project_task_completed");
    });
  });

  describe("draft generation since previous update", () => {
    it("includes completed work after the watermark only", () => {
      const draft = sampleDraft();

      expect(draft.workCompleted.map((item) => item.id)).toEqual([
        "ev-status",
        "t-done",
        "m-done",
      ]);
      expect(draft.inProgress.map((item) => item.id)).toEqual(["t-active"]);
      expect(draft.comingNext.map((item) => item.id)).toEqual(["t-next", "m-next"]);
      expect(draft.progressPercent).toBe(33);
      expect(draft.nextMilestoneTitle).toBe("Conditional access policies live");
    });

    it("excludes completions before the previous published update", () => {
      const draft = buildProjectUpdateDraft({
        projectId: "p1",
        projectName: "Harden privileged access",
        projectStatus: "in_progress",
        tasks: [
          {
            id: "old",
            title: "Old task",
            description: null,
            status: "completed",
            dueDate: null,
            completedAt: "2026-09-01T00:00:00.000Z",
          },
          {
            id: "new",
            title: "New task",
            description: null,
            status: "completed",
            dueDate: null,
            completedAt: "2026-10-20T00:00:00.000Z",
          },
        ],
        milestones: [],
        sincePublishedAt: since,
        now,
      });

      expect(draft.workCompleted.map((item) => item.id)).toEqual(["new"]);
    });

    it("never invents completed work when nothing changed", () => {
      const draft = buildProjectUpdateDraft({
        projectId: "p1",
        projectName: "Quiet project",
        projectStatus: "scheduled",
        tasks: [],
        milestones: [],
        sincePublishedAt: since,
        now,
      });

      expect(draft.workCompleted).toEqual([]);
      expect(draft.inProgress).toEqual([]);
      expect(draft.comingNext).toEqual([]);
      expect(draft.progressPercent).toBeNull();
      expect(draft.includeWorkCompleted).toBe(false);
      expect(draftHasSendableContent(draft)).toBe(true); // status section remains
    });
  });

  describe("draft editing", () => {
    it("lets staff exclude activity items and toggle sections", () => {
      const draft = sampleDraft();
      const edited = applyDraftEdits(draft, {
        excludedItemIds: ["t-done", "t-next"],
        includeComingNext: false,
        staffMessage: "Call if you have questions.",
        includeStaffMessage: true,
      });

      expect(edited.workCompleted.find((item) => item.id === "t-done")?.included).toBe(false);
      expect(edited.comingNext.find((item) => item.id === "t-next")?.included).toBe(false);
      expect(edited.includeComingNext).toBe(false);
      expect(edited.staffMessage).toBe("Call if you have questions.");
      expect(edited.includeStaffMessage).toBe(true);
    });

    it("builds customer-facing sections without excluded items", () => {
      const draft = applyDraftEdits(sampleDraft(), {
        excludedItemIds: ["m-done"],
        includeStaffMessage: true,
        staffMessage: "Thanks for your patience.",
      });
      const sections = buildCustomerFacingUpdateSections(draft);

      expect(sections.workCompleted.map((item) => item.title)).toEqual([
        "Status changed to In Progress",
        "Enroll admins in MFA",
      ]);
      expect(sections.staffMessage).toBe("Thanks for your patience.");
      expect(sections.projectStatusLabel).toBeTruthy();
    });
  });

  describe("customer published update visibility", () => {
    it("maps published updates into the customer detail DTO", () => {
      const detail = buildCustomerProjectDetail({
        clientId: "client-1",
        companyName: "ABC LLC",
        row: projectRow({ id: "p1", status: "in_progress" }),
        recommendationVisible: true,
        initiatives: [],
        activity: [],
        publishedUpdates: [
          {
            id: "u1",
            publishedAt: "2026-10-28T15:00:00.000Z",
            subject: "Project Progress Update from Bobkat IT",
            customerFacing: {
              projectStatusLabel: "In Progress",
              progressPercent: 33,
              workCompleted: [{ title: "Enroll admins in MFA", completedAtLabel: "Oct 15, 2026" }],
              inProgress: [{ title: "Configure conditional access", targetOrDueLabel: "Nov 1, 2026" }],
              comingNext: [{ title: "Document break-glass procedure", targetOrDueLabel: null }],
              nextMilestoneTitle: "Conditional access policies live",
              nextMilestoneTargetLabel: "Nov 30, 2026",
              staffMessage: "On track.",
            },
          },
        ],
        now,
      });

      expect(detail.publishedUpdates).toHaveLength(1);
      expect(detail.publishedUpdates[0]?.subject).toContain("Project Progress");
      expect(detail.publishedUpdates[0]?.workCompleted[0]?.title).toBe("Enroll admins in MFA");
      expect(detail.publishedUpdates[0]?.staffMessage).toBe("On track.");
    });

    it("defaults publishedUpdates to empty when omitted", () => {
      const detail = buildCustomerProjectDetail({
        clientId: "client-1",
        companyName: "ABC LLC",
        row: projectRow({ id: "p1", status: "in_progress" }),
        recommendationVisible: false,
        initiatives: [],
        activity: [],
        now,
      });
      expect(detail.publishedUpdates).toEqual([]);
    });
  });

  describe("architecture safeguards", () => {
    it("registers EMAIL-011 as manual-only PROJECT_CUSTOMER_UPDATE", () => {
      const registry = readFileSync(
        join(process.cwd(), "src/lib/communications/automation-registry.ts"),
        "utf8",
      );
      expect(registry).toMatch(/event:\s*"PROJECT_CUSTOMER_UPDATE"/);
      expect(registry).toMatch(/templateKey:\s*"EMAIL-011"/);
      expect(registry).toMatch(/status:\s*"manual_only"/);
      expect(registry).toMatch(/Never automatic/);
    });

    it("does not alter PROJECTS_SHARED or PROJECT_COMPLETED automation wiring", () => {
      const registry = readFileSync(
        join(process.cwd(), "src/lib/communications/automation-registry.ts"),
        "utf8",
      );
      expect(registry).toMatch(/event:\s*"PROJECTS_SHARED"/);
      expect(registry).toMatch(/event:\s*"PROJECT_COMPLETED"/);
      expect(registry).toMatch(/templateKey:\s*"EMAIL-007"/);
      expect(registry).toMatch(/templateKey:\s*"EMAIL-008"/);
    });

    it("reuses recordAndSendCommunication and resolveRecipients", () => {
      const service = readFileSync(
        join(process.cwd(), "src/lib/projects/customer-update-service.ts"),
        "utf8",
      );
      expect(service).toMatch(/recordAndSendCommunication/);
      expect(service).toMatch(/resolveRecipients/);
      expect(service).toMatch(/idempotencyKey/);
      expect(service).toMatch(/isTest/);
      expect(service).not.toMatch(/nodemailer|sendgrid|postmark|mailgun/i);
    });

    it("excludes internalNotes from draft builder inputs", () => {
      const draftSource = readFileSync(
        join(process.cwd(), "src/lib/projects/customer-update-draft.ts"),
        "utf8",
      );
      expect(draftSource).not.toMatch(/internalNotes/);
      expect(draftSource).not.toMatch(/estimatedCost/);
      expect(draftSource).not.toMatch(/credential|password|secret/i);
    });

    it("wires Prepare Customer Update into staff delivery panel", () => {
      const panel = readFileSync(
        join(process.cwd(), "src/components/projects/project-delivery-panel.tsx"),
        "utf8",
      );
      expect(panel).toMatch(/ProjectCustomerUpdatePanel/);
    });

    it("exposes customer Updates section", () => {
      const ui = readFileSync(
        join(process.cwd(), "src/components/customer-portal/projects/customer-project-detail.tsx"),
        "utf8",
      );
      expect(ui).toMatch(/PublishedUpdatesFeed/);
      expect(ui).toMatch(/publishedUpdates/);
    });
  });
});
