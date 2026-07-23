/**
 * Shared presentational tokens for authenticated client portal and Interactive Demo.
 * Keep presentation-only — no data fetching or demo state here.
 */

export const CLIENT_INTERACTIVE_CARD =
  "rounded-xl border border-[rgba(70,120,255,0.12)] bg-card transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_12px_36px_rgba(0,0,0,0.28),0_0_24px_rgba(35,135,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const CLIENT_INTERACTIVE_TILE =
  "rounded-xl border border-[rgba(70,120,255,0.1)] bg-background transition-all duration-300 ease-out motion-reduce:transition-none hover:border-primary/30 hover:bg-muted/20 hover:shadow-[0_8px_28px_rgba(0,0,0,0.22),0_0_16px_rgba(35,135,255,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const CLIENT_SURFACE_CARD =
  "border-[rgba(70,120,255,0.12)] shadow-[0_12px_36px_rgba(0,0,0,0.24),0_0_20px_rgba(35,135,255,0.05)]";

export const CLIENT_METRIC_VALUE = "tabular-nums tracking-tight";

export const CLIENT_SECTION_EYEBROW =
  "text-sm font-semibold uppercase tracking-[0.18em] text-primary";

export const CLIENT_SECTION_TITLE =
  "mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl";

export const CLIENT_SECTION_DESCRIPTION =
  "mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground";

export const CLIENT_METRIC_WELL = "rounded-lg bg-muted/30 p-3";

export const CLIENT_PROGRESS_TRACK = "h-2 overflow-hidden rounded-full bg-muted";

export const CLIENT_PROGRESS_FILL =
  "h-full rounded-full bg-primary transition-all duration-500 motion-reduce:transition-none";

export const CLIENT_PAGE_SHELL = "mx-auto max-w-7xl space-y-8";

export const CLIENT_NEXT_ACTION_SURFACE =
  "overflow-hidden border-primary/20 bg-gradient-to-br from-primary/12 via-[rgba(8,15,28,0.92)] to-[rgba(8,15,28,0.88)] shadow-[0_16px_48px_rgba(0,0,0,0.32),0_0_32px_rgba(35,135,255,0.1)]";
