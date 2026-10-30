import type { RecommendationStatus } from "@/generated/prisma/client";

/**
 * SS-UX-007-FIX — Initiative status chips for the customer phase workspace.
 *
 * Each pair sets an explicit background and a foreground that tracks the
 * active theme (charcoal bone, or staff slate). Planned (`open`) must not use
 * a light fill with inherited light text.
 *
 * Declined uses `text-foreground` because ember (`--destructive`) on charcoal
 * fails small-text contrast. In Progress and Deferred do the same: warning
 * amber on a light wash is under 4.5:1. Completed uses foreground text for
 * the same reason on the light staff surface. The label names the status;
 * the border and wash carry the semantic color.
 */
export const INITIATIVE_STATUS_BADGE_CLASS: Record<RecommendationStatus, string> = {
  open: "border-border bg-secondary text-foreground",
  accepted: "border-primary/45 bg-primary/10 text-primary",
  in_progress: "border-warning/50 bg-warning/10 text-foreground",
  completed: "border-success/45 bg-success/10 text-foreground",
  deferred: "border-warning/50 bg-warning/10 text-foreground",
  archived: "border-border bg-muted text-foreground",
  declined: "border-destructive/55 bg-destructive/10 text-foreground",
};

export function initiativeStatusBadgeClass(status: RecommendationStatus): string {
  return INITIATIVE_STATUS_BADGE_CLASS[status];
}
