import { Route } from "lucide-react";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

export type JourneyProgressSummaryProps = {
  stage: string;
  milestonePercent: number;
  initialScore: number | null;
  currentScore: number | null;
  projectedScore: number | null;
  targetScore: number | null;
  pointsImproved: number | null;
  assessmentCount: number;
  openRecommendationCount: number;
  activeProjectCount: number;
  completedCount: number;
  /** When false, hides score ladder and shows the pre-assessment empty state. */
  hasAssessment?: boolean;
  /** Disables navigation actions in the empty state. */
  readOnly?: boolean;
  /** Larger padding and friendlier metric labels for marketing previews. */
  marketingPreview?: boolean;
  clientId?: string;
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
        "flex min-w-0 flex-col items-center rounded-lg border px-2 py-3 text-center sm:px-3 sm:py-4",
        highlight ? "border-primary/40 bg-primary/5" : "border-border/60",
      )}
    >
      <p className="break-words text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-xl font-bold tabular-nums sm:text-2xl",
          getScoreTextColorClass(score),
        )}
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

export function JourneyProgressSummary({
  stage,
  milestonePercent,
  initialScore,
  currentScore,
  projectedScore,
  targetScore,
  pointsImproved,
  assessmentCount,
  openRecommendationCount,
  activeProjectCount,
  completedCount,
  hasAssessment = assessmentCount > 0,
  readOnly = false,
  marketingPreview = false,
  clientId,
}: JourneyProgressSummaryProps) {
  const steps: LadderStep[] = [
    { label: "Initial", score: initialScore },
    { label: "Current", score: currentScore, highlight: true },
    { label: "Projected", score: projectedScore },
    { label: "Target", score: targetScore },
  ];

  const openRecsLabel = marketingPreview ? "Open recommendations" : "Open recs";

  return (
    <div className={cn("space-y-5", marketingPreview && "space-y-6")}>
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{stage}</p>
          <p className="text-xs text-muted-foreground">{milestonePercent}% milestones</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${milestonePercent}%` }}
          />
        </div>
      </div>

      {!hasAssessment ? (
        <TpEmptyState
          icon={Route}
          title="Journey not started"
          message="The assess → improve → maintain lifecycle begins with the first completed assessment."
          actionLabel={readOnly ? undefined : "Start assessment"}
          actionHref={readOnly || !clientId ? undefined : clientTechnologyProfilePath(clientId)}
        />
      ) : (
        <>
          <div
            className={cn(
              "grid gap-2",
              marketingPreview
                ? "grid-cols-2 lg:grid-cols-4 lg:gap-3"
                : "grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-4",
            )}
          >
            {steps.map((step) => (
              <ScoreLadderStep key={step.label} {...step} />
            ))}
          </div>

          {pointsImproved !== null ? (
            <p className="text-center text-sm text-muted-foreground">
              {pointsImproved >= 0 ? "+" : ""}
              {pointsImproved} pts since first assessment
            </p>
          ) : null}
        </>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm">
        <JourneyStat label="Assessments" value={assessmentCount} />
        <JourneyStat label={openRecsLabel} value={openRecommendationCount} />
        <JourneyStat label="Active projects" value={activeProjectCount} />
        <JourneyStat label="Completed" value={completedCount} />
      </div>
    </div>
  );
}
