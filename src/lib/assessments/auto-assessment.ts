import type { AssessmentType } from "@/generated/prisma/client";

export type CompletedAssessmentForAuto = {
  id: string;
  completedAt: string | null;
  assessmentType: string;
};

export type AutoInitialAssessment = {
  kind: "initial";
  assessmentName: string;
  assessmentType: "initial";
};

export type AutoReassessment = {
  kind: "reassessment";
  assessmentName: string;
  assessmentType: AssessmentType;
  sourceAssessmentId: string;
};

export type AutoAssessmentParams = AutoInitialAssessment | AutoReassessment;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const QUARTERLY_DAYS = 90;
const ANNUAL_DAYS = 365;

function daysSince(completedAt: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(completedAt).getTime()) / MS_PER_DAY);
}

function reassessmentLabel(type: AssessmentType): string {
  switch (type) {
    case "quarterly":
      return "Quarterly Assessment";
    case "annual":
      return "Annual Assessment";
    case "followup":
    default:
      return "Follow-up Assessment";
  }
}

function resolveReassessmentType(
  latest: CompletedAssessmentForAuto,
  now: Date,
  nextRecommendedAssessmentAt: string | null | undefined,
): AssessmentType {
  if (!latest.completedAt) return "followup";

  const elapsedDays = daysSince(latest.completedAt, now);

  if (elapsedDays >= ANNUAL_DAYS) {
    return "annual";
  }

  const isOverdue =
    nextRecommendedAssessmentAt !== null &&
    nextRecommendedAssessmentAt !== undefined &&
    new Date(nextRecommendedAssessmentAt).getTime() <= now.getTime();

  if (elapsedDays >= QUARTERLY_DAYS || isOverdue) {
    return "quarterly";
  }

  return "followup";
}

/**
 * Chooses initial vs reassessment type and display name without user input (DOC-007).
 * Uses elapsed time since last completion and overdue reassessment window.
 */
export function resolveAutoAssessmentParams(input: {
  completedAssessments: CompletedAssessmentForAuto[];
  nextRecommendedAssessmentAt?: string | null;
  now?: Date;
}): AutoAssessmentParams {
  const now = input.now ?? new Date();
  const completed = input.completedAssessments.filter((assessment) => assessment.completedAt);

  if (completed.length === 0) {
    return {
      kind: "initial",
      assessmentName: "Initial Assessment",
      assessmentType: "initial",
    };
  }

  const sorted = [...completed].sort((left, right) => {
    const leftTime = new Date(left.completedAt!).getTime();
    const rightTime = new Date(right.completedAt!).getTime();
    return rightTime - leftTime;
  });

  const latest = sorted[0];
  const assessmentType = resolveReassessmentType(
    latest,
    now,
    input.nextRecommendedAssessmentAt,
  );

  return {
    kind: "reassessment",
    assessmentName: reassessmentLabel(assessmentType),
    assessmentType,
    sourceAssessmentId: latest.id,
  };
}
