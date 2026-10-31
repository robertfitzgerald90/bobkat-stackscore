import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_DEMO_EXPLORE_PATH,
  PUBLIC_DEMO_OVERVIEW_PATH,
  PUBLIC_DEMO_PROJECTS_PATH,
  PUBLIC_DEMO_REPORTS_PATH,
  PUBLIC_DEMO_ROADMAP_PATH,
} from "@/lib/public-demo/routes";
import { getPublicDemoOpportunitiesDto, getPublicDemoOverview } from "@/lib/public-demo/provider";
import { getPublicDemoWorkspaceLinks } from "@/lib/public-demo/presentation";

const ROOT = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("SS-WEB-003-R1 shared presentation reuse", () => {
  it("Overview page mounts CustomerExecutiveDashboard", () => {
    const page = read("src/app/demo/(workspace)/overview/page.tsx");
    expect(page).toContain("CustomerExecutiveDashboard");
    expect(page).not.toContain("DemoOverviewExperience");
    expect(page).toContain("getPublicDemoWorkspaceLinks");
    expect(page).toContain("showBookingCta={false}");
  });

  it("Explore page mounts CustomerExploreExperience", () => {
    const page = read("src/app/demo/(workspace)/explore/page.tsx");
    expect(page).toContain("CustomerExploreExperience");
  });

  it("Roadmap page mounts CustomerRoadmapExperience", () => {
    const page = read("src/app/demo/(workspace)/roadmap/page.tsx");
    expect(page).toContain("CustomerRoadmapExperience");
    expect(page).toContain("showBookingCta={false}");
  });

  it("Projects pages mount CustomerProjectsExperience and CustomerProjectDetail", () => {
    const list = read("src/app/demo/(workspace)/projects/page.tsx");
    const detail = read("src/app/demo/(workspace)/projects/[projectId]/page.tsx");
    expect(list).toContain("CustomerProjectsExperience");
    expect(detail).toContain("CustomerProjectDetail");
  });

  it("Reports page mounts CustomerReportsExperience", () => {
    const page = read("src/app/demo/(workspace)/reports/page.tsx");
    expect(page).toContain("CustomerReportsExperience");
    expect(page).not.toContain("DemoReportsExperience");
    expect(page).toContain("showBookingCta={false}");
  });

  it("Opportunities page mounts CustomerRecommendationsView", () => {
    const page = read("src/app/demo/(workspace)/opportunities/page.tsx");
    expect(page).toContain("CustomerRecommendationsView");
    expect(page).toContain("basePath={PUBLIC_DEMO_OPPORTUNITIES_PATH}");
  });

  it("demo shell reuses customer portal chrome tokens", () => {
    const shell = read("src/components/public-demo/public-demo-shell.tsx");
    expect(shell).toContain("CUSTOMER_PORTAL_THEME_CLASS");
    expect(shell).toContain("CustomerPortalWatermark");
    expect(shell).toContain("EXECUTIVE_OS_SIDEBAR_LINK");
    expect(shell).toContain("customer-nav-active-rail");
    expect(shell).toContain('data-portal="customer"');
  });

  it("customer Overview composition accepts presentation adapters without demo branching in cards", () => {
    const dashboard = read("src/components/customer-portal/customer-executive-dashboard.tsx");
    expect(dashboard).toContain("workspaceLinks?");
    expect(dashboard).toContain("recommendationsHref?");
    expect(dashboard).toContain("showBookingCta");
    expect(dashboard).toContain("OverviewMaturityHero");
    expect(dashboard).toContain("OverviewPillarGrid");
    expect(dashboard).toContain("OverviewPriorityOpportunities");
  });
});

describe("SS-WEB-003-R1 fictional adapters", () => {
  it("workspace hub links stay under /demo", () => {
    const links = getPublicDemoWorkspaceLinks();
    expect(links.map((l) => l.href)).toEqual([
      PUBLIC_DEMO_EXPLORE_PATH,
      PUBLIC_DEMO_ROADMAP_PATH,
      PUBLIC_DEMO_PROJECTS_PATH,
      "/demo/opportunities",
      PUBLIC_DEMO_REPORTS_PATH,
    ]);
    for (const link of links) {
      expect(link.href.startsWith("/demo/")).toBe(true);
      expect(link.href).not.toContain("/clients/");
    }
  });

  it("overview DTO remains completed sample data for the shared composition", () => {
    const overview = getPublicDemoOverview();
    expect(overview.hasCompletedAssessment).toBe(true);
    expect(overview.vcio.show).toBe(false);
    expect(overview.pillars).toHaveLength(8);
    expect(overview.roadmap.href).toBe(PUBLIC_DEMO_ROADMAP_PATH);
    expect(overview.nextAction?.href.startsWith(PUBLIC_DEMO_EXPLORE_PATH)).toBe(true);
  });

  it("opportunities DTO remaps pillar and roadmap hrefs into demo routes", () => {
    const dto = getPublicDemoOpportunitiesDto();
    expect(dto.opportunities.length).toBeGreaterThan(0);
    for (const row of dto.opportunities) {
      expect(row.pillarHref.startsWith("/demo/explore")).toBe(true);
      if (row.roadmap) {
        expect(row.roadmap.href.startsWith("/demo/roadmap")).toBe(true);
      }
    }
  });
});

describe("SS-WEB-003-R1 destination coverage", () => {
  it("required demo destinations exist", () => {
    for (const dest of [
      PUBLIC_DEMO_OVERVIEW_PATH,
      PUBLIC_DEMO_EXPLORE_PATH,
      PUBLIC_DEMO_ROADMAP_PATH,
      PUBLIC_DEMO_PROJECTS_PATH,
      PUBLIC_DEMO_REPORTS_PATH,
    ]) {
      expect(dest.startsWith("/demo/")).toBe(true);
    }
  });
});
