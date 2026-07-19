/**
 * Demo polish aliases — shared tokens live in @/lib/client-ui/tokens
 * so the Interactive Demo and authenticated portal stay visually aligned.
 */
export {
  CLIENT_INTERACTIVE_CARD as PO_INTERACTIVE_CARD,
  CLIENT_INTERACTIVE_TILE as PO_INTERACTIVE_TILE,
  CLIENT_METRIC_VALUE as PO_METRIC_VALUE,
} from "@/lib/client-ui/tokens";

export const PO_SECTION_SURFACE = "scroll-mt-36 border-t border-border/70";

export function getScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function scrollToSection(sectionId: string, block: ScrollLogicalPosition = "center") {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: getScrollBehavior(),
    block,
  });
}

/**
 * Centers a tour target in the available viewport, leaving room for sticky chrome
 * and the fixed tour panel (bottom on mobile, right on desktop).
 */
export function scrollToTourTarget(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top;
  const headerReserve = 130;
  const isMobile = window.innerWidth < 640;
  const panelReserve = isMobile ? 320 : 48;
  const availableHeight = Math.max(240, window.innerHeight - headerReserve - panelReserve);
  const verticalPadding = 32;
  const targetScroll =
    absoluteTop - headerReserve - Math.max(verticalPadding, (availableHeight - rect.height) / 2);

  window.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: getScrollBehavior(),
  });
}
