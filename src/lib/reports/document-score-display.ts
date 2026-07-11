/** Fixed-color score styling for report documents (independent of app theme). */

export function getReportScoreTextClass(score: number | null): string {
  if (score === null) return "report-score-text-muted";
  if (score < 60) return "report-score-text-critical";
  if (score < 80) return "report-score-text-at-risk";
  return "report-score-text-strong";
}

export function getReportScoreBarClass(score: number | null): string {
  if (score === null) return "report-score-bar-track";
  if (score < 60) return "report-score-bar-critical";
  if (score < 80) return "report-score-bar-at-risk";
  return "report-score-bar-strong";
}
