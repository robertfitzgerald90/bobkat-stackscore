import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CLIENT_WORKSPACE_GROUP_IDS,
  CLIENT_WORKSPACE_GROUPS,
  getStaffWorkspaceGroups,
  getVisibleWorkspaceNav,
  isWorkspaceNavChildActive,
  resolveActiveWorkspaceGroup,
  resolveActiveWorkspaceSection,
  resolveClientWorkspaceGroupHref,
  resolveClientWorkspaceNavHref,
} from "@/lib/client-workspace";
import {
  getConsultantSidebarNav as getStaffSidebar,
  getCustomerSidebarNav as getCustomerSidebar,
} from "@/lib/navigation/sidebar-nav";

describe("SS-ADMIN-003 — client workspace consolidation", () => {
  it("exposes five primary workspace groups in order", () => {
    expect(CLIENT_WORKSPACE_GROUP_IDS).toEqual([
      "overview",
      "assessment",
      "strategy",
      "execution",
      "relationship",
    ]);
    expect(getStaffWorkspaceGroups().map((group) => group.label)).toEqual([
      "Overview",
      "Assessment",
      "Strategy",
      "Execution",
      "Relationship",
    ]);
  });

  it("maps group defaults and children to preserved routes", () => {
    const clientId = "org-1";
    const expected: Record<string, { defaultHref: string; children: string[] }> = {
      overview: {
        defaultHref: "/clients/org-1/technology-profile",
        children: ["overview", "360", "journey"],
      },
      assessment: {
        defaultHref: "/clients/org-1/assessments",
        children: ["assessments", "explore", "assets"],
      },
      strategy: {
        defaultHref: "/clients/org-1/recommendations",
        children: ["recommendations", "roadmap", "documents", "executive-reports"],
      },
      execution: {
        defaultHref: "/clients/org-1/projects",
        children: ["projects"],
      },
      relationship: {
        defaultHref: "/clients/org-1/contacts",
        children: [
          "contacts",
          "lifecycle",
          "vcio",
          "quarterly-reviews",
          "billing",
          "activity",
          "communications",
        ],
      },
    };

    for (const group of CLIENT_WORKSPACE_GROUPS) {
      const spec = expected[group.id]!;
      expect(resolveClientWorkspaceGroupHref(clientId, group)).toBe(spec.defaultHref);
      expect(group.children.map((child) => child.section)).toEqual(spec.children);
      for (const child of group.children) {
        expect(resolveClientWorkspaceNavHref(clientId, child.section)).toContain(
          `/clients/${clientId}/`,
        );
      }
    }
  });

  it("hides Risks from staff navigation while preserving the route", () => {
    const labels = getStaffWorkspaceGroups().flatMap((group) =>
      group.children.map((child) => child.label),
    );
    expect(labels).not.toContain("Risks");
    expect(getVisibleWorkspaceNav("admin").some((item) => item.section === "risks")).toBe(
      false,
    );
    expect(resolveClientWorkspaceNavHref("c1", "risks")).toBe("/clients/c1/risks");
    expect(resolveActiveWorkspaceGroup("/clients/c1/risks")).toBe("overview");
  });

  it("resolves exclusive active groups for nested routes", () => {
    const cases: Array<[string, (typeof CLIENT_WORKSPACE_GROUP_IDS)[number]]> = [
      ["/clients/c1/technology-profile", "overview"],
      ["/clients/c1/360", "overview"],
      ["/clients/c1/journey", "overview"],
      ["/clients/c1/assessments", "assessment"],
      ["/clients/c1/assessments/history", "assessment"],
      ["/clients/c1/explore", "assessment"],
      ["/clients/c1/assets", "assessment"],
      ["/clients/c1/recommendations", "strategy"],
      ["/clients/c1/roadmap", "strategy"],
      ["/clients/c1/roadmap/phases/p1", "strategy"],
      ["/clients/c1/improvement-plan", "strategy"],
      ["/clients/c1/improvement-plan/tip-1", "strategy"],
      ["/clients/c1/documents", "strategy"],
      ["/clients/c1/executive-reports", "strategy"],
      ["/clients/c1/projects", "execution"],
      ["/clients/c1/projects/proj-1", "execution"],
      ["/clients/c1/projects/proj-1/completion-report", "execution"],
      ["/clients/c1/contacts", "relationship"],
      ["/clients/c1/business-profile", "relationship"],
      ["/clients/c1/lifecycle", "relationship"],
      ["/clients/c1/vcio", "relationship"],
      ["/clients/c1/vcio/onboarding", "relationship"],
      ["/clients/c1/quarterly-reviews", "relationship"],
      ["/clients/c1/quarterly-review/q1", "relationship"],
      ["/clients/c1/billing", "relationship"],
      ["/clients/c1/activity", "relationship"],
      ["/clients/c1/communications", "relationship"],
    ];

    for (const [pathname, group] of cases) {
      expect(resolveActiveWorkspaceGroup(pathname), pathname).toBe(group);
    }
  });

  it("marks nested secondary destinations without overlapping siblings", () => {
    const pathname = "/clients/c1/projects/proj-1";
    expect(resolveActiveWorkspaceGroup(pathname)).toBe("execution");
    expect(isWorkspaceNavChildActive(pathname, "projects")).toBe(true);
    expect(isWorkspaceNavChildActive(pathname, "recommendations")).toBe(false);
    expect(resolveActiveWorkspaceSection(pathname)).toBe("projects");
  });

  it("preserves client id in every group and child href", () => {
    const clientId = "tenant-xyz";
    for (const group of getStaffWorkspaceGroups()) {
      const groupHref = resolveClientWorkspaceGroupHref(clientId, group);
      expect(groupHref).toContain(`/clients/${clientId}/`);
      for (const child of group.children) {
        expect(resolveClientWorkspaceNavHref(clientId, child.section)).toContain(
          `/clients/${clientId}/`,
        );
      }
    }
  });

  it("preserves customer primary sidebar navigation (not five groups)", () => {
    expect(getCustomerSidebar("client-own").map((item) => item.label)).toEqual([
      "Overview",
      "Explore",
      "Roadmap",
      "Projects",
      "Reports",
    ]);
    expect(getStaffSidebar("admin", null).map((item) => item.label)).toContain("Clients");
  });

  it("keeps TIP, assessment history, and project communication routes associated", () => {
    expect(resolveActiveWorkspaceSection("/clients/c1/improvement-plan/tip-9")).toBe(
      "roadmap",
    );
    expect(resolveActiveWorkspaceGroup("/clients/c1/improvement-plan/tip-9")).toBe(
      "strategy",
    );
    expect(resolveActiveWorkspaceSection("/clients/c1/assessments/history")).toBe(
      "assessments",
    );
    expect(resolveActiveWorkspaceGroup("/clients/c1/assessments/compare")).toBe(
      "assessment",
    );
    expect(resolveActiveWorkspaceGroup("/clients/c1/projects/p1")).toBe("execution");
  });

  it("does not introduce a parallel customer five-group chrome in the shell", () => {
    const shell = readFileSync(
      join(process.cwd(), "src/components/client-workspace/client-workspace-shell.tsx"),
      "utf8",
    );
    expect(shell).toContain("!isCustomer");
    expect(shell).toContain("ClientWorkspaceApplicationChrome");
  });
});
