import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getConsultantSidebarNav,
  getCustomerSidebarNav,
  isSidebarNavItemActive,
  isStaffNavChildActive,
  resolveActiveStaffPrimaryId,
  STAFF_PRIMARY_NAV_LABELS,
} from "@/lib/navigation/sidebar-nav";

describe("SS-ADMIN-002 — administrative navigation consolidation", () => {
  it("exposes seven primary destinations in order for admin", () => {
    const nav = getConsultantSidebarNav("admin", null, { "/website-leads": 3 });
    expect(nav.map((item) => item.label)).toEqual([...STAFF_PRIMARY_NAV_LABELS]);
    expect(nav.map((item) => item.id)).toEqual([
      "command-center",
      "clients",
      "projects",
      "leads",
      "recurring-services",
      "communications",
      "operations",
    ]);
  });

  it("groups Leads children without merging models", () => {
    const leads = getConsultantSidebarNav("admin", null, { "/website-leads": 3 }).find(
      (item) => item.id === "leads",
    );
    expect(leads?.children?.map((child) => child.href)).toEqual([
      "/snapshot-leads",
      "/website-leads",
    ]);
    expect(leads?.children?.every((child) => child.adminOnly)).toBe(true);
    expect(leads?.badgeCount).toBe(3);
    expect(leads?.children?.find((child) => child.href === "/website-leads")?.badgeCount).toBe(3);
  });

  it("groups Operations children and includes Technology Catalog", () => {
    const operations = getConsultantSidebarNav("admin", null).find(
      (item) => item.id === "operations",
    );
    expect(operations?.children?.map((child) => child.label)).toEqual([
      "Billing",
      "Users",
      "Assessment Library",
      "Technology Catalog",
      "Settings",
    ]);
    expect(operations?.children?.some((child) => child.href === "/technology-catalog")).toBe(
      true,
    );
  });

  it("exposes Command Center secondary destinations including Assessments", () => {
    const command = getConsultantSidebarNav("admin", null).find(
      (item) => item.id === "command-center",
    );
    expect(command?.href).toBe("/dashboard");
    expect(command?.children?.map((child) => child.label)).toEqual([
      "Portfolio",
      "Business Insights",
      "Consulting Workspace",
      "Assessments",
    ]);
  });

  it("hides Playbooks and client-scoped globals from primary nav", () => {
    const labels = getConsultantSidebarNav("admin", "client-1").map((item) => item.label);
    expect(labels).not.toContain("Playbooks");
    expect(labels).not.toContain("Recommendations");
    expect(labels).not.toContain("Roadmaps");
    expect(labels).not.toContain("Lifecycle");
    expect(labels).not.toContain("Reports");
    expect(labels).not.toContain("Technology Catalog");
    expect(labels).not.toContain("vCIO Clients");
    expect(labels).not.toContain("Dashboard");
  });

  it("applies role-aware visibility for technician vs admin", () => {
    const tech = getConsultantSidebarNav("technician", null);
    expect(tech.map((item) => item.label)).toEqual([
      "Command Center",
      "Clients",
      "Projects",
      "Recurring Services",
      "Communications",
      "Operations",
    ]);
    expect(tech.some((item) => item.id === "leads")).toBe(false);

    const operations = tech.find((item) => item.id === "operations");
    expect(operations?.children?.map((child) => child.label)).toEqual([
      "Technology Catalog",
      "Settings",
    ]);

    const command = tech.find((item) => item.id === "command-center");
    expect(command?.children?.some((child) => child.href === "/portfolio")).toBe(false);
  });

  it("preserves customer primary navigation unchanged", () => {
    const customer = getCustomerSidebarNav("client-own");
    expect(customer.map((item) => item.label)).toEqual([
      "Overview",
      "Explore",
      "Roadmap",
      "Projects",
      "Reports",
    ]);
  });

  it("resolves exclusive active primary destinations", () => {
    const cases: Array<[string, ReturnType<typeof resolveActiveStaffPrimaryId>]> = [
      ["/dashboard", "command-center"],
      ["/portfolio", "command-center"],
      ["/insights", "command-center"],
      ["/consulting", "command-center"],
      ["/assessments", "command-center"],
      ["/assessments/abc/results", "command-center"],
      ["/clients", "clients"],
      ["/clients/new", "clients"],
      ["/clients/abc/recommendations", "clients"],
      ["/clients/abc/roadmap", "clients"],
      ["/clients/abc/projects", "clients"],
      ["/projects", "projects"],
      ["/projects/xyz", "projects"],
      ["/snapshot-leads", "leads"],
      ["/website-leads", "leads"],
      ["/admin/vcio", "recurring-services"],
      ["/admin/communications/campaigns", "communications"],
      ["/admin/billing", "operations"],
      ["/admin/users", "operations"],
      ["/technology-catalog", "operations"],
      ["/settings", "operations"],
      ["/account", null],
      ["/playbooks", null],
    ];

    for (const [pathname, expected] of cases) {
      expect(resolveActiveStaffPrimaryId(pathname), pathname).toBe(expected);
    }
  });

  it("activates exactly one primary item per recognized staff route", () => {
    const nav = getConsultantSidebarNav("admin", null);
    const pathnames = [
      "/dashboard",
      "/clients/abc/recommendations",
      "/projects",
      "/website-leads",
      "/admin/vcio",
      "/admin/communications",
      "/technology-catalog",
    ];

    for (const pathname of pathnames) {
      const activeCount = nav.filter((item) => isSidebarNavItemActive(pathname, item)).length;
      expect(activeCount, pathname).toBe(1);
    }
  });

  it("marks nested Operations and Leads children active without activating siblings", () => {
    const nav = getConsultantSidebarNav("admin", null);
    const operations = nav.find((item) => item.id === "operations")!;
    const catalog = operations.children!.find((child) => child.href === "/technology-catalog")!;
    const billing = operations.children!.find((child) => child.href === "/admin/billing")!;

    expect(isStaffNavChildActive("/technology-catalog/entra", catalog)).toBe(true);
    expect(isStaffNavChildActive("/technology-catalog/entra", billing)).toBe(false);
    expect(isSidebarNavItemActive("/technology-catalog/entra", operations)).toBe(true);
  });

  it("does not use clientId to choose global staff destinations", () => {
    const withClient = getConsultantSidebarNav("admin", "client-1").map((item) => item.href);
    const withoutClient = getConsultantSidebarNav("admin", null).map((item) => item.href);
    expect(withClient).toEqual(withoutClient);
    expect(withClient.every((href) => !href.includes("client-1"))).toBe(true);
  });

  it("syncs command palette labels with Clients and Command Center", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/command-center/modules/navigation.ts"),
      "utf8",
    );
    expect(source).toContain('label: "Command Center"');
    expect(source).toContain('label: "Clients"');
    expect(source).toContain('label: "Recurring Services"');
    expect(source).toContain('href: "/assessments"');
    expect(source).toContain('href: "/technology-catalog"');
    expect(source).not.toContain('label: "Organizations"');
    expect(source).not.toContain('href: "/playbooks"');
  });

  it("preserves client workspace route paths in source (no SS-ADMIN-003)", () => {
    const nav = readFileSync(
      join(process.cwd(), "src/lib/client-workspace/nav.ts"),
      "utf8",
    );
    expect(nav).toContain('"recommendations"');
    expect(nav).toContain('"roadmap"');
    expect(nav).toContain('"lifecycle"');
    expect(nav).toContain('"executive-reports"');
  });
});
