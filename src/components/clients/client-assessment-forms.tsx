"use client";

import { useIsClient } from "@/hooks/use-is-client";
import { ReassessmentForm } from "@/components/clients/reassessment-form";
import { StartAssessmentForm } from "@/components/clients/start-assessment-form";

type CompletedAssessment = {
  id: string;
  assessmentName: string;
  assessmentType: string;
  completedAt: string | null;
  overallScore: number | null;
};

export function ClientAssessmentForms({
  clientId,
  completedAssessments,
}: {
  clientId: string;
  completedAssessments: CompletedAssessment[];
}) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className="h-[212px] w-full max-w-sm animate-pulse rounded-lg border border-border/60 bg-muted/20"
          aria-hidden
        />
        {completedAssessments.length > 0 ? (
          <div
            className="h-[360px] w-full max-w-sm animate-pulse rounded-lg border border-border/60 bg-muted/20"
            aria-hidden
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-start">
      <StartAssessmentForm clientId={clientId} />
      {completedAssessments.length > 0 ? (
        <ReassessmentForm clientId={clientId} completedAssessments={completedAssessments} />
      ) : null}
    </div>
  );
}
