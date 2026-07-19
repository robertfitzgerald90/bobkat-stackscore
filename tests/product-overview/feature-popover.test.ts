import { describe, expect, it } from "vitest";
import { getDefaultProfile } from "@/lib/product-overview/demo-profiles";
import { getFeaturePopoverWidth } from "@/lib/product-overview/feature-popover-position";
import { resolveFeaturePopoverModel } from "@/lib/product-overview/resolve-feature-popover";

describe("feature popover content", () => {
  const profile = getDefaultProfile();

  it("resolves pillar details into the shared bubble model", () => {
    const pillar = profile.dashboard.pillars[0];
    const model = resolveFeaturePopoverModel(
      { type: "assessmentPillar", pillarId: pillar.id },
      profile,
    );

    expect(model?.title).toBe(pillar.name);
    expect(model?.whyItMatters).toBeTruthy();
    expect(model?.businessValue).toBeTruthy();
    expect(model?.relatedActions?.length).toBeGreaterThan(0);
  });

  it("resolves budget summary into the shared bubble model", () => {
    const model = resolveFeaturePopoverModel({ type: "budget" }, profile);
    expect(model?.title).toBe("Technology Budget");
    expect(model?.metrics?.some((metric) => metric.label === "Planned")).toBe(true);
  });
});

describe("feature popover width", () => {
  it("uses near-full width on mobile and constrained width on desktop", () => {
    expect(getFeaturePopoverWidth(390)).toBeLessThanOrEqual(390 - 24);
    expect(getFeaturePopoverWidth(1440)).toBeGreaterThanOrEqual(320);
    expect(getFeaturePopoverWidth(1440)).toBeLessThanOrEqual(420);
  });
});
