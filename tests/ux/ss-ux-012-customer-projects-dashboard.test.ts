import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCustomerProjectDetail,
  buildCustomerProjectsExperience,
  normalizeCustomerProjectViewFilter,
  projectMatchesCustomerView,
  type CustomerProjectRowInput,
} from "@/lib/customer-portal/projects-dto";
import { clientProjectDetailPath, clientWorkspaceProjectsPath } from "@/lib/clients/paths";
import { getCustomerSidebarNav } from "@/lib/navigation/sidebar-nav";

function projectRow(
  overrides: Partial<CustomerProjectRowInput> & Pick<CustomerProjectRowInput, "id" | "status">,
): CustomerProjectRowInput {
  return {
    title: "Harden privileged access",
    description: "Implement stronger administrative controls across critical systems.",
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
      businessImpact: "Reduce account takeover risk for administrators.",
      templateCode: "REC-MFA-1",
    },
    ...overrides,
  };
}

describe("SS-UX-012 — Customer Projects dashboard", () => {
  it("adds Projects as the fifth primary nav item", () => {
    expect(getCustomerSidebarNav("client-1").map((item) => item.label)).toEqual([
      "Overview",
      "Explore",
      "Roadmap",
      "Projects",
      "Reports",
    ]);
  });

  it("builds dashboard counts without inventing progress or cancelled rows", () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const experience = buildCustomerProjectsExperience({
      clientId: "client-1",
      companyName: "ABC LLC",
      now,
      view: "all",
      rows: [
        projectRow({ id: "p1", status: "proposed" }),
        projectRow({ id: "p2", status: "in_progress" }),
        projectRow({
          id: "p3",
          status: "completed",
          completedAt: "2026-05-01T00:00:00.000Z",
          targetCompletionDate: "2026-04-01T00:00:00.000Z",
        }),
        projectRow({ id: "p4", status: "cancelled" }),
      ],
    });

    expect(experience.summary).toEqual({
      plannedCount: 1,
      activeCount: 1,
      completedCount: 1,
      upcomingTargetDateCount: 2,
    });
    expect(experience.projects).toHaveLength(3);
    expect(experience.projects.every((project) => project.progressPercent === null)).toBe(true);
    expect(experience.projects.every((project) => project.status !== "cancelled")).toBe(true);
    expect(JSON.stringify(experience)).not.toMatch(/estimatedCost|actualCost|billing/i);
  });

  it("filters planned, active, and completed views", () => {
    expect(normalizeCustomerProjectViewFilter("active")).toBe("active");
    expect(projectMatchesCustomerView("approved", "planned")).toBe(true);
    expect(projectMatchesCustomerView("scheduled", "active")).toBe(true);
    expect(projectMatchesCustomerView("completed", "completed")).toBe(true);
    expect(projectMatchesCustomerView("cancelled", "all")).toBe(false);
  });

  it("builds detail without fabricating tasks and with customer-safe links", () => {
    const detail = buildCustomerProjectDetail({
      clientId: "client-1",
      companyName: "ABC LLC",
      row: projectRow({ id: "p1", status: "in_progress" }),
      recommendationVisible: true,
      initiatives: [
        {
          id: "init-1",
          title: "Phase 1 MFA rollout",
          phaseId: "phase-1",
          phaseName: "Stabilize",
        },
      ],
      activity: [],
    });

    expect(detail.progressPercent).toBeNull();
    expect(detail.tasks).toEqual([]);
    expect(detail.milestones).toEqual([]);
    expect(detail.listHref).toBe(clientWorkspaceProjectsPath("client-1"));
    expect(detail.recommendations[0]?.href).toContain("/recommendations?");
    expect(detail.roadmapInitiatives[0]?.href).toContain("/roadmap/phases/");
    expect(detail.completionReportHref).toBeNull();
    expect(detail.showUpdatesPlaceholder).toBe(true);
    expect(JSON.stringify(detail)).not.toMatch(/estimatedCost|assignedUser|internalNotes/i);
  });

  it("hides non-deliverable recommendations and includes completion report when done", () => {
    const detail = buildCustomerProjectDetail({
      clientId: "client-1",
      companyName: "ABC LLC",
      row: projectRow({
        id: "p2",
        status: "completed",
        completedAt: "2026-05-01T00:00:00.000Z",
      }),
      recommendationVisible: false,
      initiatives: [],
      activity: [
        {
          id: "a1",
          title: "Project completed",
          description: "Delivery finished.",
          occurredAt: "2026-05-01T00:00:00.000Z",
          eventType: "project_completed",
          category: "PROJECT",
          sourceRecordType: "Project",
          sourceRecordId: "p2",
        },
      ],
    });

    expect(detail.recommendations).toEqual([]);
    expect(detail.completionReportHref).toBe(
      "/clients/client-1/projects/p2/completion-report",
    );
    expect(detail.activity).toHaveLength(1);
  });

  it("routes customer project links to workspace detail, not staff register", () => {
    expect(clientProjectDetailPath("c1", "p1")).toBe("/clients/c1/projects/p1");
    expect(clientWorkspaceProjectsPath("c1")).toBe("/clients/c1/projects");

    const roadmapDto = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/roadmap-dto.ts"),
      "utf8",
    );
    expect(roadmapDto).toContain("clientProjectDetailPath");
    expect(roadmapDto).not.toMatch(
      /href: `\$\{clientProjectsPath\(clientId\)\}&selected=/,
    );

    const auth = readFileSync(join(process.cwd(), "src/lib/auth/auth.config.ts"), "utf8");
    expect(auth).toContain('pathname === "/projects"');
  });

  it("wires customer pages to experience services without mutations", () => {
    const listPage = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/projects/page.tsx"),
      "utf8",
    );
    const detailPage = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/projects/[projectId]/page.tsx"),
      "utf8",
    );
    const experience = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/projects-experience.ts"),
      "utf8",
    );

    expect(listPage).toContain("getCustomerProjectsExperience");
    expect(listPage).toContain("CustomerProjectsExperience");
    expect(detailPage).toContain("getCustomerProjectDetail");
    expect(experience).not.toContain("project.update");
    expect(experience).not.toMatch(/select:\s*\{[^}]*estimatedCost/);
    expect(experience).toContain("Never selects estimatedCost");
  });
});
