/** Presentation helpers aligned with StackScore score thresholds. */

export function getScoreBarColorClass(score: number): string {
  if (score < 60) return "bg-red-500";
  if (score < 80) return "bg-amber-500";
  return "bg-emerald-500";
}

export function getScoreTextColorClass(score: number): string {
  if (score < 60) return "text-red-600 dark:text-red-400";
  if (score < 80) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

export function formatPriority(priority: string): string {
  if (!priority) return "";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function priorityBadgeClass(priority: string): string {
  switch (priority) {
    case "critical":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300";
    case "high":
      return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";
    case "medium":
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "border-slate-200 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-400";
  }
}
