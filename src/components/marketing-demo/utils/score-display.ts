/** Presentation-only score color helpers (mirrors StackScore scoring thresholds). */

export function getScoreBarColorClass(score: number): string {
  if (score < 60) return "bg-destructive";
  if (score < 80) return "bg-warning";
  return "bg-success";
}

export function getScoreTextColorClass(score: number): string {
  if (score < 60) return "text-destructive";
  if (score < 80) return "text-warning";
  return "text-success";
}

export function formatPriority(priority: string): string {
  if (!priority) return "";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function priorityBadgeVariant(
  priority: string,
): "destructive" | "default" | "secondary" | "outline" {
  switch (priority) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}
