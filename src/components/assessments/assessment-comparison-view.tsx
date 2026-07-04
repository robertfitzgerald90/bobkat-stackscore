"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReportDeltaSuccess,
  ReportMetricCard,
  ReportMetricGrid,
  ReportPrintActions,
  ReportSection,
  ReportShell,
  ReportTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/reports";
import type { AssessmentComparison } from "@/lib/assessments/comparison";
import { formatAssessmentCompletionDate } from "@/lib/assessments/display";
import { clientWorkspaceAssessmentsPath } from "@/lib/clients/paths";
import {
  BACK_TO_ASSESSMENTS,
  TECHNOLOGY_MATURITY_PROFILE_SHORT,
  TECHNOLOGY_PILLARS_LABEL,
} from "@/lib/technology-maturity/labels";
import { PRIORITY_LABELS } from "@/lib/display";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type AssessmentComparisonViewProps = {
  clientId: string;
  comparison: AssessmentComparison;
};

export function AssessmentComparisonView({
  clientId,
  comparison,
}: AssessmentComparisonViewProps) {
  const [showQuestionChanges, setShowQuestionChanges] = useState(false);

  return (
    <ReportShell>
      <ReportPrintActions
        clientName={comparison.clientName}
        title="Assessment Comparison"
        description={`${comparison.previous.assessmentName} → ${comparison.current.assessmentName}`}
        printLabel="Export Comparison Report"
        backHref={clientWorkspaceAssessmentsPath(clientId)}
        backLabel={BACK_TO_ASSESSMENTS}
        extraActions={
          <Link
            href={`/clients/${clientId}/assessments/compare`}
            className={buttonClassName({ variant: "outline", className: "w-full sm:w-auto" })}
          >
            Change Selection
          </Link>
        }
      />

      <ReportSection title="Executive Summary">
        <p className="text-sm leading-relaxed text-foreground">{comparison.executiveSummary}</p>
      </ReportSection>

      <ReportMetricGrid columns={4}>
        <ReportMetricCard
          label="Previous StackScore"
          value={String(comparison.previous.overallScore)}
          subtitle={formatAssessmentCompletionDate(comparison.previous.completedAt)}
        />
        <ReportMetricCard
          label="Current StackScore"
          value={String(comparison.current.overallScore)}
          subtitle={formatAssessmentCompletionDate(comparison.current.completedAt)}
          highlight
        />
        <ReportMetricCard
          label="Net Change"
          value={`${comparison.scoreChange > 0 ? "+" : ""}${comparison.scoreChange}`}
          subtitle={`Overall ${TECHNOLOGY_MATURITY_PROFILE_SHORT} movement`}
          tone={
            comparison.scoreChange > 0
              ? "positive"
              : comparison.scoreChange < 0
                ? "negative"
                : "neutral"
          }
        />
        <ReportMetricCard
          label="Maturity"
          value={comparison.current.maturityTierLabel}
          subtitle={
            comparison.maturityChanged
              ? `${comparison.previous.maturityTierLabel} → ${comparison.current.maturityTierLabel}`
              : "Unchanged maturity tier"
          }
        />
      </ReportMetricGrid>

      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <AssessmentDetailCard
            label="Previous"
            name={comparison.previous.assessmentName}
            completedAt={comparison.previous.completedAt}
            score={comparison.previous.overallScore}
            maturity={comparison.previous.maturityTierLabel}
            assessor={comparison.previous.assessorName}
          />
          <AssessmentDetailCard
            label="Current"
            name={comparison.current.assessmentName}
            completedAt={comparison.current.completedAt}
            score={comparison.current.overallScore}
            maturity={comparison.current.maturityTierLabel}
            assessor={comparison.current.assessorName}
            highlight
          />
        </CardContent>
      </Card>

      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Category Comparison</CardTitle>
          <CardDescription>{TECHNOLOGY_PILLARS_LABEL} with StackScore movement</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportTable>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Previous</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparison.categoryComparisons.map((row) => (
                <TableRow key={row.categoryCode}>
                  <TableCell className="font-medium">{row.categoryName}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.previousScore ?? "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      row.currentScore !== null && getScoreTextColorClass(row.currentScore),
                    )}
                  >
                    {row.currentScore ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.change !== null ? (
                      <ReportDeltaSuccess change={row.change} compact />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <TrendBadge trend={row.trend} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ReportTable>
        </CardContent>
      </Card>

      <RecommendationSection
        title="New Recommendations"
        description="Issues identified in the current assessment that were not present previously."
        items={comparison.recommendations.newRecommendations}
        emptyMessage="No new recommendations in the current assessment."
      />

      <RecommendationSection
        title="Resolved Recommendations"
        description="Prior recommendations marked completed."
        items={comparison.recommendations.resolvedRecommendations}
        emptyMessage="No recommendations were resolved between these assessments."
        positive
      />

      <RecommendationSection
        title="Still Open"
        description="Recommendations triggered in the current assessment that remain active."
        items={comparison.recommendations.stillOpenRecommendations}
        emptyMessage="No open recommendations remain from the current assessment."
      />

      <RecommendationSection
        title="No Longer Triggered"
        description="Previously flagged items that did not fire in the latest assessment but remain open."
        items={comparison.recommendations.noLongerTriggeredRecommendations}
        emptyMessage="All previously open items were still triggered in the current assessment."
      />

      <RecommendationSection
        title="Critical / High — Still Unresolved"
        description="Highest-priority opportunities that remain active after the current assessment."
        items={comparison.recommendations.criticalHighUnresolved}
        emptyMessage="No critical or high-priority items remain unresolved."
        alert
      />

      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Question-Level Changes</CardTitle>
            <CardDescription>
              Notable answer changes between assessments ({comparison.questionChanges.length})
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={() => setShowQuestionChanges((open) => !open)}
            className={buttonClassName({ variant: "outline", size: "sm", className: "print:hidden" })}
          >
            {showQuestionChanges ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show
              </>
            )}
          </button>
        </CardHeader>
        {(showQuestionChanges || comparison.questionChanges.length <= 8) && (
          <CardContent>
            {comparison.questionChanges.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No answer changes were recorded between these assessments.
              </p>
            ) : (
              <ReportTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead className="text-right">Score Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.questionChanges.map((change) => (
                    <TableRow key={change.questionId}>
                      <TableCell>
                        <p className="font-medium">{change.questionText}</p>
                        <p className="text-xs text-muted-foreground">{change.questionCode}</p>
                      </TableCell>
                      <TableCell>{change.categoryName}</TableCell>
                      <TableCell>{change.previousAnswer}</TableCell>
                      <TableCell>{change.currentAnswer}</TableCell>
                      <TableCell className="text-right">
                        <ReportDeltaSuccess change={change.scoreImpact} compact />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </ReportTable>
            )}
          </CardContent>
        )}
      </Card>
    </ReportShell>
  );
}

function AssessmentDetailCard({
  label,
  name,
  completedAt,
  score,
  maturity,
  assessor,
  highlight = false,
}: {
  label: string;
  name: string;
  completedAt: string | null;
  score: number;
  maturity: string;
  assessor: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        highlight && "border-primary/20 bg-primary/5",
      )}
    >
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{name}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Completed {formatAssessmentCompletionDate(completedAt)}
      </p>
      <p className={cn("mt-2 text-3xl font-bold tabular-nums", getScoreTextColorClass(score))}>
        {score}
      </p>
      <Badge variant="outline" className="mt-2">
        {maturity}
      </Badge>
      {assessor ? (
        <p className="mt-3 text-sm text-muted-foreground">Consultant: {assessor}</p>
      ) : null}
    </div>
  );
}

