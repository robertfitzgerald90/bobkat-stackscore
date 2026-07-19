/** Shared polish classes for interactive product overview surfaces */
export const PO_INTERACTIVE_CARD =
  "rounded-xl border border-border/70 bg-card transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const PO_INTERACTIVE_TILE =
  "rounded-xl border border-border/70 bg-background transition-all duration-300 ease-out motion-reduce:transition-none hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const PO_SECTION_SURFACE = "scroll-mt-36 border-t border-border/70";

export const PO_METRIC_VALUE = "tabular-nums tracking-tight";

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
