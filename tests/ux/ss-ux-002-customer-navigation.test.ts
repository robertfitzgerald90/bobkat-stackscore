import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getCustomerSecondaryNav,
  getCustomerSidebarNav,
  getConsultantSidebarNav,
  isSidebarNavItemActive,
} from "@/lib/navigation/sidebar-nav";
import { canClientAccessPath } from "@/lib/command-center/route-access";
import {
  isClientVisibleWorkspaceSection,
  resolveActiveWorkspaceSection,
} from "@/lib/client-workspace/nav";
import type { PageContext } from "@/lib/command-center/types";

const OWN = "client-own";
const OTHER = "client-other";

function clientContext(overrides?: Partial<PageContext>): PageContext {
  return {
    role: "client",
    userClientId: OWN,
    clientId: OWN,
    pathname: "/",
    ...overrides,
  };
}

describe("SS-UX-002 customer navigation", () => {
  it("exposes exactly four primary sidebar items", () => {
    const nav = getCustomerSidebarNav(OWN);
    expect(nav.map((item) => item.label)).toEqual([
      "Overview",
      "Explore",
      "Roadmap",
      "Reports",
    ]);
  });

  it("moves billing, account, and support to secondary nav", () => {
    const secondary = getCustomerSecondaryNav(OWN);
    expect(secondary.map((item) => item.label)).toEqual([
      "Subscription & Billing",
      "Account",
      "Support",
    ]);
    const primary = getCustomerSidebarNav(OWN);
    expect(primary.some((item) => item.label === "Account")).toBe(false);
    expect(primary.some((item) => item.label.includes("Billing"))).toBe(false);
  });

  it("keeps staff sidebar unchanged in structure", () => {
    const staff = getConsultantSidebarNav("admin", OWN);
    expect(staff.some((item) => item.label === "Portfolio")).toBe(true);
    expect(staff.some((item) => item.label === "Clients")).toBe(true);
    expect(staff.filter((item) => item.label === "Explore")).toHaveLength(0);
  });

  it("marks Roadmap active for recommendations and projects paths", () => {
    const roadmap = getCustomerSidebarNav(OWN).find((item) => item.label === "Roadmap");
    expect(roadmap).toBeDefined();
    expect(isSidebarNavItemActive(`/clients/${OWN}/recommendations`, roadmap!)).toBe(true);
    expect(isSidebarNavItemActive(`/clients/${OWN}/projects`, roadmap!)).toBe(true);
    expect(isSidebarNavItemActive(`/clients/${OWN}/roadmap`, roadmap!)).toBe(true);
    expect(isSidebarNavItemActive(`/clients/${OWN}/technology-profile`, roadmap!)).toBe(false);
  });

  it("allows explore as a client-visible workspace section", () => {
    expect(isClientVisibleWorkspaceSection("explore")).toBe(true);
    expect(resolveActiveWorkspaceSection(`/clients/${OWN}/explore`)).toBe("explore");
  });

  it("rejects cross-tenant client workspace paths in command access", () => {
    expect(canClientAccessPath(`/clients/${OTHER}/technology-profile`, clientContext())).toBe(
      false,
    );
    expect(canClientAccessPath(`/clients/${OWN}/explore`, clientContext())).toBe(true);
    expect(canClientAccessPath(`/clients/${OWN}/recommendations`, clientContext())).toBe(true);
  });

  it("unifies customer landing away from vCIO redirects", () => {
    const dashboardSource = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/dashboard/page.tsx"),
      "utf8",
    );
    const overviewSource = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/technology-profile/page.tsx"),
      "utf8",
    );
    expect(dashboardSource).toContain("customerOverviewPath");
    expect(dashboardSource).not.toContain("canUseOngoingVcioFeatures");
    expect(overviewSource).not.toContain("redirect(`/clients/${id}/vcio`)");
    expect(overviewSource).toContain("clientUser?.clientId !== id");
  });

  it("hardens middleware tenant ownership when JWT carries clientId", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/auth/auth.config.ts"),
      "utf8",
    );
    expect(source).toContain("sessionClientId !== routeClientId");
    expect(source).toContain("session.user.clientId");
  });

  it("routes Complete Budget Planning CTA to a client-visible destination", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/vcio/page.tsx"),
      "utf8",
    );
    expect(source).toContain("Complete Budget Planning");
    expect(source).toContain(`/clients/\${clientId}/lifecycle`);
    expect(source).not.toContain(`/clients/\${clientId}/assets`);
  });
});
