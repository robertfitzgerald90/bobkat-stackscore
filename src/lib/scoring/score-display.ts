/** Presentation-only helpers for score color styling. */

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
