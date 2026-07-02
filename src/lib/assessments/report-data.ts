import type { AssessmentResultsSummary } from "@/lib/assessments/results-summary";
import type { AssessmentReportData } from "@/lib/pdf/types";
import { formatReportDate } from "@/lib/pdf/types";

/** Maps completed assessment results into PDF renderer input (immutable snapshot at generation time). */
export function buildAssessmentReportData(input: {
  clientName: string;
  assessmentName: string;
  assessmentType: string;
  assessmentDate: Date | string;
  completedAt: string | null;
  executiveSummary: string | null;
  summary: AssessmentResultsSummary;
}): AssessmentReportData {
  const assessmentDateIso =
    input.assessmentDate instanceof Date
      ? input.assessmentDate.toISOString()
      : input.assessmentDate;

  return {
    clientName: input.clientName,
    assessmentName: input.assessmentName,
    assessmentType: input.assessmentType,
    assessmentDate: formatReportDate(assessmentDateIso),
    completedAt: input.completedAt,
    executiveSummary: input.executiveSummary,
    summary: input.summary,
  };
}
