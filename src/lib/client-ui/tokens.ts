/**
 * Shared presentational tokens for authenticated client portal and Interactive Demo.
 * Keep presentation-only — no data fetching or demo state here.
 */

export const CLIENT_INTERACTIVE_CARD =
  "rounded-xl border border-border bg-card transition-colors duration-150 ease-out motion-reduce:transition-none hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const CLIENT_INTERACTIVE_TILE =
  "rounded-xl border border-border bg-background transition-colors duration-150 ease-out motion-reduce:transition-none hover:border-primary hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const CLIENT_SURFACE_CARD = "border-border";

export const CLIENT_METRIC_VALUE = "instrument-mono tabular-nums tracking-tight";

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

export const CLIENT_NEXT_ACTION_SURFACE = "overflow-hidden border-primary/20 bg-primary/5";
