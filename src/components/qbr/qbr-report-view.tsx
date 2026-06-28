"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Minus,
  Printer,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BRAND } from "@/lib/branding";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { formatDisplayDate, PRIORITY_LABELS } from "@/lib/display";
import type { QbrReportData } from "@/lib/qbr/types";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import {
  JOURNEY_TIMELINE_EVENT_LABELS,
  type JourneyTimelineEvent,
} from "@/lib/technology-profile/timeline";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";
import type { Priority } from "@/generated/prisma/client";

const PRIORITY_BADGE: Record<Priority, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-800 border-orange-200",
  medium: "bg-slate-50 text-slate-700 border-slate-200",
  low: "bg-white text-slate-500 border-slate-200",
};

type QbrReportViewProps = {
  clientId: string;
  data: QbrReportData;
  isEditable?: boolean;
  executiveSummary?: string;
  onExecutiveSummaryChange?: (value: string) => void;
  showActions?: boolean;
};

function ScoreDelta({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
        <ArrowUp className="h-4 w-4" />
        +{value}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-red-700">
        <ArrowDown className="h-4 w-4" />
        {value}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground">
      <Minus className="h-4 w-4" />
      0
    </span>
  );
}

function JourneyEventRow({ event }: { event: JourneyTimelineEvent }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {JOURNEY_TIMELINE_EVENT_LABELS[event.eventType]}
        </p>
        <p className="font-medium">{event.title}</p>
        {event.description ? (
          <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
        ) : null}
      </div>
      <p className="shrink-0 text-sm text-muted-foreground">{event.dateLabel}</p>
    </div>
  );
}