function RecommendationSection({
  title,
  description,
  items,
  emptyMessage,
  positive = false,
  alert = false,
}: {
  title: string;
  description: string;
  items: AssessmentComparison["recommendations"]["newRecommendations"];
  emptyMessage: string;
  positive?: boolean;
  alert?: boolean;
}) {
  return (
    <Card
      className={cn(
        "stat-card",
        alert && items.length > 0 && "border-destructive/30",
        positive && items.length > 0 && "border-success/30",
      )}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border/60 p-4 text-sm">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-semibold">{item.title}</p>
                <Badge variant={item.priority === "critical" ? "destructive" : "outline"}>
                  {PRIORITY_LABELS[item.priority]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.categoryName} · {RECOMMENDATION_STATUS_LABELS[item.status]}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function TrendBadge({ trend }: { trend: "improved" | "declined" | "unchanged" | "not_assessed" }) {
  if (trend === "improved") {
    return <Badge className="bg-success/15 text-success hover:bg-success/15">Improved</Badge>;
  }
  if (trend === "declined") {
    return <Badge variant="destructive">Declined</Badge>;
  }
  if (trend === "unchanged") {
    return <Badge variant="outline">No Change</Badge>;
  }
  return <Badge variant="secondary">Not Assessed</Badge>;
}
