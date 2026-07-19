/**
 * Shared presentational tokens for authenticated client portal and Interactive Demo.
 * Keep presentation-only — no data fetching or demo state here.
 */

export const CLIENT_INTERACTIVE_CARD =
  "rounded-xl border border-border/70 bg-card transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const CLIENT_INTERACTIVE_TILE =
  "rounded-xl border border-border/70 bg-background transition-all duration-300 ease-out motion-reduce:transition-none hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const CLIENT_SURFACE_CARD = "border-border/70 shadow-sm";

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
  "overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm";
