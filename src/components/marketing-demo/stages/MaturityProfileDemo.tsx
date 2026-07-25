import type { ClientImprovementPlanDemoData } from "../types";
import {
  DemoCard,
  DemoCardContent,
  DemoCardDescription,
  DemoCardHeader,
  DemoCardTitle,
} from "../ui/demo-primitives";
import { cn } from "../utils/cn";
import { getScoreBarColorClass, getScoreTextColorClass } from "../utils/score-display";

type MaturityProfileDemoProps = {
  data: ClientImprovementPlanDemoData;
};

export function MaturityProfileDemo({ data }: MaturityProfileDemoProps) {
  return (
    <div className="space-y-6">
      <DemoCard className="border-primary/20 bg-primary/5">
        <DemoCardHeader>
          <DemoCardTitle>Technology Maturity Profile</DemoCardTitle>
          <DemoCardDescription>
            Current maturity across strategic pillars for {data.clientName}, based on{" "}
            {data.assessmentName}.
          </DemoCardDescription>
        </DemoCardHeader>
        <DemoCardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Current score" value={data.currentScore} emphasizeScore />
            <Metric label="Projected score" value={data.projectedScore} emphasizeScore />
            <Metric label="Expected improvement" value={`+${data.expectedImprovement}`} />
            <Metric label="Maturity level" value={data.maturityLevel} />
          </div>
        </DemoCardContent>
      </DemoCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.pillars.map((pillar) => (
          <DemoCard key={pillar.id}>
            <DemoCardHeader>
              <DemoCardTitle>{pillar.name}</DemoCardTitle>
              <DemoCardDescription>{pillar.summary}</DemoCardDescription>
            </DemoCardHeader>
            <DemoCardContent className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Today</p>
                  <p className={cn("text-2xl font-semibold tabular-nums", getScoreTextColorClass(pillar.currentScore))}>
                    {pillar.currentScore}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Projected</p>
                  <p className={cn("text-2xl font-semibold tabular-nums", getScoreTextColorClass(pillar.projectedScore))}>
                    {pillar.projectedScore}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", getScoreBarColorClass(pillar.currentScore))}
                    style={{ width: `${Math.min(100, pillar.currentScore)}%` }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", getScoreBarColorClass(pillar.projectedScore))}
                    style={{ width: `${Math.min(100, pillar.projectedScore)}%` }}
                  />
                </div>
              </div>
            </DemoCardContent>
          </DemoCard>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  emphasizeScore = false,
}: {
  label: string;
  value: string | number;
  emphasizeScore?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          emphasizeScore && typeof value === "number" ? getScoreTextColorClass(value) : undefined,
        )}
      >
        {value}
      </p>
    </div>
  );
}
