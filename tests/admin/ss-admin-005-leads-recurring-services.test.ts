import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getConsultantSidebarNav,
  resolveActiveStaffPrimaryId,
} from "@/lib/navigation/sidebar-nav";
import { buildCommandCenterQuickActions, countOpenLeads } from "@/lib/dashboard/command-center-rules";
import { canClientAccessPath } from "@/lib/command-center/route-access";
import { getPageTitle } from "@/lib/navigation/page-titles";

describe("SS-ADMIN-005 — Leads & Recurring Services", () => {
  it("points Leads primary navigation at the hub without merging source routes", () => {
    const leads = getConsultantSidebarNav("admin", null).find((item) => item.id === "leads");
    expect(leads?.href).toBe("/leads");
    expect(leads?.children?.map((child) => child.href)).toEqual([
      "/snapshot-leads",
      "/website-leads",
    ]);
    expect(resolveActiveStaffPrimaryId("/leads")).toBe("leads");
    expect(resolveActiveStaffPrimaryId("/snapshot-leads")).toBe("leads");
    expect(resolveActiveStaffPrimaryId("/website-leads")).toBe("leads");
    expect(resolveActiveStaffPrimaryId("/admin/communications/prospects")).toBe(
      "communications",
    );
  });

  it("keeps technician users from seeing Leads nav", () => {
    const tech = getConsultantSidebarNav("technician", null);
    expect(tech.some((item) => item.id === "leads")).toBe(false);
  });

  it("blocks customer access to the Leads hub and intake queues", () => {
    const ctx = { role: "client" as const, userClientId: "c1", userId: "u1" };
    expect(canClientAccessPath("/leads", ctx)).toBe(false);
    expect(canClientAccessPath("/snapshot-leads", ctx)).toBe(false);
    expect(canClientAccessPath("/website-leads", ctx)).toBe(false);
  });

  it("preserves Open Intake Leads calculation and hub links", () => {
    expect(countOpenLeads(2, 4)).toBe(6);
    const actions = buildCommandCenterQuickActions("admin");
    expect(actions.find((action) => action.id === "leads")?.href).toBe("/leads");
    const view = readFileSync(
      join(process.cwd(), "src/components/dashboard/dashboard-view.tsx"),
      "utf8",
    );
    expect(view).toContain("Open Intake Leads");
    expect(view).toContain('href="/leads"');
    expect(view).not.toMatch(/label=\"Open Leads\"/);
  });

  it("registers Leads hub page title and source-preserving hub loader", () => {
    expect(getPageTitle("/leads")).toBe("Leads");
    const hub = readFileSync(join(process.cwd(), "src/lib/leads/hub.ts"), "utf8");
    expect(hub).toContain("getTechnologySnapshotLeadSummaryStats");
    expect(hub).toContain("getWebsiteLeadSummaryStats");
    expect(hub).toContain("listProspects");
    expect(hub).toContain("Keeps TechnologySnapshotLead, WebsiteLead, and Prospect separate");
  });

  it("uses distinct-client counting for Recurring Services overview", () => {
    const overview = readFileSync(
      join(process.cwd(), "src/lib/vcio/recurring-services-overview.ts"),
      "utf8",
    );
    expect(overview).toContain("countDistinctRecurringServiceClients");
    expect(overview).toContain("distinctActiveClients");
    expect(overview).toContain("pending_activation");
    expect(overview).toContain('serviceType: "stackscore_vcio"');
    expect(overview).toContain("ACTIVE_RECURRING_STATUSES");
  });

  it("presents Recurring Services label on /admin/vcio without renaming the route", () => {
    const page = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/admin/vcio/page.tsx"),
      "utf8",
    );
    expect(page).toContain("getRecurringServicesOverview");
    expect(page).toContain("RecurringServicesAdminView");
    const view = readFileSync(
      join(process.cwd(), "src/components/vcio/recurring-services-admin-view.tsx"),
      "utf8",
    );
    expect(view).toContain("Recurring Services");
    expect(view).toContain("StackScore vCIO");
    expect(view).toContain("isAdmin");
    expect(view).toContain("/clients/");
  });

  it("gates the Leads hub page to admin", () => {
    const page = readFileSync(join(process.cwd(), "src/app/(dashboard)/leads/page.tsx"), "utf8");
    expect(page).toContain('role !== "admin"');
    expect(page).toContain("getLeadsHubSummary");
  });
});
