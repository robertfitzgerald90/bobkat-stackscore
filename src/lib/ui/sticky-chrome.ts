/**
 * Shared sticky chrome tokens for Bobkat IT marketing, invitation, demo, and workspace shells.
 * Prefer these over per-page sticky class strings so z-index and overflow behavior stay aligned.
 *
 * All sticky application surfaces use fully opaque `bg-background` — no rgba, opacity utilities,
 * or backdrop-blur-only treatments that expose scrolling content underneath.
 */

/** Primary site / marketing header (h-14 chrome). */
export const STICKY_SITE_HEADER_CLASS =
  "sticky top-0 z-50 isolate w-full border-b border-border/60 bg-background shadow-[0_1px_0_0_rgba(15,23,42,0.06)]";

/** Executive marketing header — layered navy with blue edge glow. */
export const PUBLIC_MARKETING_HEADER_CLASS =
  "sticky top-0 z-50 isolate w-full border-b border-[rgba(70,120,255,0.12)] bg-[rgba(5,9,20,0.92)] shadow-[0_1px_0_0_rgba(50,120,255,0.06),0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md";

/** Interactive Demo application shell (header + section tabs as one sticky unit). */
export const STICKY_DEMO_SHELL_CLASS =
  "sticky top-0 z-50 isolate w-full border-b border-border/70 bg-background shadow-sm";

/**
 * Secondary nav pinned inside a scrollport (e.g. dashboard `<main>`).
 * Stays below AppHeader (layout-pinned) and below primary sticky site chrome.
 * Negative margins cancel dashboard main padding so the sticky bar is full-bleed.
 */
export const STICKY_IN_SCROLLPORT_CLASS =
  "sticky top-0 z-30 isolate -mx-4 w-auto border-b border-border/60 bg-background px-4 py-2 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8";

/**
 * Unified client workspace sticky shell: global toolbar + client context + section nav.
 * Uses opaque sidebar navy so scrolling page content never shows through.
 */
export const STICKY_CLIENT_WORKSPACE_SHELL_CLASS =
  "sticky top-0 z-50 isolate w-full border-b border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[0_4px_12px_rgba(0,0,0,0.18)]";

/** Horizontal padding for client workspace page content below the sticky shell. */
export const CLIENT_WORKSPACE_CONTENT_PADDING_CLASS = "px-4 py-6 sm:px-6 lg:px-8";

/** Matches `html { scroll-padding-top }` for marketing pages. */
export const MARKETING_SCROLL_PADDING_TOP = "5.5rem";

/** Tailwind scroll-margin for in-page anchors under the marketing sticky header. */
export const MARKETING_SCROLL_MT_CLASS = "scroll-mt-[var(--site-header-offset,5.5rem)]";

/** CSS variable name used by the Interactive Demo shell height measurement. */
export const DEMO_SHELL_HEIGHT_VAR = "--demo-shell-height";
