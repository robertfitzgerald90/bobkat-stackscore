import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getCustomerMaturityLabel } from "@/lib/assessments/customer-reporting";
import { computeProjectProgress } from "@/lib/projects/progress";
import { formatMaturityScore } from "@/lib/scoring/score-display";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import {
  PUBLIC_DEMO_COMPANY_NAME,
  PUBLIC_DEMO_ID_PREFIX,
  PUBLIC_DEMO_WORKSPACE_ID,
} from "@/lib/public-demo/constants";
import { DEMO_PROJECTS } from "@/lib/public-demo/fixtures";
import {
  getPublicDemoExplore,
  getPublicDemoOverview,
  getPublicDemoProjectDetail,
  getPublicDemoProjects,
  getPublicDemoReports,
  getPublicDemoRoadmap,
  getPublicDemoWorkspace,
  listPublicDemoEntityIds,
} from "@/lib/public-demo/provider";
import {
  LEGACY_DEMO_SECTION_REDIRECTS,
  PUBLIC_DEMO_EXPLORE_PATH,
  PUBLIC_DEMO_OVERVIEW_PATH,
  PUBLIC_DEMO_PRIMARY_NAV,
  PUBLIC_DEMO_PROJECTS_PATH,
  PUBLIC_DEMO_REPORTS_PATH,
  PUBLIC_DEMO_ROADMAP_PATH,
} from "@/lib/public-demo/routes";
import {
  PUBLIC_DEMO_PILLAR_SCORES,
  computePublicDemoOverallScore,
} from "@/lib/public-demo/scoring";
import { buildDemoHref } from "@/lib/interactive-demo/routes";

const ROOT = process.cwd();

function walkTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walkTsFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

