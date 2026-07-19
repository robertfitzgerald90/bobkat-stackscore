/**
 * Demo polish aliases — shared tokens live in @/lib/client-ui/tokens
 * so the Interactive Demo and authenticated portal stay visually aligned.
 */
export {
  CLIENT_INTERACTIVE_CARD as PO_INTERACTIVE_CARD,
  CLIENT_INTERACTIVE_TILE as PO_INTERACTIVE_TILE,
  CLIENT_METRIC_VALUE as PO_METRIC_VALUE,
} from "@/lib/client-ui/tokens";

export const PO_SECTION_SURFACE =
  "scroll-mt-[var(--demo-shell-height,9rem)] border-t border-border/70";

export function getScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function readDemoShellHeight(): number {
  if (typeof window === "undefined") return 144;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--demo-shell-height");
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 144;
}

export function scrollToSection(sectionId: string, block: ScrollLogicalPosition = "center") {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const shellHeight = readDemoShellHeight();
  const rect = element.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top;

  if (block === "start") {
    window.scrollTo({
      top: Math.max(0, absoluteTop - shellHeight - 8),
      behavior: getScrollBehavior(),
    });
    return;
  }

  const availableHeight = Math.max(240, window.innerHeight - shellHeight - 32);
  const targetScroll =
    block === "center"
      ? absoluteTop - shellHeight - Math.max(16, (availableHeight - rect.height) / 2)
      : absoluteTop - shellHeight - 8;

  window.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: getScrollBehavior(),
  });
}

/**
 * Centers a tour target in the available viewport, leaving room for sticky chrome
 * and the contextual feature popover beside the highlighted section.
 */
export function scrollToTourTarget(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top;
  const headerReserve =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--demo-shell-height"),
      10,
    ) || 130;
  const popoverReserve = 48;
  const availableHeight = Math.max(240, window.innerHeight - headerReserve - popoverReserve);
  const verticalPadding = 32;
  const targetScroll =
    absoluteTop - headerReserve - Math.max(verticalPadding, (availableHeight - rect.height) / 2);

  window.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: getScrollBehavior(),
  });
}