export function QbrReportView({
  clientId,
  data,
  isEditable = false,
  executiveSummary,
  onExecutiveSummaryChange,
  showActions = true,
}: QbrReportViewProps) {
  const [showAllJourney, setShowAllJourney] = useState(false);
  const summaryText = executiveSummary ?? data.executiveSummary;

  const visibleJourneyEvents = useMemo(() => {
    if (showAllJourney) return data.journeyEvents;
    return data.journeyEvents.slice(0, 6);
  }, [data.journeyEvents, showAllJourney]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="qbr-report space-y-6 print:space-y-4">
      {showActions ? (
        <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
          <div className="page-header">
            <p className="text-sm text-muted-foreground">{data.clientName}</p>
            <h2 className="page-title">Quarterly Business Review</h2>
            <p className="page-description">{data.reviewPeriodLabel}</p>
          </div>
          <div className="action-bar">
            <button
              type="button"
              onClick={handlePrint}
              className={buttonClassName({ variant: "outline", className: "w-full sm:w-auto" })}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </button>
            <Link
              href={clientTechnologyProfilePath(clientId)}
              className={buttonClassName({ variant: "ghost", className: "w-full sm:w-auto" })}
            >
              Back to Technology Profile
            </Link>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm print:shadow-none">
        <div className="bg-primary px-8 py-10 text-primary-foreground">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
            Prepared by {BRAND.companyName}
          </p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">Quarterly Business Review</h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-primary-foreground/85">
            What value has BobKat IT delivered this quarter? A business-focused summary of
            technology progress, completed work, and priorities ahead.
          </p>
        </div>

        <div className="space-y-8 px-8 py-8">
          <div className="grid gap-4 border-b pb-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Client</p>
              <p className="mt-1 font-semibold">{data.clientName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Review Period</p>
              <p className="mt-1 font-semibold">{data.reviewPeriodLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Generated</p>
              <p className="mt-1 font-semibold">{data.generatedDateLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Technology Profile
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold",
                  getScoreTextColorClass(data.scoreAtPeriodEnd),
                )}
              >
                {data.scoreAtPeriodEnd ?? "—"}
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h4 className="text-lg font-semibold text-primary">Executive Summary</h4>
            {isEditable && onExecutiveSummaryChange ? (
              <textarea
                className="min-h-28 w-full rounded-lg border bg-background px-3 py-2 text-sm leading-relaxed"
                value={summaryText}
                onChange={(event) => onExecutiveSummaryChange(event.target.value)}
                rows={5}
                placeholder="Summarize the quarter's technology progress in business language…"
              />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">{summaryText}</p>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Technology Profile</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardDescription>Score at Period Start</CardDescription>
                  <CardTitle className="text-3xl">{data.scoreAtPeriodStart ?? "—"}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardDescription>Score at Period End</CardDescription>
                  <CardTitle
                    className={cn("text-3xl", getScoreTextColorClass(data.scoreAtPeriodEnd))}
                  >
                    {data.scoreAtPeriodEnd ?? "—"}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardDescription>Quarter Change</CardDescription>
                  <CardTitle className="text-3xl">
                    <ScoreDelta value={data.scoreChange} />
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            {data.currentMaturityLabel ? (
              <p className="text-sm text-muted-foreground">
                Current maturity tier: <strong>{data.currentMaturityLabel}</strong>
              </p>
            ) : null}
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Technology Journey</h4>
            <CardDescription>
              Key milestones recorded during {data.reviewPeriodLabel}.
            </CardDescription>
            {data.journeyEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No journey milestones were recorded during this review period.
              </p>
            ) : (
              <div className="space-y-3">
                {visibleJourneyEvents.map((event) => (
                  <JourneyEventRow key={event.id} event={event} />
                ))}
                {data.journeyEvents.length > 6 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllJourney((value) => !value)}
                    className={buttonClassName({
                      variant: "ghost",
                      size: "sm",
                      className: "print:hidden",
                    })}
                  >
                    {showAllJourney
                      ? "Show fewer milestones"
                      : `Show all ${data.journeyEvents.length} milestones`}
                  </button>
                ) : null}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Completed Projects</h4>
            {data.completedProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No projects were completed during this review period.
              </p>
            ) : (
              <div className="space-y-3">
                {data.completedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border border-border/60 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                        <div>
                          <p className="font-medium">{project.title}</p>
                          {project.description ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {project.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{formatDisplayDate(project.completedAt)}</p>
                        {project.impactPoints !== null ? (
                          <p className="font-medium text-emerald-700">
                            +{project.impactPoints} impact points
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Technology Progress</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardDescription>Assessments Completed</CardDescription>
                  <CardTitle className="text-3xl">{data.assessmentsCompletedInPeriod}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardDescription>Projects Completed</CardDescription>
                  <CardTitle className="text-3xl">{data.projectsCompletedInPeriod}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <CardDescription>Recommendations Resolved</CardDescription>
                  <CardTitle className="text-3xl">
                    {data.recommendationsResolvedInPeriod}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Category Improvements</h4>
            {data.categoryImprovements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Category score history is not yet available for this review period.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Start</TableHead>
                      <TableHead className="text-right">End</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.categoryImprovements.map((row) => (
                      <TableRow key={row.categoryName}>
                        <TableCell className="font-medium">{row.categoryName}</TableCell>
                        <TableCell className="text-right">{row.previousScore ?? "—"}</TableCell>
                        <TableCell className="text-right">{row.currentScore ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <ScoreDelta value={row.change} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Resolved Recommendations</h4>
            {data.resolvedRecommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recommendations were resolved during this review period.
              </p>
            ) : (
              <div className="space-y-3">
                {data.resolvedRecommendations.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border/60 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant="outline" className={PRIORITY_BADGE[item.priority]}>
                        {PRIORITY_LABELS[item.priority]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.businessImpact}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.categoryName} · Resolved{" "}
                      {item.resolvedAt ? formatDisplayDate(item.resolvedAt) : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Remaining Opportunities</h4>
            {data.remainingOpportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No open improvement opportunities at this time.
              </p>
            ) : (
              <div className="space-y-3">
                {data.remainingOpportunities.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-lg border border-border/60 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant="outline" className={PRIORITY_BADGE[item.priority]}>
                        {PRIORITY_LABELS[item.priority]}
                      </Badge>
                      <Badge variant="outline">
                        {RECOMMENDATION_STATUS_LABELS[item.status]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.businessImpact}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Current Roadmap</h4>
            {data.roadmapPhases.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active technology roadmap phases are configured yet.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {data.roadmapPhases.map((phase) => (
                  <Card key={`${phase.phaseName}-${phase.timeframe}`} className="stat-card">
                    <CardHeader>
                      <CardDescription>{phase.timeframe}</CardDescription>
                      <CardTitle className="text-lg">{phase.phaseName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {phase.initiativeCount} initiative
                        {phase.initiativeCount === 1 ? "" : "s"}
                      </p>
                      {phase.summary ? (
                        <p className="mt-2 text-sm">{phase.summary}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h4 className="text-lg font-semibold text-primary">Business Goal Progress</h4>
            {data.businessGoalLabel ? (
              <p className="text-sm font-medium">{data.businessGoalLabel}</p>
            ) : null}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {data.businessGoalProgress}
            </p>
          </section>

          <section className="space-y-3">
            <h4 className="text-lg font-semibold text-primary">Technology Vision Progress</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">{data.visionProgress}</p>
          </section>

          <section className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Next Quarter Priorities</h4>
            {data.nextQuarterPriorities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Priorities will be confirmed during the next planning cycle.
              </p>
            ) : (
              <ol className="space-y-2">
                {data.nextQuarterPriorities.map((priority, index) => (
                  <li
                    key={`${index}-${priority}`}
                    className="flex items-start gap-3 rounded-lg border border-border/60 p-3"
                  >
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">{priority}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <div className="border-t pt-6 text-center text-xs text-muted-foreground print:pt-4">
            <TrendingUp className="mx-auto mb-2 h-4 w-4" />
            Generated by {BRAND.productName} · {BRAND.companyName}
          </div>
        </div>
      </div>
    </div>
  );
}
