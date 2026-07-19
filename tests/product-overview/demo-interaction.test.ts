import { describe, expect, it } from "vitest";
import {
  DEMO_INLINE_DETAIL_SECTIONS,
  isInlineDetailPanel,
  shouldOpenFeaturePopover,
} from "@/lib/product-overview/demo-interaction";
import { resolveFeaturePopoverModel } from "@/lib/product-overview/resolve-feature-popover";
import { getDefaultProfile } from "@/lib/product-overview/demo-profiles";

describe("demo interaction modes", () => {
  it("marks collaboration and ecosystem as inline-detail master/detail sections", () => {
    expect(DEMO_INLINE_DETAIL_SECTIONS.collaboration.interactionMode).toBe("inline-detail");
    expect(DEMO_INLINE_DETAIL_SECTIONS.collaboration.disableFeaturePopover).toBe(true);
    expect(DEMO_INLINE_DETAIL_SECTIONS.ecosystem.interactionMode).toBe("inline-detail");
    expect(DEMO_INLINE_DETAIL_SECTIONS.ecosystem.disableFeaturePopover).toBe(true);
  });

  it("does not open FeaturePopover for collaboration stakeholders", () => {
    const panel = {
      type: "collaborationParticipant" as const,
      participantId: "technology-advisor",
    };
    expect(isInlineDetailPanel(panel)).toBe(true);
    expect(shouldOpenFeaturePopover(panel)).toBe(false);
  });

  it("does not open FeaturePopover for ecosystem categories", () => {
    const panel = { type: "ecosystemNode" as const, nodeId: "assessment" };
    expect(isInlineDetailPanel(panel)).toBe(true);
    expect(shouldOpenFeaturePopover(panel)).toBe(false);
  });

  it("still opens FeaturePopover for dashboard and assessment panels", () => {
    expect(shouldOpenFeaturePopover({ type: "budget" })).toBe(true);
    expect(
      shouldOpenFeaturePopover({
        type: "assessmentPillar",
        pillarId: "security",
      }),
    ).toBe(true);
  });

  it("can still resolve models for inline-detail types without auto-opening them", () => {
    const profile = getDefaultProfile();
    const collaborationModel = resolveFeaturePopoverModel(
      { type: "collaborationParticipant", participantId: "technology-advisor" },
      profile,
    );
    const ecosystemModel = resolveFeaturePopoverModel(
      { type: "ecosystemNode", nodeId: "assessment" },
      profile,
    );

    expect(collaborationModel?.title).toBeTruthy();
    expect(ecosystemModel?.title).toBeTruthy();
    expect(
      shouldOpenFeaturePopover({
        type: "collaborationParticipant",
        participantId: "technology-advisor",
      }),
    ).toBe(false);
    expect(shouldOpenFeaturePopover({ type: "ecosystemNode", nodeId: "assessment" })).toBe(false);
  });
});
