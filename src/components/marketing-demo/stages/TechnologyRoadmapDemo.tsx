import type { ClientImprovementPlanDemoData } from "../types";
import {
  DemoBadge,
  DemoCard,
  DemoCardContent,
  DemoCardDescription,
  DemoCardHeader,
  DemoCardTitle,
} from "../ui/demo-primitives";
import { formatPriority, priorityBadgeVariant } from "../utils/score-display";

type TechnologyRoadmapDemoProps = {
  data: ClientImprovementPlanDemoData;
};

export function TechnologyRoadmapDemo({ data }: TechnologyRoadmapDemoProps) {
  return (
    <div className="space-y-6">
      <DemoCard className="border-primary/20 bg-primary/5">
        <DemoCardHeader>
          <DemoCardTitle>Technology Roadmap</DemoCardTitle>
          <DemoCardDescription>
            A phased delivery plan spanning {data.estimatedTimeline}, moving from{" "}
            {data.currentScore} to {data.projectedScore} StackScore points.
          </DemoCardDescription>
        </DemoCardHeader>
      </DemoCard>

      <div className="space-y-4">
        {data.roadmapPhases.map((phase, index) => (
          <DemoCard key={phase.id}>
            <DemoCardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DemoBadge>{`Phase ${index + 1}`}</DemoBadge>
                <DemoBadge variant="outline">{phase.timeframe}</DemoBadge>
              </div>
              <DemoCardTitle className="mt-2">{phase.name}</DemoCardTitle>
              <DemoCardDescription>{phase.focus}</DemoCardDescription>
            </DemoCardHeader>
            <DemoCardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phase outcomes
                </p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {phase.outcomes.map((outcome) => (
                    <li key={outcome} className="rounded-lg border bg-background px-3 py-2 text-sm">
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Initiatives
                </p>
                {phase.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.pillar}</p>
                    </div>
                    <DemoBadge variant={priorityBadgeVariant(item.priority)}>
                      {formatPriority(item.priority)}
                    </DemoBadge>
                  </div>
                ))}
              </div>
            </DemoCardContent>
          </DemoCard>
        ))}
      </div>
    </div>
  );
}
