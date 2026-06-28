import Link from "next/link";
import { Map, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="flex flex-wrap items-start justify-between gap-3">
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
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              Open Plan
            </Link>
          ) : canEditImprovementPlan ? (
            <Link
              href={`/clients/${clientId}/improvement-plan`}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Start Plan
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {phases.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center">
            <p className="text-sm font-medium">No roadmap yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start an Improvement Plan to build a phased technology roadmap.
            </p>
            {canEditImprovementPlan ? (
              <Link
                href={`/clients/${clientId}/improvement-plan`}
                className={buttonClassName({ variant: "default", size: "sm", className: "mt-4" })}
              >
                Start Improvement Plan
              </Link>
            ) : null}
          </div>
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
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-4 py-3"
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
                    "shrink-0 text-xl font-bold tabular-nums",
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
