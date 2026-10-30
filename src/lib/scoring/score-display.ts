/** Presentation-only helpers for maturity score styling and labels. */

/** Application convention for unavailable / incomplete maturity scores. */
export const MATURITY_SCORE_UNAVAILABLE = "—";

/**
 * SS-UX-018 — Display-only whole-number maturity score.
 * Does not mutate stored values; callers must keep full precision for
 * bars, classification, aggregation, and persistence.
 */
export function formatMaturityScore(
  score: number | null | undefined,
  unavailable: string = MATURITY_SCORE_UNAVAILABLE,
): string {
  if (score === null || score === undefined) return unavailable;
  if (typeof score !== "number" || !Number.isFinite(score)) return unavailable;
  return String(Math.round(score));
}

export function getScoreBarColorClass(score: number | null): string {
  if (score === null) return "bg-muted-foreground/20";
  if (score < 60) return "bg-destructive";
  if (score < 80) return "bg-warning";
  return "bg-success";
}

export function getScoreTextColorClass(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score < 60) return "text-destructive";
  if (score < 80) return "text-warning";
  return "text-success";
}
