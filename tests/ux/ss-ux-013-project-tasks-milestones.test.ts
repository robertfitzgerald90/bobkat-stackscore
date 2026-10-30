import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCustomerProjectDetail,
  buildCustomerProjectsExperience,
  type CustomerProjectRowInput,
} from "@/lib/customer-portal/projects-dto";
import {
  toCustomerVisibleMilestone,
  toCustomerVisibleTask,
  type SerializedProjectMilestone,
  type SerializedProjectTask,
} from "@/lib/projects/delivery-dto";
import { computeProjectProgress } from "@/lib/projects/progress";

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

function staffTask(
  overrides: Partial<SerializedProjectTask> = {},
): SerializedProjectTask {
  return {
    id: "task-1",
    projectId: "p1",
    clientId: "client-1",
    title: "Enroll admins in MFA",
    description: "Customer-visible step",
    internalNotes: "Staff-only: use Okta admin console",
    status: "not_started",
    dueDate: "2026-07-01T00:00:00.000Z",
    sortOrder: 0,
    completedAt: null,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function staffMilestone(
  overrides: Partial<SerializedProjectMilestone> = {},
): SerializedProjectMilestone {
  return {
    id: "ms-1",
    projectId: "p1",
    clientId: "client-1",
    title: "MFA live for admins",
    description: "All privileged accounts enrolled",
    targetDate: "2026-08-01T00:00:00.000Z",
    completedAt: null,
    sortOrder: 0,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("SS-UX-013 — Project tasks, milestones & recommendation relationships", () => {
  describe("progress calculations", () => {
    it("returns null progress for zero-task projects", () => {
      expect(computeProjectProgress([])).toEqual({
        progressPercent: null,
        tasksTotal: 0,
        tasksCompleted: 0,
      });
    });

    it("computes percent from completed / total tasks", () => {
      expect(
        computeProjectProgress([
          { status: "completed" },
          { status: "in_progress" },
          { status: "not_started" },
          { status: "completed" },
        ]),
      ).toEqual({
        progressPercent: 50,
        tasksTotal: 4,
        tasksCompleted: 2,
      });
    });

    it("rounds percent and reaches 100 without implying project completion", () => {
      expect(
        computeProjectProgress([
          { status: "completed" },
          { status: "completed" },
          { status: "completed" },
        ]),
      ).toEqual({
        progressPercent: 100,
        tasksTotal: 3,
        tasksCompleted: 3,
      });
    });
  });

  describe("customer-safe projections", () => {
    it("excludes internal staff notes from customer task projection", () => {
      const visible = toCustomerVisibleTask(staffTask());
      expect(visible).toEqual({
        id: "task-1",
        title: "Enroll admins in MFA",
        description: "Customer-visible step",
        status: "not_started",
        dueDate: "2026-07-01T00:00:00.000Z",
        completedAt: null,
        sortOrder: 0,
      });
      expect(JSON.stringify(visible)).not.toMatch(/internalNotes|Okta admin/i);
    });

    it("projects milestones without staff-only fields", () => {
      const visible = toCustomerVisibleMilestone(staffMilestone());
      expect(visible.title).toBe("MFA live for admins");
      expect(visible.targetDate).toBe("2026-08-01T00:00:00.000Z");
      expect(JSON.stringify(visible)).not.toMatch(/internalNotes|estimatedCost/i);
    });

    it("builds detail with tasks, milestones, multi-recommendations, and progress", () => {
      const detail = buildCustomerProjectDetail({
        clientId: "client-1",
        companyName: "ABC LLC",
        row: projectRow({ id: "p1", status: "in_progress", progressPercent: 50 }),
        recommendationVisible: true,
        recommendations: [
          {
            id: "rec-1",
            title: "Require MFA for privileged accounts",
            status: "accepted",
            statusLabel: "accepted",
            href: "/clients/client-1/recommendations?selected=rec-1",
          },
          {
            id: "rec-2",
            title: "Review privileged group membership",
            status: "accepted",
            statusLabel: "accepted",
            href: "/clients/client-1/recommendations?selected=rec-2",
          },
        ],
        initiatives: [],
        activity: [],
        tasks: [
          {
            id: "t1",
            title: "Enroll admins",
            description: "Customer description",
            status: "completed",
            dueDate: "2026-07-01T00:00:00.000Z",
            completedAt: "2026-06-15T00:00:00.000Z",
          },
          {
            id: "t2",
            title: "Verify backup admins",
            description: null,
            status: "not_started",
            dueDate: null,
            completedAt: null,
          },
        ],
        milestones: [
          {
            id: "m1",
            title: "MFA live",
            description: "Checkpoint",
            targetDate: "2026-08-01T00:00:00.000Z",
            completedAt: null,
          },
        ],
        progressPercent: 50,
        tasksTotal: 2,
        tasksCompleted: 1,
      });

      expect(detail.progressPercent).toBe(50);
      expect(detail.tasksTotal).toBe(2);
      expect(detail.tasksCompleted).toBe(1);
      expect(detail.tasks).toHaveLength(2);
      expect(detail.tasks[0]?.statusLabel).toBe("Complete");
      expect(detail.milestones[0]?.isComplete).toBe(false);
      expect(detail.recommendations).toHaveLength(2);
      expect(JSON.stringify(detail)).not.toMatch(/internalNotes|estimatedCost|assignedUser/i);
    });

    it("keeps dashboard progress null when rows omit progress", () => {
      const experience = buildCustomerProjectsExperience({
        clientId: "client-1",
        companyName: "ABC LLC",
        rows: [projectRow({ id: "p1", status: "in_progress" })],
      });
      expect(experience.projects[0]?.progressPercent).toBeNull();
    });

    it("surfaces precomputed progress on cards when tasks exist", () => {
      const experience = buildCustomerProjectsExperience({
        clientId: "client-1",
        companyName: "ABC LLC",
        rows: [projectRow({ id: "p1", status: "in_progress", progressPercent: 33 })],
      });
      expect(experience.projects[0]?.progressPercent).toBe(33);
    });
  });

  describe("ordering contracts", () => {
    it("documents task and milestone reorder APIs and sortOrder usage", () => {
      const taskReorder = readFileSync(
        join(process.cwd(), "src/app/api/v1/projects/[id]/tasks/reorder/route.ts"),
        "utf8",
      );
      const milestoneReorder = readFileSync(
        join(process.cwd(), "src/app/api/v1/projects/[id]/milestones/reorder/route.ts"),
        "utf8",
      );
      const delivery = readFileSync(
        join(process.cwd(), "src/lib/projects/delivery-service.ts"),
        "utf8",
      );

      expect(taskReorder).toContain("reorderProjectTasks");
      expect(milestoneReorder).toContain("reorderProjectMilestones");
      expect(delivery).toContain("sortOrder: index");
      expect(delivery).toContain('orderBy: [{ sortOrder: "asc" }');
    });
  });

  describe("recommendation lifecycle safeguards", () => {
    it("does not change recommendation status when linking or completing tasks/milestones", () => {
      const delivery = readFileSync(
        join(process.cwd(), "src/lib/projects/delivery-service.ts"),
        "utf8",
      );
      expect(delivery).toContain("Does not change recommendation status");
      expect(delivery).not.toMatch(
        /assessmentRecommendation\.update[\s\S]{0,80}status:\s*["']completed/,
      );
      expect(delivery).toContain("linkProjectRecommendation");
      expect(delivery).toContain("createProjectTask");
      expect(delivery).toContain("createProjectMilestone");
    });

    it("completes only the primary legacy recommendation on project completion", () => {
      const service = readFileSync(
        join(process.cwd(), "src/lib/projects/service.ts"),
        "utf8",
      );
      expect(service).toContain(
        "additional ProjectRecommendation links are NOT auto-completed",
      );
      expect(service).toContain("existing.recommendationId");
      expect(service).toMatch(
        /assessmentRecommendation\.update\(\{\s*where:\s*\{\s*id:\s*existing\.recommendationId/,
      );
    });

    it("preserves legacy Project.recommendationId while using ProjectRecommendation join", () => {
      const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");
      expect(schema).toContain("model ProjectRecommendation");
      expect(schema).toContain("model ProjectTask");
      expect(schema).toContain("model ProjectMilestone");
      expect(schema).toMatch(/model Project \{[\s\S]*?recommendationId\s+String\s+@unique/);
      expect(schema).toContain("internalNotes");

      const migration = readFileSync(
        join(
          process.cwd(),
          "prisma/migrations/20261030100000_project_tasks_milestones_recommendations/migration.sql",
        ),
        "utf8",
      );
      expect(migration).toContain("INSERT INTO \"ProjectRecommendation\"");
      expect(migration).toContain("ON CONFLICT (\"recommendationId\") DO NOTHING");
      expect(migration).not.toContain("DROP COLUMN \"recommendationId\"");
    });
  });

  describe("security & no StackScore mutations", () => {
    it("guards delivery APIs to consultant/admin and scopes customer experience", () => {
      const taskRoute = readFileSync(
        join(process.cwd(), "src/app/api/v1/projects/[id]/tasks/route.ts"),
        "utf8",
      );
      const experience = readFileSync(
        join(process.cwd(), "src/lib/customer-portal/projects-experience.ts"),
        "utf8",
      );
      const detailUi = readFileSync(
        join(
          process.cwd(),
          "src/components/customer-portal/projects/customer-project-detail.tsx",
        ),
        "utf8",
      );

      expect(taskRoute).toContain("requireConsultantOrAdmin");
      expect(experience).toContain('where: { id: projectId, clientId }');
      expect(experience).toContain("Never selects estimatedCost");
      expect(experience).not.toContain("internalNotes");
      expect(detailUi).toContain("detail.tasks");
      expect(detailUi).toContain("detail.milestones");
      expect(detailUi).not.toMatch(/method:\s*["']POST["']/);
    });

    it("delivery and progress paths never update assessment scores", () => {
      const delivery = readFileSync(
        join(process.cwd(), "src/lib/projects/delivery-service.ts"),
        "utf8",
      );
      const progress = readFileSync(
        join(process.cwd(), "src/lib/projects/progress.ts"),
        "utf8",
      );
      expect(delivery).not.toMatch(
        /assessmentScore|overallScore|categoryScore|prisma\.assessment\./i,
      );
      expect(progress).not.toMatch(
        /from ["']@\/lib\/db|assessmentScore|overallScore|prisma\./i,
      );
      expect(progress).toContain("Does not mutate project status or StackScore");
      expect(delivery).toContain("Does not mutate StackScore");
    });
  });

  describe("staff UI wiring", () => {
    it("embeds ProjectDeliveryPanel in the staff projects dashboard", () => {
      const dashboard = readFileSync(
        join(process.cwd(), "src/components/projects/projects-dashboard.tsx"),
        "utf8",
      );
      expect(dashboard).toContain("ProjectDeliveryPanel");
    });
  });
});
