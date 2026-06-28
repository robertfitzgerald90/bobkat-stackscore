import type { ReactNode } from "react";

export type ReportType =
  | "assessment"
  | "technology_improvement_plan"
  | "technology_progress"
  | "technology_completion"
  | "quarterly_business_review"
  | "assessment_comparison";

export type ReportMetaItem = {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
  valueClassName?: string;
};

export type ReportTypeMeta = {
  title: string;
  subtitle: string;
  attribution: "prepared" | "generated";
};

export const REPORT_PRINT_ROOT_CLASS = "stackscore-report";
