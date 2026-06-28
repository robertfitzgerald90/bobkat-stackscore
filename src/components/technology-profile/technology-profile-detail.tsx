"use client";

import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart";
import { TpBusinessSnapshot } from "@/components/technology-profile/tp-business-snapshot";
import { TpCategoryScores } from "@/components/technology-profile/tp-category-scores";
import { TpHeroSummary } from "@/components/technology-profile/tp-hero-summary";
import { TpOpenOpportunities } from "@/components/technology-profile/tp-open-opportunities";
import { TpRecentProgress } from "@/components/technology-profile/tp-recent-progress";
import { TpReportsDocuments } from "@/components/technology-profile/tp-reports-documents";
import { TpRoadmapPreview } from "@/components/technology-profile/tp-roadmap-preview";
import { TpTechnologyJourney } from "@/components/technology-profile/tp-technology-journey";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPriority } from "@/lib/display";
import { formatProjectStatus } from "@/lib/projects";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

type TechnologyProfileDetailViewProps = {
  detail: TechnologyProfileDetail;
};

export function TechnologyProfileDetailView({ detail }: TechnologyProfileDetailViewProps) {
  const { profile, scoreTrend, audience } = detail;
  const showInternalSections = audience === "internal";

  return (
    <div className="space-y-8">
      <TpHeroSummary detail={detail} />

      <TpBusinessSnapshot
        clientId={profile.clientId}
        snapshot={detail.businessSnapshot}
        capabilities={detail.capabilities}
      />

      <TpCategoryScores insights={detail.categoryInsights} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TpTechnologyJourney journey={detail.journey} journeyScores={detail.journeyScores} />

        <Card className="stat-card h-full">
          <CardHeader>
            <CardTitle>Score History</CardTitle>
            <CardDescription>Historical StackScore from completed assessments</CardDescription>
          </CardHeader>
          <CardContent>
            {scoreTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Complete an assessment to begin tracking score history.
              </p>
            ) : (
              <ScoreTrendChart data={scoreTrend} />
            )}
          </CardContent>
        </Card>
      </div>

      {showInternalSections ? (
        <>
          <TpOpenOpportunities
            clientId={profile.clientId}
            recommendations={detail.openRecommendations}
            capabilities={detail.capabilities}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <TpRecentProgress projects={detail.completedProjects} />
            <TpRoadmapPreview
              clientId={profile.clientId}
              phases={detail.roadmapPreview}
              activeTip={detail.activeTip}
              canEditImprovementPlan={detail.capabilities.canEditImprovementPlan}
            />
          </div>
        </>
      ) : null}

      {detail.activeProjects.length > 0 ? (
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Active Projects
            </CardTitle>
            <CardDescription>{detail.activeProjects.length} in progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.activeProjects.map((project) => (
              <div key={project.id} className="rounded-lg border border-border/60 p-4 text-sm">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{project.title}</p>
                  <Badge variant="secondary">{formatProjectStatus(project.status)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPriority(project.priority)}
                  {project.estimatedImpactPoints !== null
                    ? ` · +${project.estimatedImpactPoints} pts`
                    : ""}
                </p>
                <Link
                  href={`/projects?selected=${project.id}`}
                  className={buttonClassName({ variant: "link", size: "sm", className: "mt-2 h-auto p-0" })}
                >
                  Open project
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <TpReportsDocuments
        clientId={profile.clientId}
        documents={detail.documents}
        activeTip={detail.activeTip}
      />

      {profile.currentAssessmentId ? (
        <div className="flex justify-end">
          <Link
            href={`/assessments/${profile.currentAssessmentId}/results`}
            className={buttonClassName({ variant: "outline" })}
          >
            View current assessment results
          </Link>
        </div>
      ) : null}
    </div>
  );
}
