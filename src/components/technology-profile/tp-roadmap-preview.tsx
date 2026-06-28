import Link from "next/link";
import { Map, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { ProfileTipSummary, RoadmapPhasePreview } from "@/lib/technology-profile/types";
import { cn } from "@/lib/utils";

type TpRoadmapPreviewProps = {
  clientId: string;
  phases: RoadmapPhasePreview[];
  activeTip: ProfileTipSummary | null;
  canEditImprovementPlan: boolean;
};

export function TpRoadmapPreview({
  clientId,
  phases,
  activeTip,
  canEditImprovementPlan,
}: TpRoadmapPreviewProps) {
  return (
    <Card className="stat-card h-full">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Roadmap Preview
            </CardTitle>
            <CardDescription>
              Phased improvement plan from the active Technology Improvement Plan
            </CardDescription>
          </div>
          {activeTip ? (
            <Link
              href={`/clients/${clientId}/improvement-plan/${activeTip.id}`}
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              Open Plan
            </Link>
          ) : canEditImprovementPlan ? (
            <Link
              href={`/clients/${clientId}/improvement-plan`}
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Start Plan
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {phases.length === 0 ? (
          <TpEmptyState
            icon={Map}
            title="No roadmap yet"
            message="Start an Improvement Plan to group recommendations into phased milestones with projected scores."
            actionLabel={canEditImprovementPlan ? "Start Improvement Plan" : undefined}
            actionHref={
              canEditImprovementPlan ? `/clients/${clientId}/improvement-plan` : undefined
            }
          />
        ) : (
          <>
            {activeTip ? (
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{activeTip.title}</span>
                <Badge variant="secondary">{activeTip.status}</Badge>
                {activeTip.projectedScore !== null ? (
                  <span className="text-muted-foreground">
                    Projected score:{" "}
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        getScoreTextColorClass(activeTip.projectedScore),
                      )}
                    >
                      {activeTip.projectedScore}
                    </span>
                  </span>
                ) : null}
              </div>
            ) : null}
            {phases.map((phase, index) => (
              <div
                key={phase.id}
                className="flex flex-col gap-2 rounded-lg border border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Phase {index + 1}</p>
                  <p className="font-medium">{phase.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {phase.recommendationCount}{" "}
                    {phase.recommendationCount === 1 ? "recommendation" : "recommendations"}
                  </p>
                </div>
                <p
                  className={cn(
                    "text-xl font-bold tabular-nums sm:shrink-0",
                    getScoreTextColorClass(phase.projectedScore),
                  )}
                >
                  {phase.projectedScore}
                </p>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
