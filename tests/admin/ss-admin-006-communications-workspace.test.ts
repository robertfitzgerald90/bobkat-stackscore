import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COMMUNICATIONS_GROUP_IDS,
  COMMUNICATIONS_GROUP_LABELS,
  COMMUNICATIONS_GROUPS,
  getVisibleCommunicationsGroups,
  isCommunicationsNavChildActive,
  resolveActiveCommunicationsGroup,
} from "@/lib/communications/nav";
import { canClientAccessPath } from "@/lib/command-center/route-access";
import { resolveActiveStaffPrimaryId } from "@/lib/navigation/sidebar-nav";

describe("SS-ADMIN-006 — Communications workspace refinement", () => {
  it("exposes five groups in approved order", () => {
    expect([...COMMUNICATIONS_GROUP_IDS]).toEqual([
      "overview",
      "outreach",
      "delivery",
      "automation",
      "configuration",
    ]);
    expect([...COMMUNICATIONS_GROUP_LABELS]).toEqual([
      "Overview",
      "Outreach",
      "Delivery",
      "Automation",
      "Configuration",
    ]);
  });

  it("maps destinations without renaming routes", () => {
    const hrefs = COMMUNICATIONS_GROUPS.flatMap((group) =>
      group.children.map((child) => child.href),
    );
    expect(hrefs).toEqual([
      "/admin/communications",
      "/admin/communications/analytics",
      "/admin/communications/campaigns",
      "/admin/communications/prospects",
      "/admin/communications/templates",
      "/admin/communications/history",
      "/admin/communications/testing",
      "/admin/communications/automations",
      "/admin/communications/components",
      "/admin/communications/variables",
      "/admin/communications/settings",
    ]);
  });

  it("resolves exclusive active groups for nested routes", () => {
    const cases: Array<[string, (typeof COMMUNICATIONS_GROUP_IDS)[number]]> = [
      ["/admin/communications", "overview"],
      ["/admin/communications/analytics", "overview"],
      ["/admin/communications/campaigns", "outreach"],
      ["/admin/communications/campaigns/new", "outreach"],
      ["/admin/communications/prospects", "outreach"],
      ["/admin/communications/prospects/import", "outreach"],
      ["/admin/communications/templates", "delivery"],
      ["/admin/communications/templates/EMAIL-001", "delivery"],
      ["/admin/communications/history", "delivery"],
      ["/admin/communications/testing", "delivery"],
      ["/admin/communications/automations", "automation"],
      ["/admin/communications/components", "configuration"],
      ["/admin/communications/variables", "configuration"],
      ["/admin/communications/settings", "configuration"],
    ];

    for (const [pathname, group] of cases) {
      expect(resolveActiveCommunicationsGroup(pathname), pathname).toBe(group);
    }
  });

  it("marks secondary destinations without overlapping siblings", () => {
    expect(
      isCommunicationsNavChildActive("/admin/communications", {
        href: "/admin/communications",
        label: "Overview",
        exact: true,
      }),
    ).toBe(true);
    expect(
      isCommunicationsNavChildActive("/admin/communications/analytics", {
        href: "/admin/communications",
        label: "Overview",
        exact: true,
      }),
    ).toBe(false);
    expect(
      isCommunicationsNavChildActive("/admin/communications/campaigns/abc", {
        href: "/admin/communications/campaigns",
        label: "Campaigns",
      }),
    ).toBe(true);
  });

  it("hides admin-only destinations for technicians", () => {
    const tech = getVisibleCommunicationsGroups(false);
    expect(tech.map((group) => group.id)).toEqual([
      "overview",
      "outreach",
      "delivery",
      "configuration",
    ]);
    expect(tech.some((group) => group.id === "automation")).toBe(false);
    const delivery = tech.find((group) => group.id === "delivery");
    expect(delivery?.children.map((child) => child.href)).toEqual([
      "/admin/communications/templates",
      "/admin/communications/history",
    ]);
    const configuration = tech.find((group) => group.id === "configuration");
    expect(configuration?.children.map((child) => child.href)).toEqual([
      "/admin/communications/variables",
    ]);
    expect(configuration?.defaultHref).toBe("/admin/communications/variables");
  });

  it("keeps staff sidebar Communications primary and blocks customers", () => {
    expect(resolveActiveStaffPrimaryId("/admin/communications/prospects")).toBe(
      "communications",
    );
    expect(
      canClientAccessPath("/admin/communications", {
        role: "client",
        userClientId: "c1",
        userId: "u1",
      }),
    ).toBe(false);
  });

  it("preserves Leads hub link to Communications Prospects", () => {
    const hub = readFileSync(
      join(process.cwd(), "src/components/admin/leads-hub-view.tsx"),
      "utf8",
    );
    expect(hub).toContain("/admin/communications/prospects");
  });

  it("does not modify PROJECTS_SHARED or PROJECT_COMPLETED automations", () => {
    const registry = readFileSync(
      join(process.cwd(), "src/lib/communications/automation-registry.ts"),
      "utf8",
    );
    expect(registry).toContain("PROJECTS_SHARED");
    expect(registry).toContain("PROJECT_COMPLETED");
    const ux015 = readFileSync(
      join(process.cwd(), "tests/ux/ss-ux-015-project-communications.test.ts"),
      "utf8",
    );
    expect(ux015).toContain("PROJECTS_SHARED");
    expect(ux015).toContain("PROJECT_COMPLETED");
  });

  it("uses two-level subnav and overview pulse from existing metrics", () => {
    const subnav = readFileSync(
      join(process.cwd(), "src/components/communications/communications-subnav.tsx"),
      "utf8",
    );
    expect(subnav).toContain("getVisibleCommunicationsGroups");
    expect(subnav).toContain("Communications workspace groups");
    const overview = readFileSync(
      join(process.cwd(), "src/components/communications/communications-dashboard-view.tsx"),
      "utf8",
    );
    expect(overview).toContain("Communications Pulse");
    expect(overview).toContain("outreachStats.activeCampaigns");
    expect(overview).toContain("stats.messagesSent");
    expect(overview).toContain("stats.failedDeliveries");
  });
});
