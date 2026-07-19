import { PRODUCT_OVERVIEW_NAV_ITEMS } from "@/lib/product-overview/navigation";

export const DEMO_SHELL_SECTIONS = PRODUCT_OVERVIEW_NAV_ITEMS.filter(
  (item) => item.sectionId,
).map((item) => ({
  id: item.id,
  label: item.label,
  sectionId: item.sectionId!,
}));

export const DEFAULT_DEMO_SHELL_HEIGHT = 144;

/**
 * Returns the nav item id for the section currently in view.
 * Uses the last section whose top has passed the sticky shell threshold.
 */
export function resolveActiveDemoSection(
  scrollY: number,
  shellHeight: number,
  sectionOffsets: ReadonlyArray<{ id: string; offsetTop: number }>,
): string {
  if (sectionOffsets.length === 0) return "overview";

  const threshold = scrollY + shellHeight + 12;
  let activeId = sectionOffsets[0]!.id;

  for (const section of sectionOffsets) {
    if (threshold >= section.offsetTop) {
      activeId = section.id;
    }
  }

  return activeId;
}

export function readDemoSectionOffsets(): Array<{ id: string; offsetTop: number }> {
  return DEMO_SHELL_SECTIONS.flatMap((section) => {
    const element = document.getElementById(section.sectionId);
    if (!element) return [];
    return [{ id: section.id, offsetTop: element.offsetTop }];
  });
}
