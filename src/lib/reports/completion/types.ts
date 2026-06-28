import type { Priority } from "@/generated/prisma/client";
import type { ProgressCategoryChange } from "@/lib/reports/progress/types";

export type CompletionReportData = {
  clientId: string;
  clientName: string;
  projectId: string;
  projectTitle: string;
  completedAt: string;
  generatedDateLabel: string;
  executiveSummary: string;
  businessImpactBullets: string[];
  recommendationTitle: string;
  recommendationBusinessImpact: string;
  categoryName: string;
  priority: Priority;
  estimatedImpactPoints: number | null;
  actualImpactPoints: number | null;
  scoreBefore: number | null;
  scoreAfter: number | null;
  scoreChange: number | null;
  categoryChanges: ProgressCategoryChange[];
  warrantyNotes: string[];
  nextSteps: string[];
  journeyPhaseLabel: string;
};
