import { Route } from "lucide-react";
import { JourneyProgressSummary } from "@/components/technology-journey/journey-progress-summary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  TechnologyJourneyProgress,
  TechnologyJourneyScores,
} from "@/lib/technology-profile/types";
import { cn } from "@/lib/utils";

type TpTechnologyJourneyProps = {
  clientId: string;
  journey: TechnologyJourneyProgress;
  journeyScores: TechnologyJourneyScores;
  /** When true, omits card chrome for workspace section embedding. */
  embedded?: boolean;
};

export function TpTechnologyJourney({
  clientId,
  journey,
  journeyScores,
  embedded = false,
}: TpTechnologyJourneyProps) {
  const hasAssessment = journey.assessmentsCompleted > 0;

  return (
    <Card className="stat-card h-full">
      {!embedded ? (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Route className="h-4 w-4 text-primary" />
            Technology Journey
          </CardTitle>
          <CardDescription>Score progression across the BTIL lifecycle</CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-5", embedded && "pt-(--card-spacing)")}>
        <JourneyProgressSummary
          stage={journey.phaseLabel}
          milestonePercent={journey.progressPercent}
          initialScore={journeyScores.initialScore}
          currentScore={journeyScores.currentScore}
          projectedScore={journeyScores.projectedScore}
          targetScore={journeyScores.longTermTargetScore}
          pointsImproved={journeyScores.scoreDeltaSinceInitial}
          assessmentCount={journey.assessmentsCompleted}
          openRecommendationCount={journey.openRecommendations}
          activeProjectCount={journey.activeProjects}
          completedCount={journey.completedProjects}
          hasAssessment={hasAssessment}
          clientId={clientId}
        />
      </CardContent>
    </Card>
  );
}
