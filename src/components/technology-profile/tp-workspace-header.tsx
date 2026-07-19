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
  variant?: "default" | "workspaceShell";
};

export function TpWorkspaceHeader({
  clientId,
  clientName,
  clientStatus,
  showAssessClient,
  completedAssessments,
  draftAssessmentId,
  nextRecommendedAssessmentAt,
  variant = "default",
}: TpWorkspaceHeaderProps) {
  const isWorkspaceShell = variant === "workspaceShell";

  return (
    <header className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2
            className={
              isWorkspaceShell
                ? "break-words text-2xl font-semibold tracking-tight text-sidebar-foreground sm:text-3xl"
                : "page-title"
            }
          >
            {clientName}
          </h2>
          <Badge
            variant="outline"
            className={
              isWorkspaceShell
                ? "border-sidebar-border/80 bg-sidebar-accent/40 text-sidebar-foreground"
                : undefined
            }
          >
            {formatClientStatus(clientStatus)}
          </Badge>
        </div>
        <p
          className={
            isWorkspaceShell
              ? "mt-1 text-sm text-sidebar-foreground/75"
              : "mt-1 text-sm text-muted-foreground"
          }
        >
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