describe("SS-WEB-003 public demo architecture", () => {
  it("exposes anonymous customer-parity destinations", () => {
    expect(PUBLIC_DEMO_PRIMARY_NAV.map((item) => item.id)).toEqual([
      "overview",
      "explore",
      "roadmap",
      "projects",
      "reports",
    ]);
    expect(PUBLIC_DEMO_OVERVIEW_PATH).toBe("/demo/overview");
    expect(PUBLIC_DEMO_EXPLORE_PATH).toBe("/demo/explore");
    expect(PUBLIC_DEMO_ROADMAP_PATH).toBe("/demo/roadmap");
    expect(PUBLIC_DEMO_PROJECTS_PATH).toBe("/demo/projects");
    expect(PUBLIC_DEMO_REPORTS_PATH).toBe("/demo/reports");
  });

  it("keeps /demo public in auth config", () => {
    const authConfig = readFileSync(path.join(ROOT, "src/lib/auth/auth.config.ts"), "utf8");
    expect(authConfig).toContain('pathname.startsWith("/demo")');
  });

  it("uses a fictional workspace id that is not a production client shape", () => {
    expect(PUBLIC_DEMO_WORKSPACE_ID).toBe("public-demo-northstar");
    expect(PUBLIC_DEMO_WORKSPACE_ID.startsWith("cl")).toBe(false);
    expect(PUBLIC_DEMO_COMPANY_NAME).toBe("Northstar Manufacturing");
  });

  it("prefixes every demo entity id and never embeds tenant client paths", () => {
    const ids = listPublicDemoEntityIds();
    expect(ids.length).toBeGreaterThan(5);
    for (const id of ids) {
      expect(id.startsWith(PUBLIC_DEMO_ID_PREFIX) || id === PUBLIC_DEMO_WORKSPACE_ID).toBe(true);
    }

    const workspace = getPublicDemoWorkspace();
    const serialized = JSON.stringify(workspace);
    expect(serialized).not.toMatch(/\/clients\/(?!public-demo)/);
    expect(serialized).not.toContain("/api/v1/");
    expect(serialized).toContain(PUBLIC_DEMO_COMPANY_NAME);
  });

  it("does not import prisma or mutation APIs in the public-demo provider layer", () => {
    const providerDir = path.join(ROOT, "src/lib/public-demo");
    for (const file of walkTsFiles(providerDir)) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/from ["']@\/lib\/db["']/);
      expect(source).not.toMatch(/from ["']@\/generated\/prisma\/client["'].*PrismaClient/);
      expect(source).not.toContain("prisma.");
    }
  });
});

describe("SS-WEB-003 demo content and scoring", () => {
  it("covers all eight pillars with whole-number scores and official labels", () => {
    const overview = getPublicDemoOverview();
    expect(overview.pillars).toHaveLength(8);
    expect(overview.stackScore).toBe(computePublicDemoOverallScore());
    expect(overview.maturityLabel).toBe(getCustomerMaturityLabel(overview.stackScore!));
    expect(formatMaturityScore(overview.stackScore)).not.toContain(".");

    for (const pillar of TECHNOLOGY_PILLARS) {
      const score = PUBLIC_DEMO_PILLAR_SCORES[pillar.code];
      expect(Number.isInteger(score)).toBe(true);
      expect(getCustomerMaturityLabel(score)).toBeTruthy();
      const tile = overview.pillars.find((row) => row.code === pillar.code);
      expect(tile?.maturityLabel).toBe(getCustomerMaturityLabel(score));
      expect(formatMaturityScore(tile?.score ?? null)).not.toContain(".");
    }
  });

  it("builds Explore intelligence for every pillar", () => {
    const explore = getPublicDemoExplore("identity_access");
    expect(explore.hasCompletedAssessment).toBe(true);
    for (const pillar of TECHNOLOGY_PILLARS) {
      const detail = explore.detailsByCode[pillar.code];
      expect(detail.findings.length).toBeGreaterThan(0);
      expect(detail.strengths.length + detail.attentionItems.length).toBeGreaterThan(0);
      expect(detail.maturityLabel).toBe(
        getCustomerMaturityLabel(PUBLIC_DEMO_PILLAR_SCORES[pillar.code]),
      );
    }
  });

  it("keeps roadmap and opportunity relationships consistent", () => {
    const roadmap = getPublicDemoRoadmap();
    expect(roadmap.phases.length).toBeGreaterThanOrEqual(3);
    expect(roadmap.initiatives.length).toBeGreaterThanOrEqual(4);
    for (const initiative of roadmap.initiatives) {
      expect(initiative.recommendationHref.startsWith("/demo/")).toBe(true);
      expect(initiative.pillarHref?.startsWith("/demo/explore")).toBe(true);
    }
  });

  it("derives project progress from tasks via computeProjectProgress", () => {
    const identity = DEMO_PROJECTS.find((p) => p.id.includes("identity"))!;
    const expected = computeProjectProgress(identity.tasks);
    const detail = getPublicDemoProjectDetail(identity.id)!;
    expect(detail.progressPercent).toBe(expected.progressPercent);
    expect(detail.tasksTotal).toBe(expected.tasksTotal);
    expect(detail.tasksCompleted).toBe(expected.tasksCompleted);
    expect(detail.completionReportHref).toBeNull();

    const docs = DEMO_PROJECTS.find((p) => p.tasks.length === 0)!;
    expect(computeProjectProgress(docs.tasks).progressPercent).toBeNull();
    expect(getPublicDemoProjectDetail(docs.id)?.progressPercent).toBeNull();
  });

  it("labels reports as sample and avoids authenticated PDF download hrefs", () => {
    const reports = getPublicDemoReports();
    expect(reports.latest?.title.toLowerCase()).toContain("sample");
    expect(reports.latest?.companyName.toLowerCase()).toContain("sample");
    for (const action of reports.latest?.actions ?? []) {
      expect(action.href.startsWith("/demo/")).toBe(true);
      expect(action.href).not.toContain("/api/");
      expect(action.download).toBe(false);
    }
  });

  it("filters project views without inventing rows", () => {
    const all = getPublicDemoProjects("all");
    const planned = getPublicDemoProjects("planned");
    const active = getPublicDemoProjects("active");
    expect(all.projects.length).toBe(DEMO_PROJECTS.length);
    expect(planned.summary.plannedCount).toBe(planned.projects.length);
    expect(active.summary.activeCount).toBe(active.projects.length);
  });
});

describe("SS-WEB-003 navigation and legacy deep links", () => {
  it("maps legacy marketing deep links into customer-parity routes", () => {
    expect(LEGACY_DEMO_SECTION_REDIRECTS.dashboard).toBe(PUBLIC_DEMO_OVERVIEW_PATH);
    expect(LEGACY_DEMO_SECTION_REDIRECTS.explore).toBe(PUBLIC_DEMO_EXPLORE_PATH);
    expect(LEGACY_DEMO_SECTION_REDIRECTS.roadmap).toBe(PUBLIC_DEMO_ROADMAP_PATH);
    expect(LEGACY_DEMO_SECTION_REDIRECTS.projects).toBe(PUBLIC_DEMO_PROJECTS_PATH);
    expect(LEGACY_DEMO_SECTION_REDIRECTS.reports).toBe(PUBLIC_DEMO_REPORTS_PATH);
  });

  it("builds demo hrefs to the new destinations", () => {
    expect(buildDemoHref({ section: "overview" })).toBe(PUBLIC_DEMO_OVERVIEW_PATH);
    expect(buildDemoHref({ section: "explore" })).toBe(PUBLIC_DEMO_EXPLORE_PATH);
    expect(buildDemoHref({ section: "roadmap" })).toBe(PUBLIC_DEMO_ROADMAP_PATH);
    expect(buildDemoHref()).toBe("/demo");
  });
});

describe("SS-WEB-003 read-only enforcement", () => {
  it("workspace DTOs never expose mutation or privileged assessment routes", () => {
    const workspace = getPublicDemoWorkspace();
    const blob = JSON.stringify(workspace);
    expect(blob).not.toContain("/assessment/start");
    expect(blob).not.toContain("customer-updates");
    expect(blob).not.toContain("/export/pdf");
    expect(blob).not.toContain("completion-report");
    expect(workspace.overview.vcio.show).toBe(false);
    expect(workspace.overview.assessmentInProgress).toBe(false);
    expect(workspace.overview.draftAssessmentId).toBeNull();
  });

  it("demo route pages exist for the customer nav surface", () => {
    const pages = [
      "src/app/demo/(workspace)/overview/page.tsx",
      "src/app/demo/(workspace)/explore/page.tsx",
      "src/app/demo/(workspace)/roadmap/page.tsx",
      "src/app/demo/(workspace)/projects/page.tsx",
      "src/app/demo/(workspace)/reports/page.tsx",
      "src/app/demo/(workspace)/layout.tsx",
      "src/app/demo/page.tsx",
    ];
    for (const page of pages) {
      expect(readFileSync(path.join(ROOT, page), "utf8").length).toBeGreaterThan(50);
    }
  });
});
