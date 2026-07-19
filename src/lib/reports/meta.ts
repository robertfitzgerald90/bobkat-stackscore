import type { ReportType, ReportTypeMeta } from "@/lib/reports/types";

export const REPORT_TYPE_META: Record<ReportType, ReportTypeMeta> = {
  assessment: {
    title: "Technology Maturity Assessment",
    subtitle:
      "A comprehensive evaluation of technology posture, risk exposure, and improvement opportunities.",
    attribution: "prepared",
  },
  technology_improvement_plan: {
    title: "Technology Improvement Plan",
    subtitle:
      "A phased technology roadmap developed by your Virtual CIO — approve and implement one phase at a time.",
    attribution: "generated",
  },
  technology_progress: {
    title: "Technology Progress Report",
    subtitle:
      "Documented improvement since the last review — score movement, completed work, and momentum.",
    attribution: "prepared",
  },
  technology_completion: {
    title: "Technology Completion Report",
    subtitle:
      "Business value delivered through completed technology initiatives and measurable profile impact.",
    attribution: "prepared",
  },
  quarterly_business_review: {
    title: "Business Review",
    subtitle:
      "Flexible strategic review — technology progress, completed work, and priorities ahead.",
    attribution: "prepared",
  },
  assessment_comparison: {
    title: "Assessment Comparison",
    subtitle:
      "Score movement, recommendation changes, and answer-level progress between completed assessments.",
    attribution: "prepared",
  },
};

export function getReportTypeMeta(type: ReportType): ReportTypeMeta {
  return REPORT_TYPE_META[type];
}
