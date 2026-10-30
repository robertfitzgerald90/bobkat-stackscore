import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCommandCenterQuickActions,
  countOpenLeads,
  sortAttentionItems,
} from "@/lib/dashboard/command-center-rules";
import type { CommandCenterAttentionItem } from "@/lib/dashboard/command-center-types";
import { computeProjectProgress } from "@/lib/projects/progress";
import { getCustomerSidebarNav } from "@/lib/navigation/sidebar-nav";

describe("SS-ADMIN-004 — Command Center rules", () => {
  it("combines snapshot and website open leads without merging models", () => {
    expect(countOpenLeads(2, 3)).toBe(5);
    expect(countOpenLeads(0, 0)).toBe(0);
  });

  it("orders attention by overdue/age then title", () => {
    const items: CommandCenterAttentionItem[] = [
      {
        id: "b",
        kind: "overdue_task",
        title: "Beta",
        entityLabel: "Client",
        reason: "Overdue",
        dateLabel: null,
        href: "/projects",
        sortAt: "2026-01-02T00:00:00.000Z",
      },
      {
        id: "a",
        kind: "overdue_task",
        title: "Alpha",
        entityLabel: "Client",
        reason: "Overdue",
        dateLabel: null,
        href: "/projects",
        sortAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    expect(sortAttentionItems(items).map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("exposes role-aware Quick Actions without admin leads for technicians", () => {
    const admin = buildCommandCenterQuickActions("admin").map((action) => action.id);
    const tech = buildCommandCenterQuickActions("technician").map((action) => action.id);
    expect(admin).toContain("leads");
    expect(tech).not.toContain("leads");
    expect(buildCommandCenterQuickActions("admin").find((a) => a.id === "leads")?.href).toBe(
      "/leads",
    );
    expect(tech).toContain("clients");
    expect(tech).toContain("projects");
    expect(tech).toContain("assessments");
    expect(tech).toContain("communications");
    expect(tech).toContain("recurring");
    expect(admin.length).toBeLessThanOrEqual(6);
    expect(tech.length).toBeLessThanOrEqual(6);
  });

  it("reuses canonical task-based project progress", () => {
    expect(computeProjectProgress([])).toEqual({
      progressPercent: null,
      tasksTotal: 0,
      tasksCompleted: 0,
    });
    expect(
      computeProjectProgress([{ status: "completed" }, { status: "not_started" }]).progressPercent,
    ).toBe(50);
  });

  it("preserves customer primary navigation (not Command Center)", () => {
    expect(getCustomerSidebarNav("c1").map((item) => item.label)).toEqual([
      "Overview",
      "Explore",
      "Roadmap",
      "Projects",
      "Reports",
    ]);
  });

  it("wires Command Center loader into the dashboard page", () => {
    const page = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/dashboard/page.tsx"),
      "utf8",
    );
    expect(page).toContain("getCommandCenterSummary");
    expect(page).toContain("isCustomerMode");
    expect(page).toContain("customerOverviewPath");
  });

  it("documents open-lead model separation in rules module", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/dashboard/command-center-rules.ts"),
      "utf8",
    );
    expect(source).toContain("Prospect omitted");
    expect(source).toContain("SNAPSHOT_OPEN_LEAD_STATUSES");
    expect(source).toContain("WEBSITE_OPEN_LEAD_STATUSES");
  });
});
