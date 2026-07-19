import type { DemoDetailPanel } from "@/lib/product-overview/types";

/**
 * How a demo control presents supplemental information.
 * - popover: contextual FeaturePopover beside the clicked element
 * - inline-detail: update an existing in-page master/detail panel (no bubble)
 * - direct-action: navigation / CTA only
 */
export type DemoInteractionMode = "popover" | "inline-detail" | "direct-action";

/** Panel types that must never open the shared FeaturePopover. */
export const INLINE_DETAIL_PANEL_TYPES = [
  "collaborationParticipant",
  "ecosystemNode",
] as const;

export type InlineDetailPanelType = (typeof INLINE_DETAIL_PANEL_TYPES)[number];

export function isInlineDetailPanel(
  panel: DemoDetailPanel,
): panel is Extract<NonNullable<DemoDetailPanel>, { type: InlineDetailPanelType }> {
  if (!panel) return false;
  return (INLINE_DETAIL_PANEL_TYPES as readonly string[]).includes(panel.type);
}

export function shouldOpenFeaturePopover(panel: DemoDetailPanel): boolean {
  return panel !== null && !isInlineDetailPanel(panel);
}

/** Section-level config for master-detail demo areas. */
export const DEMO_INLINE_DETAIL_SECTIONS = {
  collaboration: {
    sectionId: "product-overview-collaboration",
    interactionMode: "inline-detail" as const,
    presentation: "master-detail" as const,
    disableFeaturePopover: true,
  },
  ecosystem: {
    sectionId: "product-overview-ecosystem",
    interactionMode: "inline-detail" as const,
    presentation: "master-detail" as const,
    disableFeaturePopover: true,
  },
} as const;
