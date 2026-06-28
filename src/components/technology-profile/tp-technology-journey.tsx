import { Route } from "lucide-react";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type {
  TechnologyJourneyProgress,
  TechnologyJourneyScores,
} from "@/lib/technology-profile/types";
import { cn } from "@/lib/utils";

type TpTechnologyJourneyProps = {
  clientId: string;
  journey: TechnologyJourneyProgress;
  journeyScores: TechnologyJourneyScores;
};

type LadderStep = {
  label: string;
  score: number | null;
  highlight?: boolean;
};

function ScoreLadderStep({ label, score, highlight }: LadderStep) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center rounded-lg border px-2 py-3 text-center sm:px-3 sm:py-4",
        highlight ? "border-primary/40 bg-primary/5" : "border-border/60",
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
        {label}
      </p>
      <p
        className={cn("mt-1 text-xl font-bold tabular-nums sm:text-2xl", getScoreTextColorClass(score))}
      >
        {score !== null ? score : "—"}
      </p>
    </div>
  );
}

function JourneyStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/60 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function TpTechnologyJourney({ clientId, journey, journeyScores }: TpTechnologyJourneyProps) {
  const hasAssessment = journey.assessmentsCompleted > 0;
  const steps: LadderStep[] = [
    { label: "Initial", score: journeyScores.initialScore },
    { label: "Current", score: journeyScores.currentScore, highlight: true },
    { label: "Projected", score: journeyScores.projectedScore },
    { label: "Target", score: journeyScores.longTermTargetScore },
  ];

  return (
    <Card className="stat-card h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Route className="h-4 w-4 text-primary" />
          Technology Journey
        </CardTitle>
        <CardDescription>Score progression across the BTIL lifecycle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{journey.phaseLabel}</p>
            <p className="text-xs text-muted-foreground">{journey.progressPercent}% milestones</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${journey.progressPercent}%` }}
            />
          </div>
        </div>

        {!hasAssessment ? (
          <TpEmptyState
            icon={Route}
            title="Journey not started"
            message="The assess → improve → maintain lifecycle begins with the first completed assessment."
            actionLabel="Start assessment"
            actionHref={clientTechnologyProfilePath(clientId)}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {steps.map((step) => (
                <ScoreLadderStep key={step.label} {...step} />
              ))}
            </div>

            {journeyScores.scoreDeltaSinceInitial !== null ? (
              <p className="text-center text-sm text-muted-foreground">
                {journeyScores.scoreDeltaSinceInitial >= 0 ? "+" : ""}
                {journeyScores.scoreDeltaSinceInitial} pts since first assessment
              </p>
            ) : null}
          </>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <JourneyStat label="Assessments" value={journey.assessmentsCompleted} />
          <JourneyStat label="Open recs" value={journey.openRecommendations} />
          <JourneyStat label="Active projects" value={journey.activeProjects} />
          <JourneyStat label="Completed" value={journey.completedProjects} />
        </div>
      </CardContent>
    </Card>
  );
}
