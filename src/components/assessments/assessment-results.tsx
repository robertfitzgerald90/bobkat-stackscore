"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FileDown,
  FolderKanban,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RECOMMENDATION_STATUS_LABELS,
  type AssessmentResultsSummary,
  type RecommendationSummary,
} from "@/lib/assessments/results-summary";
import { formatAssessmentCompletionDate } from "@/lib/assessments/display";
import { formatPriority, PRIORITY_LABELS } from "@/lib/display";
import { calculateProjectionImpacts } from "@/lib/recommendations";
import { calculateProjectedScore, RATING_LABELS } from "@/lib/scoring";
import { getScoreBarColorClass, getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { Priority, Rating, RecommendationStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { sanitizeFilename } from "@/lib/pdf/types";
import { toast } from "sonner";

const RATING_VARIANT: Record<
  Rating,
  "success" | "default" | "secondary" | "warning" | "destructive"
> = {
  exceptional: "success",
  strong: "success",
  stable: "secondary",
  at_risk: "warning",
  critical: "destructive",
};

const ALL_STATUSES: RecommendationStatus[] = [
  "open",
  "accepted",
  "in_progress",
  "completed",
  "deferred",
  "declined",
  "archived",
];

type AssessmentResultsProps = {
  assessmentId: string;
  clientId: string;
  clientName: string;
  assessmentName: string;
  completedAt: string | null;
  executiveSummary: string | null;
  summary: AssessmentResultsSummary;
  hasImprovementSummary?: boolean;
};

export function AssessmentResults({
  assessmentId,
  clientId,
  clientName,
  assessmentName,
  completedAt,
  executiveSummary,
  summary: initialSummary,
  hasImprovementSummary = false,
}: AssessmentResultsProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [exporting, setExporting] = useState(false);

  function recalculateSummary(recommendations: RecommendationSummary[]) {
    const overallScore = summary.overallScore;
    const actionable = recommendations.filter(
      (r) => r.status !== "completed" && r.status !== "declined",
    );

    const projectionImpact = calculateProjectionImpacts(
      actionable.map((r) => ({
        templateCode: r.id,
        consolidationGroupId: r.consolidationGroupId,
        title: r.title,
        description: r.description,
        businessImpact: r.businessImpact,
        suggestedService: r.suggestedService ?? "",
        priority: r.priority,
        estimatedImpactPoints: r.estimatedImpactPoints,
        categoryName: r.categoryName,
        isConsolidated: !!r.consolidationGroupId,
      })),
    );

    const projectedScore = calculateProjectedScore(overallScore, [projectionImpact]);
    const priorityOrder: Priority[] = ["critical", "high", "medium", "low"];

    const immediateActions = recommendations
      .filter(
        (r) =>
          (r.status === "open" || r.status === "accepted" || r.status === "in_progress") &&
          (r.priority === "critical" || r.priority === "high"),
      )
      .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority))
      .slice(0, 5);

    setSummary((prev) => ({
      ...prev,
      recommendations,
      openRecommendationsCount: recommendations.filter((r) => r.status === "open").length,
      projectedScore,
      immediateActions,
    }));
  }

  async function updateRecommendationStatus(
    recommendationId: string,
    status: RecommendationStatus,
  ) {
    const response = await fetch(`/api/v1/recommendations/${recommendationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      toast.error("Failed to update recommendation status");
      return;
    }

    const updated = await response.json();
    const nextRecommendations = summary.recommendations.map((recommendation) =>
      recommendation.id === recommendationId
        ? {
            ...recommendation,
            status: updated.status as RecommendationStatus,
            hasProject: recommendation.hasProject,
          }
        : recommendation,
    );
    recalculateSummary(nextRecommendations);
    toast.success("Recommendation status updated");
  }

  async function convertToProject(recommendation: RecommendationSummary) {
    const response = await fetch(`/api/v1/clients/${clientId}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recommendationId: recommendation.id,
        title: recommendation.title,
        description: recommendation.description,
        priority: recommendation.priority,
        categoryId: recommendation.categoryId,
        estimatedImpactPoints: recommendation.estimatedImpactPoints,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Failed to create project");
      return;
    }

    const project = await response.json();
    const nextRecommendations = summary.recommendations.map((item) =>
      item.id === recommendation.id
        ? { ...item, status: "accepted" as RecommendationStatus, hasProject: true, projectId: project.id }
        : item,
    );
    recalculateSummary(nextRecommendations);
    toast.success("Project created from recommendation");
  }

  async function exportPdf() {
    setExporting(true);
    try {
      const response = await fetch(`/api/v1/assessments/${assessmentId}/export/pdf`);

      if (!response.ok) {
        toast.error("Failed to generate PDF report");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFilename(clientName)}-stackscore-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF report downloaded");
    } catch {
      toast.error("Failed to generate PDF report");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{clientName}</p>
          <h2 className="page-title">{assessmentName}</h2>
          {completedAt ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Completed {formatAssessmentCompletionDate(completedAt)}
            </p>
          ) : null}
        </div>
        <div className="action-bar">
          {hasImprovementSummary ? (
            <Link
              href={`/assessments/${assessmentId}/improvement`}
              className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              <span className="sm:hidden">Improvement</span>
              <span className="hidden sm:inline">Improvement Summary</span>
            </Link>
          ) : null}
          <Button onClick={exportPdf} disabled={exporting} className="w-full sm:w-auto">
            <FileDown className="mr-2 h-4 w-4" />
            <span className="sm:hidden">{exporting ? "Exporting..." : "Export PDF"}</span>
            <span className="hidden sm:inline">
              {exporting ? "Generating PDF..." : "Export PDF"}
            </span>
          </Button>
          <Link
            href={`/assessments/${assessmentId}`}
            className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
          >
            View Assessment
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Overall StackScore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-4xl font-bold tabular-nums",
                getScoreTextColorClass(summary.overallScore),
              )}
            >
              {summary.overallScore}
            </p>
            <Badge variant={RATING_VARIANT[summary.overallRating]} className="mt-2">
              {summary.overallRatingLabel}
            </Badge>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ArrowUpRight className="h-4 w-4" />
              Projected Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-4xl font-bold tabular-nums",
                getScoreTextColorClass(summary.projectedScore),
              )}
            >
              {summary.projectedScore}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              If open recommendations are completed
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tabular-nums text-destructive">
              {summary.criticalFindingsCount}
            </p>
            {summary.hasCriticalExposure ? (
              <p className="mt-2 text-sm text-destructive">Critical exposure detected</p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No critical flags</p>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tabular-nums">{summary.openRecommendationsCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {summary.recommendations.length} total recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {summary.hasCriticalExposure ? (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Critical Exposure Warning</p>
              <p className="text-sm text-muted-foreground">
                Critical security or recovery gaps were identified. Immediate remediation is
                recommended despite the overall score.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Top Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topStrengths.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between gap-2">
                <span className="text-sm">{category.categoryName}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={RATING_VARIANT[category.rating]} className="text-xs">
                    {RATING_LABELS[category.rating]}
                  </Badge>
                  <span className="font-semibold tabular-nums">
                    {Math.round(category.percentScore)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Top Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topRisks.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between gap-2">
                <span className="text-sm">{category.categoryName}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={RATING_VARIANT[category.rating]} className="text-xs">
                    {RATING_LABELS[category.rating]}
                  </Badge>
                  <span className="font-semibold tabular-nums">
                    {Math.round(category.percentScore)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Immediate Actions</CardTitle>
            <CardDescription>High-priority open recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.immediateActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No immediate actions required.</p>
            ) : (
              summary.immediateActions.map((action) => (
                <div key={action.id} className="rounded-md border p-2 text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge
                      variant={action.priority === "critical" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {formatPriority(action.priority)}
                    </Badge>
                  </div>
                  <p className="leading-snug">{action.title}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Scores</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {summary.categoryScores.map((category) => (
            <div key={category.categoryId} className="space-y-2 rounded-md border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{category.categoryName}</p>
                <Badge variant={RATING_VARIANT[category.rating]}>
                  {RATING_LABELS[category.rating]}
                </Badge>
              </div>
              <p className="text-2xl font-semibold tabular-nums">
                {Math.round(category.percentScore)}%
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", getScoreBarColorClass(category.percentScore))}
                  style={{ width: `${category.percentScore}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Track status and convert recommendations into client projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.recommendations.map((recommendation) => (
            <div key={recommendation.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{recommendation.title}</p>
                    <Badge
                      variant={
                        recommendation.priority === "critical" ? "destructive" : "secondary"
                      }
                    >
                      {PRIORITY_LABELS[recommendation.priority]}
                    </Badge>
                    {recommendation.consolidationGroupId ? (
                      <Badge variant="outline">Consolidated</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendation.businessImpact}</p>
                  {recommendation.suggestedService ? (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Service:</span>{" "}
                      {recommendation.suggestedService}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {recommendation.categoryName} · +{recommendation.estimatedImpactPoints} pts
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Select
                    value={recommendation.status}
                    items={RECOMMENDATION_STATUS_LABELS}
                    onValueChange={(value) =>
                      updateRecommendationStatus(
                        recommendation.id,
                        (value ?? recommendation.status) as RecommendationStatus,
                      )
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {RECOMMENDATION_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {recommendation.hasProject && recommendation.projectId ? (
                    <Link
                      href={`/projects?selected=${recommendation.projectId}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <FolderKanban className="mr-2 h-4 w-4" />
                      View Project
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => convertToProject(recommendation)}
                      disabled={
                        recommendation.status === "completed" ||
                        recommendation.status === "declined"
                      }
                    >
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Convert to Project
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {executiveSummary ? (
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{executiveSummary}</pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
