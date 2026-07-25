import type { ClientImprovementPlanDemoData } from "../types";
import {
  DemoBadge,
  DemoCard,
  DemoCardContent,
  DemoCardDescription,
  DemoCardHeader,
  DemoCardTitle,
} from "../ui/demo-primitives";

type SolutionPlaybooksDemoProps = {
  data: ClientImprovementPlanDemoData;
};

export function SolutionPlaybooksDemo({ data }: SolutionPlaybooksDemoProps) {
  const recommendationById = new Map(data.recommendations.map((rec) => [rec.id, rec]));

  return (
    <div className="space-y-6">
      <DemoCard className="border-primary/20 bg-primary/5">
        <DemoCardHeader>
          <DemoCardTitle>Solution Playbooks</DemoCardTitle>
          <DemoCardDescription>
            Repeatable execution patterns that convert recommendations into measurable business
            outcomes for {data.clientName}.
          </DemoCardDescription>
        </DemoCardHeader>
      </DemoCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {data.playbooks.map((playbook) => (
          <DemoCard key={playbook.id}>
            <DemoCardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DemoBadge variant="outline">{playbook.pillar}</DemoBadge>
              </div>
              <DemoCardTitle className="mt-2">{playbook.title}</DemoCardTitle>
              <DemoCardDescription>{playbook.objective}</DemoCardDescription>
            </DemoCardHeader>
            <DemoCardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Outcomes
                </p>
                <ul className="mt-2 space-y-1.5">
                  {playbook.outcomes.map((outcome) => (
                    <li key={outcome} className="text-sm text-foreground">
                      <span className="mr-2 text-primary">•</span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Related recommendations
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {playbook.relatedRecommendationIds.map((id) => {
                    const related = recommendationById.get(id);
                    if (!related) return null;
                    return (
                      <DemoBadge key={id} variant="secondary">
                        {related.title}
                      </DemoBadge>
                    );
                  })}
                </div>
              </div>
            </DemoCardContent>
          </DemoCard>
        ))}
      </div>
    </div>
  );
}
