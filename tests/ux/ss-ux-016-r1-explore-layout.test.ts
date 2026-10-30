import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const exploreDir = join(process.cwd(), "src/components/customer-portal/explore");

describe("SS-UX-016-R1 — Explore workspace layout correction", () => {
  it("uses a compact pillar selector instead of oversized equal-card grid", () => {
    const experience = readFileSync(
      join(exploreDir, "customer-explore-experience.tsx"),
      "utf8",
    );
    const selector = readFileSync(join(exploreDir, "pillar-selector.tsx"), "utf8");

    expect(experience).toContain("PillarSelector");
    expect(experience).not.toContain("CLIENT_EQUAL_CARD_GRID");
    expect(experience).not.toContain("lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]");
    expect(selector).toContain("xl:grid-cols-8");
    expect(selector).toContain("sm:grid-cols-4");
    expect(selector).toContain("grid-cols-2");
  });

  it("renders full-width overview, side-by-side findings, and intelligence tabs", () => {
    const experience = readFileSync(
      join(exploreDir, "customer-explore-experience.tsx"),
      "utf8",
    );
    const strengths = readFileSync(
      join(exploreDir, "pillar-strengths-attention.tsx"),
      "utf8",
    );
    const tabs = readFileSync(join(exploreDir, "pillar-intelligence-tabs.tsx"), "utf8");
    const overview = readFileSync(join(exploreDir, "pillar-overview.tsx"), "utf8");

    expect(experience).toContain("PillarOverview");
    expect(experience).toContain("PillarStrengthsAttention");
    expect(experience).toContain("PillarIntelligenceTabs");
    expect(experience).toContain("max-w-6xl");
    expect(strengths).toContain("lg:grid-cols-2");
    expect(strengths).toContain("View all");
    expect(tabs).toContain('value="findings"');
    expect(tabs).toContain('value="recommendations"');
    expect(tabs).toContain('value="activity"');
    expect(overview).toContain("/ 100");
  });

  it("preserves deep-link pillar selection without page reload mutation", () => {
    const experience = readFileSync(
      join(exploreDir, "customer-explore-experience.tsx"),
      "utf8",
    );
    expect(experience).toContain('params.set("pillar", code)');
    expect(experience).toContain("scroll: false");
    expect(experience).toContain("isTechnologyPillarCode");
  });

  it("does not introduce a parallel Explore data service", () => {
    const experience = readFileSync(
      join(exploreDir, "customer-explore-experience.tsx"),
      "utf8",
    );
    expect(experience).toContain("CustomerExploreDto");
    expect(experience).not.toMatch(/getCustomerExplore|prisma\./);
  });
});
