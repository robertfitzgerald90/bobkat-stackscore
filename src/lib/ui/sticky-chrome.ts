/**
 * Shared sticky chrome tokens for Bobkat IT marketing, invitation, and demo shells.
 * Prefer these over per-page sticky class strings so z-index and overflow behavior stay aligned.
 */

/** Primary site / marketing header (h-14 chrome). */
export const STICKY_SITE_HEADER_CLASS =
  "sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-md supports-backdrop-filter:bg-background/80";

/** Interactive Demo application shell (header + section tabs as one sticky unit). */
export const STICKY_DEMO_SHELL_CLASS =
  "sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/85";

/**
 * Secondary nav pinned inside a scrollport (e.g. dashboard `<main>`).
 * Stays below AppHeader (layout-pinned) and below primary sticky site chrome.
 * Negative margins cancel dashboard main padding so the sticky bar is full-bleed.
 */
export const STICKY_IN_SCROLLPORT_CLASS =
  "sticky top-0 z-30 -mx-4 w-auto border-b border-border/60 bg-background/95 px-4 py-2 backdrop-blur-md supports-backdrop-filter:bg-background/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8";

/** Matches `html { scroll-padding-top }` for marketing pages. */
export const MARKETING_SCROLL_PADDING_TOP = "5.5rem";

/** Tailwind scroll-margin for in-page anchors under the marketing sticky header. */
export const MARKETING_SCROLL_MT_CLASS = "scroll-mt-[var(--site-header-offset,5.5rem)]";

/** CSS variable name used by the Interactive Demo shell height measurement. */
export const DEMO_SHELL_HEIGHT_VAR = "--demo-shell-height";
