import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import {
  PUBLIC_DEMO_FORBIDDEN_FINANCIAL_PATTERNS,
  PUBLIC_DEMO_FORBIDDEN_LEGACY_PHRASES,
  RETIRED_PUBLIC_DEMO_PATHS,
  RETIRED_PUBLIC_DEMO_REDIRECTS,
} from "@/lib/public-demo/legacy-routes";
import {
  getPublicDemoExplore,
  getPublicDemoOverview,
  getPublicDemoProjects,
  getPublicDemoReports,
  getPublicDemoRoadmap,
  getPublicDemoWorkspace,
} from "@/lib/public-demo/provider";
import {
  PUBLIC_DEMO_PILLAR_SCORES,
  computePublicDemoOverallScore,
} from "@/lib/public-demo/scoring";
import { getCustomerMaturityLabel } from "@/lib/assessments/customer-reporting";
import { formatMaturityScore } from "@/lib/scoring/score-display";

const ROOT = process.cwd();

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("SS-WEB-003-R2 legacy demo retirement", () => {
  it("retires every obsolete public demo path to the current customer-parity demo", () => {
    expect(RETIRED_PUBLIC_DEMO_PATHS.length).toBeGreaterThanOrEqual(6);
    for (const retired of RETIRED_PUBLIC_DEMO_PATHS) {
      const target = RETIRED_PUBLIC_DEMO_REDIRECTS[retired];
      expect(target.startsWith("/demo/")).toBe(true);
      const pageRel = `src/app${retired}/page.tsx`;
      const page = read(pageRel);
      expect(page).toContain("permanentRedirect");
      expect(page).toContain("RETIRED_PUBLIC_DEMO_REDIRECTS");
      expect(page).not.toMatch(/from ["']@\/components\/product-overview/);
      expect(page).not.toMatch(/from ["']@\/components\/marketing-demo/);
      expect(page).not.toMatch(/from ["']@\/components\/portfolio\/stackscore/);
      expect(page).not.toContain("TipDemoPageClient");
    }
  });

  it("keeps current customer compositions on the live demo destinations", () => {
    expect(read("src/app/demo/(workspace)/overview/page.tsx")).toContain(
      "CustomerExecutiveDashboard",
    );
    expect(read("src/app/demo/(workspace)/explore/page.tsx")).toContain(
      "CustomerExploreExperience",
    );
    expect(read("src/app/demo/(workspace)/roadmap/page.tsx")).toContain(
      "CustomerRoadmapExperience",
    );
    expect(read("src/app/demo/(workspace)/projects/page.tsx")).toContain(
      "CustomerProjectsExperience",
    );
    expect(read("src/app/demo/(workspace)/reports/page.tsx")).toContain(
      "CustomerReportsExperience",
    );
  });

  it("retires the legacy product-overview PDF API", () => {
    const pdf = read("src/app/api/product-overview/pdf/route.ts");
    expect(pdf).toContain("status: 410");
    expect(pdf).not.toContain("generateProductOverviewPdf");
  });
});

describe("SS-WEB-003-R2 scoring and taxonomy", () => {
  it("uses the current eight-pillar taxonomy with consistent whole-number scores", () => {
    const overview = getPublicDemoOverview();
    expect(overview.pillars.map((p) => p.code)).toEqual(
      TECHNOLOGY_PILLARS.map((p) => p.code),
    );
    expect(overview.stackScore).toBe(computePublicDemoOverallScore());
    expect(formatMaturityScore(overview.stackScore)).not.toContain(".");
    expect(overview.maturityLabel).toBe(getCustomerMaturityLabel(overview.stackScore!));

    for (const pillar of TECHNOLOGY_PILLARS) {
      expect(PUBLIC_DEMO_PILLAR_SCORES[pillar.code]).toEqual(expect.any(Number));
      expect(Number.isInteger(PUBLIC_DEMO_PILLAR_SCORES[pillar.code])).toBe(true);
    }

    const explore = getPublicDemoExplore();
    expect(Object.keys(explore.detailsByCode)).toHaveLength(8);
  });

  it("does not invent projected official StackScore changes in demo payloads", () => {
    const blob = JSON.stringify(getPublicDemoWorkspace());
    expect(blob).not.toMatch(/projectedScore/i);
    expect(blob).not.toMatch(/effectiveStackScore/i);
    expect(blob).not.toMatch(/scoreProgression/i);
  });
});

describe("SS-WEB-003-R2 financial and legacy content scrub", () => {
  it("excludes speculative financial values from demo view models", () => {
    const workspace = getPublicDemoWorkspace();
    const projects = getPublicDemoProjects();
    const roadmap = getPublicDemoRoadmap();
    const reports = getPublicDemoReports();
    const blob = JSON.stringify({ workspace, projects, roadmap, reports });

    for (const pattern of PUBLIC_DEMO_FORBIDDEN_FINANCIAL_PATTERNS) {
      expect(blob).not.toMatch(pattern);
    }
    for (const phrase of PUBLIC_DEMO_FORBIDDEN_LEGACY_PHRASES) {
      expect(blob.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
    expect(blob).not.toContain("Strategy & Governance");
    expect(blob).not.toMatch(/\$\d/);
  });

  it("keeps demo fixture copy free of currency markers", () => {
    const fixtures = read("src/lib/public-demo/fixtures.ts");
    expect(fixtures).not.toMatch(/\$\d/);
    expect(fixtures).not.toMatch(/\/month/i);
    expect(fixtures).not.toContain("Strategy & Governance");
  });
});
