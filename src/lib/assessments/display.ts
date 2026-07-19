export const ASSESSMENT_TYPE_LABELS = {
  initial: "Initial",
  quarterly: "Business Review",
  annual: "Annual Review",
  followup: "Follow-up",
} as const;

export const ASSESSMENT_STATUS_LABELS = {
  draft: "In Progress",
  completed: "Completed",
  archived: "Archived",
} as const;

export type AssessmentDisplayFields = {
  assessmentName: string;
  assessmentType: string;
  completedAt: string | Date | null;
  overallScore: number | null;
};

export function formatAssessmentType(type: string): string {
  const label = ASSESSMENT_TYPE_LABELS[type as keyof typeof ASSESSMENT_TYPE_LABELS];
  if (label) return label;

  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatAssessmentStatus(status: string): string {
  const label = ASSESSMENT_STATUS_LABELS[status as keyof typeof ASSESSMENT_STATUS_LABELS];
  if (label) return label;

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatAssessmentCompletionDate(
  completedAt: string | Date | null | undefined,
): string {
  if (!completedAt) return "Not completed";

  const date = completedAt instanceof Date ? completedAt : new Date(completedAt);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatAssessmentBaselineSummary(assessment: AssessmentDisplayFields): string {
  const date = formatAssessmentCompletionDate(assessment.completedAt);
  const score =
    assessment.overallScore !== null ? `Score ${assessment.overallScore}` : "No score";

  return `${assessment.assessmentName} (${date}) — ${score}`;
}

export function sortCompletedAssessmentsNewestFirst<T extends { completedAt: string | null }>(
  assessments: T[],
): T[] {
  return [...assessments].sort((left, right) => {
    const leftTime = left.completedAt ? new Date(left.completedAt).getTime() : 0;
    const rightTime = right.completedAt ? new Date(right.completedAt).getTime() : 0;
    return rightTime - leftTime;
  });
}
