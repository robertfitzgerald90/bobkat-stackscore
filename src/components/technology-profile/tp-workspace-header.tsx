import { Badge } from "@/components/ui/badge";
import { AssessClientButton } from "@/components/clients/assess-client-button";
import { formatClientStatus } from "@/lib/display";
import type { CompletedAssessmentForAuto } from "@/lib/assessments/auto-assessment";

type TpWorkspaceHeaderProps = {
  clientId: string;
  clientName: string;
  clientStatus: string;
  showAssessClient: boolean;
  completedAssessments: CompletedAssessmentForAuto[];
  draftAssessmentId?: string | null;
  nextRecommendedAssessmentAt?: string | null;
};

export function TpWorkspaceHeader({
  clientId,
  clientName,
  clientStatus,
  showAssessClient,
  completedAssessments,
  draftAssessmentId,
  nextRecommendedAssessmentAt,
}: TpWorkspaceHeaderProps) {
  return (
    <header className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="page-title">{clientName}</h2>
          <Badge variant="outline">{formatClientStatus(clientStatus)}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          What deserves your immediate focus?
        </p>
      </div>
      {showAssessClient ? (
        <AssessClientButton
          clientId={clientId}
          completedAssessments={completedAssessments}
          draftAssessmentId={draftAssessmentId}
          nextRecommendedAssessmentAt={nextRecommendedAssessmentAt}
        />
      ) : null}
    </header>
  );
}
