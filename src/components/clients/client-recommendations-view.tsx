"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProjectFromRecommendationButton } from "@/components/recommendations/create-project-button";
import { RecommendationPillarHint } from "@/components/technology-maturity/recommendation-pillar-hint";
import { PRIORITY_BADGE } from "@/components/technology-profile/tp-constants";
import { WorkspaceSectionHeader } from "@/components/client-workspace/workspace-section-header";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { conciseFocusTitle } from "@/lib/client-workspace";
import { formatDisplayDate, PRIORITY_LABELS } from "@/lib/display";
import type { ClientRecommendationFilters, ClientRecommendationRow } from "@/lib/recommendations/client-list";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import type { Priority, RecommendationStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: RecommendationStatus[] = [
  "open",
  "accepted",
  "in_progress",
  "deferred",
];

const PRIORITY_OPTIONS: Priority[] = ["critical", "high", "medium", "low"];

type ClientRecommendationsViewProps = {
  clientId: string;
  clientName: string;
  recommendations: ClientRecommendationRow[];
  filters: ClientRecommendationFilters;
};

function filterSelectClassName() {
  return "h-9 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-auto";
}

export function ClientRecommendationsView({
  clientId,
  clientName,
  recommendations,
  filters,
}: ClientRecommendationsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  useEffect(() => {
    if (!selectedId) return;
    const target = document.getElementById(`rec-${selectedId}`);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [selectedId, recommendations]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    if (filters.pillarCode) params.set("pillar", filters.pillarCode);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.status) params.set("status", filters.status);
    if (filters.hasProject) params.set("project", filters.hasProject);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const query = params.toString();
    router.push(`/clients/${clientId}/recommendations${query ? `?${query}` : ""}`);
  }

  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceSectionHeader
        title="Recommendations"
        description={`${clientName} — client-level improvement opportunities across assessments`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4" />
            Filters
          </CardTitle>
          <CardDescription>Narrow by pillar, priority, status, or project linkage</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <select
            className={filterSelectClassName()}
            value={filters.pillarCode ?? ""}
            onChange={(event) => updateFilter("pillar", event.target.value)}
            aria-label="Filter by technology pillar"
          >
            <option value="">All pillars</option>
            {TECHNOLOGY_PILLARS.map((pillar) => (
              <option key={pillar.code} value={pillar.code}>
                {pillar.name}
              </option>
            ))}
          </select>
          <select
            className={filterSelectClassName()}
            value={filters.priority ?? ""}
            onChange={(event) => updateFilter("priority", event.target.value)}
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
          <select
            className={filterSelectClassName()}
            value={filters.status ?? ""}
            onChange={(event) => updateFilter("status", event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All active statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {RECOMMENDATION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <select
            className={filterSelectClassName()}
            value={filters.hasProject ?? ""}
            onChange={(event) => updateFilter("project", event.target.value)}
            aria-label="Filter by project linkage"
          >
            <option value="">All recommendations</option>
            <option value="yes">Has project</option>
            <option value="no">No project</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {recommendations.length} recommendation{recommendations.length === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>
            One active record per capability — reassessments update existing items instead of
            duplicating them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recommendations match the current filters.
            </p>
          ) : (
            recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                id={`rec-${recommendation.id}`}
                className={cn(
                  "min-w-0 scroll-mt-24 rounded-lg border border-border/60 p-4 text-sm",
                  selectedId === recommendation.id && "border-primary/40 bg-primary/5",
                )}
              >
                <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 break-words font-semibold">
                        {conciseFocusTitle(recommendation.title)}
                      </p>
                      <Badge variant={PRIORITY_BADGE[recommendation.priority]}>
                        {PRIORITY_LABELS[recommendation.priority]}
                      </Badge>
                      <Badge variant="outline">
                        {RECOMMENDATION_STATUS_LABELS[recommendation.status]}
                      </Badge>
                      {recommendation.isRecurrence ? (
                        <Badge variant="secondary">Recurrence</Badge>
                      ) : null}
                      {!recommendation.triggeredInLatestAssessment ? (
                        <Badge variant="outline" className="border-amber-500 text-amber-700">
                          Needs review
                        </Badge>
                      ) : null}
                    </div>
                    <RecommendationPillarHint
                      categoryCode={recommendation.categoryCode}
                      className="space-y-1"
                    />
                  </div>
                  <CreateProjectFromRecommendationButton
                    clientId={clientId}
                    recommendation={recommendation}
                    className="w-full shrink-0 sm:w-auto sm:max-w-xs"
                  />
                </div>

                {recommendation.businessImpact ? (
                  <p className="mb-3 text-muted-foreground">{recommendation.businessImpact}</p>
                ) : null}

                <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <dt className="font-medium text-foreground">Estimated maturity impact</dt>
                    <dd>+{recommendation.estimatedImpactPoints} StackScore points</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Created</dt>
                    <dd>{formatDisplayDate(recommendation.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Last triggered</dt>
                    <dd>{formatDisplayDate(recommendation.lastTriggeredAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Latest assessment</dt>
                    <dd>
                      {recommendation.latestAssessmentName ? (
                        <Link
                          href={`/assessments/${recommendation.latestAssessmentId}/results`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {recommendation.latestAssessmentName}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  {recommendation.latestTriggerReason ? (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <dt className="font-medium text-foreground">Trigger evidence</dt>
                      <dd>{recommendation.latestTriggerReason}</dd>
                    </div>
                  ) : null}
                  {recommendation.suggestedService ? (
                    <div>
                      <dt className="font-medium text-foreground">Suggested service</dt>
                      <dd>{recommendation.suggestedService}</dd>
                    </div>
                  ) : null}
                  {!recommendation.triggeredInLatestAssessment ? (
                    <div className="sm:col-span-2 lg:col-span-3">
                      <dt className="font-medium text-foreground">Assessment status</dt>
                      <dd>
                        Not triggered in the latest assessment — may be resolved or needs consultant
                        review.
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
