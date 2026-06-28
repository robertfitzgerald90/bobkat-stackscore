import Link from "next/link";
import { Lightbulb, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TpEmptyState } from "@/components/technology-profile/tp-empty-state";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { PRIORITY_LABELS } from "@/lib/display";
import type {
  ProfileCapabilities,
  ProfileRecommendationSummary,
} from "@/lib/technology-profile/types";

const MAX_OPPORTUNITIES = 8;

type TpOpenOpportunitiesProps = {
  clientId: string;
  recommendations: ProfileRecommendationSummary[];
  capabilities: ProfileCapabilities;
  assessmentsCompleted: number;
};

export function TpOpenOpportunities({
  clientId,
  recommendations,
  capabilities,
  assessmentsCompleted,
}: TpOpenOpportunitiesProps) {
  const visible = recommendations.slice(0, MAX_OPPORTUNITIES);

  return (
    <Card className="stat-card">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Open Opportunities
            </CardTitle>
            <CardDescription>
              {recommendations.length} prioritized improvement{" "}
              {recommendations.length === 1 ? "item" : "items"}
            </CardDescription>
          </div>
          {capabilities.canEditImprovementPlan && recommendations.length > 0 ? (
            <Link
              href={`/clients/${clientId}/improvement-plan`}
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Improvement Plan
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.length === 0 ? (
          assessmentsCompleted === 0 ? (
            <TpEmptyState
              icon={Lightbulb}
              title="No opportunities yet"
              message="Complete an assessment to generate prioritized recommendations for this client."
              actionLabel="Start assessment"
              actionHref={clientTechnologyProfilePath(clientId)}
            />
          ) : (
            <TpEmptyState
              icon={Lightbulb}
              title="All caught up"
              message="No open recommendations right now. Start an Improvement Plan or schedule a reassessment when priorities shift."
              positive
              actionLabel={
                capabilities.canEditImprovementPlan ? "Open Improvement Plan" : undefined
              }
              actionHref={
                capabilities.canEditImprovementPlan
                  ? `/clients/${clientId}/improvement-plan`
                  : undefined
              }
            />
          )
        ) : (
          visible.map((recommendation) => (
            <div
              key={recommendation.id}
              className="rounded-lg border border-border/60 p-4 text-sm"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="font-semibold">{recommendation.title}</p>
                <Badge variant={PRIORITY_BADGE[recommendation.priority]}>
                  {PRIORITY_LABELS[recommendation.priority]}
                </Badge>
              </div>
              {recommendation.businessImpact ? (
                <p className="mb-2 text-muted-foreground">{recommendation.businessImpact}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {recommendation.categoryName} · +{recommendation.estimatedImpactPoints} pts ·{" "}
                {RECOMMENDATION_STATUS_LABELS[recommendation.status]}
                {!recommendation.triggeredInLatestAssessment ? (
                  <> · Not triggered in latest assessment</>
                ) : null}
                {recommendation.isRecurrence ? <> · Recurrence</> : null}
              </p>
              <Link
                href={`/assessments/${recommendation.latestAssessmentId}/results`}
                className={buttonClassName({
                  variant: "link",
                  size: "sm",
                  className: "mt-2 h-auto p-0",
                })}
              >
                View in assessment
              </Link>
            </div>
          ))
        )}
        {recommendations.length > MAX_OPPORTUNITIES ? (
          <p className="text-xs text-muted-foreground">
            Showing top {MAX_OPPORTUNITIES} of {recommendations.length} open opportunities.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
