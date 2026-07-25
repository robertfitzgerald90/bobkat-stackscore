import type { ReactNode } from "react";
import { Clock, Layers, Target, TrendingUp } from "lucide-react";
import type { ClientImprovementPlanDemoData, TipDemoRecommendation } from "../types";
import {
  DemoBadge,
  DemoCard,
  DemoCardContent,
  DemoCardDescription,
  DemoCardHeader,
  DemoCardTitle,
} from "../ui/demo-primitives";
import { cn } from "../utils/cn";
import {
  formatPriority,
  getScoreTextColorClass,
  priorityBadgeVariant,
} from "../utils/score-display";

type RecommendationsDemoProps = {
  data: ClientImprovementPlanDemoData;
};

export function RecommendationsDemo({ data }: RecommendationsDemoProps) {
  const { priorityBreakdown } = data;

  return (
    <div className="space-y-6">
      <DemoCard className="border-primary/20 bg-primary/5">
        <DemoCardHeader>
          <DemoCardTitle>Plan Summary</DemoCardTitle>
          <DemoCardDescription>
            Client-facing view of included recommendations and expected outcomes.
          </DemoCardDescription>
        </DemoCardHeader>
        <DemoCardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryStat
              icon={Layers}
              label="Recommendations included"
              value={String(data.recommendationsIncluded)}
            />
            <SummaryStat
              icon={Target}
              label="Current → projected"
              value={
                <span>
                  {data.currentScore}{" "}
                  <span className="text-muted-foreground">→</span>{" "}
                  <span className={getScoreTextColorClass(data.projectedScore)}>
                    {data.projectedScore}
                  </span>
                </span>
              }
            />
            <SummaryStat
              icon={TrendingUp}
              label="Expected improvement"
              value={`+${data.expectedImprovement} points`}
            />
            <SummaryStat
              icon={Clock}
              label="Estimated timeline"
              value={data.estimatedTimeline}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <DemoBadge variant="destructive">Critical {priorityBreakdown.critical}</DemoBadge>
            <DemoBadge>High {priorityBreakdown.high}</DemoBadge>
            <DemoBadge variant="secondary">Medium {priorityBreakdown.medium}</DemoBadge>
            <DemoBadge variant="outline">Low {priorityBreakdown.low}</DemoBadge>
          </div>
        </DemoCardContent>
      </DemoCard>

      <DemoCard>
        <DemoCardHeader>
          <DemoCardTitle>Business Objectives</DemoCardTitle>
          <DemoCardDescription>
            Outcomes this Technology Improvement Plan is designed to advance.
          </DemoCardDescription>
        </DemoCardHeader>
        <DemoCardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.businessObjectives.map((objective) => (
              <li
                key={objective}
                className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground"
              >
                {objective}
              </li>
            ))}
          </ul>
        </DemoCardContent>
      </DemoCard>

      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium">Recommendations</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Prioritized initiatives selected for {data.clientName}.
          </p>
        </div>
        {data.recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: TipDemoRecommendation }) {
  return (
    <article className="rounded-lg border border-t-4 border-t-primary bg-background p-4 shadow-sm">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h4 className="text-base font-medium leading-snug">{recommendation.title}</h4>
          <div className="flex flex-wrap gap-2">
            <DemoBadge variant={priorityBadgeVariant(recommendation.priority)}>
              {formatPriority(recommendation.priority)}
            </DemoBadge>
            <DemoBadge variant="outline">{recommendation.pillar}</DemoBadge>
            <DemoBadge variant="secondary">{recommendation.implementationPhase}</DemoBadge>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="Why this matters" value={recommendation.whyThisMatters} />
        <Field label="Business benefit" value={recommendation.businessBenefit} />
        <Field label="Expected outcome" value={recommendation.expectedOutcome} />
        <Field label="Implementation phase" value={recommendation.implementationPhase} />
      </dl>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-lg bg-muted/30 p-3")}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-foreground">{value}</dd>
    </div>
  );
}
