import type { AssessmentResultsSummary } from "@/lib/assessments/results-summary";
import type { Priority } from "@/generated/prisma/client";

export type AssessmentReportData = {
  clientName: string;
  assessmentName: string;
  assessmentDate: string;
  completedAt: string | null;
  executiveSummary: string | null;
  summary: AssessmentResultsSummary;
};

export const PRIORITY_ORDER: Priority[] = ["critical", "high", "medium", "low"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "Critical Priority",
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

export function formatReportDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-").slice(0, 80);
}
