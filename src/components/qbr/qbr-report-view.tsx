"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReportBody,
  ReportCover,
  ReportDataCard,
  ReportDelta,
  ReportDocument,
  ReportEmptyState,
  ReportExecutiveSummary,
  ReportFooter,
  ReportMetaGrid,
  ReportMetricCard,
  ReportMetricGrid,
  ReportPagination,
  ReportPrintActions,
  ReportPriorityBadge,
  ReportSection,
  ReportShell,
  ReportTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/reports";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { formatDisplayDate } from "@/lib/display";
import type { QbrReportData } from "@/lib/qbr/types";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import {
  JOURNEY_TIMELINE_EVENT_LABELS,
  type JourneyTimelineEvent,
} from "@/lib/technology-profile/timeline";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";

type QbrReportViewProps = {
  clientId: string;
  data: QbrReportData;
  isEditable?: boolean;
  executiveSummary?: string;
  onExecutiveSummaryChange?: (value: string) => void;
  showActions?: boolean;
};

function JourneyEventRow({ event }: { event: JourneyTimelineEvent }) {
  return (
    <ReportDataCard
      title={
        <>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {JOURNEY_TIMELINE_EVENT_LABELS[event.eventType]}
          </p>
          <p className="font-medium">{event.title}</p>
        </>
      }
      description={event.description}
      aside={event.dateLabel}
    />
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

  return (
    <ReportShell>
      {showActions ? (
        <ReportPrintActions
          clientName={data.clientName}
          title="Quarterly Business Review"
          description={data.reviewPeriodLabel}
          backHref={clientTechnologyProfilePath(clientId)}
        />
      ) : null}

      <ReportDocument>
        <ReportCover reportType="quarterly_business_review" />

        <ReportBody>
          <ReportMetaGrid
            items={[
              { label: "Client", value: data.clientName },
              { label: "Review Period", value: data.reviewPeriodLabel },
              { label: "Generated", value: data.generatedDateLabel },
              {
                label: "Technology Profile",
                value: data.scoreAtPeriodEnd ?? "—",
                emphasis: true,
                valueClassName: getScoreTextColorClass(data.scoreAtPeriodEnd),
              },
            ]}
          />

          <ReportSection title="Executive Summary">
            <ReportExecutiveSummary
              value={summaryText}
              isEditable={isEditable}
              onChange={onExecutiveSummaryChange}
              placeholder="Summarize the quarter's technology progress in business language…"
            />
          </ReportSection>

          <ReportSection title="Technology Profile">
            <ReportMetricGrid>
              <ReportMetricCard
                label="Score at Period Start"
                value={data.scoreAtPeriodStart ?? "—"}
              />
              <ReportMetricCard
                label="Score at Period End"
                value={data.scoreAtPeriodEnd ?? "—"}
                valueClassName={getScoreTextColorClass(data.scoreAtPeriodEnd)}
              />
              <ReportMetricCard label="Quarter Change" value={<ReportDelta value={data.scoreChange} />} />
            </ReportMetricGrid>
            {data.currentMaturityLabel ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Current maturity tier: <strong>{data.currentMaturityLabel}</strong>
              </p>
            ) : null}
          </ReportSection>

          <ReportSection
            title="Technology Journey"
            subtitle={`Key milestones recorded during ${data.reviewPeriodLabel}.`}
          >
            {data.journeyEvents.length === 0 ? (
              <ReportEmptyState>
                No journey milestones were recorded during this review period.
              </ReportEmptyState>
            ) : (
              <div className="space-y-3">
                {visibleJourneyEvents.map((event) => (
                  <JourneyEventRow key={event.id} event={event} />
                ))}
                <ReportPagination
                  totalCount={data.journeyEvents.length}
                  visibleCount={6}
                  expanded={showAllJourney}
                  onToggle={() => setShowAllJourney((value) => !value)}
                  itemLabel="milestones"
                />
              </div>
            )}
          </ReportSection>

          <ReportSection title="Completed Projects">
            {data.completedProjects.length === 0 ? (
              <ReportEmptyState>
                No projects were completed during this review period.
              </ReportEmptyState>
            ) : (
              <div className="space-y-3">
                {data.completedProjects.map((project) => (
                  <ReportDataCard
                    key={project.id}
                    icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    title={project.title}
                    description={project.description}
                    aside={
                      <>
                        <p>{formatDisplayDate(project.completedAt)}</p>
                        {project.impactPoints !== null ? (
                          <p className="font-medium text-emerald-700">
                            +{project.impactPoints} impact points
                          </p>
                        ) : null}
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </ReportSection>

          <ReportSection title="Technology Progress">
            <ReportMetricGrid>
              <ReportMetricCard
                label="Assessments Completed"
                value={data.assessmentsCompletedInPeriod}
              />
              <ReportMetricCard
                label="Projects Completed"
                value={data.projectsCompletedInPeriod}
              />
              <ReportMetricCard
                label="Recommendations Resolved"
                value={data.recommendationsResolvedInPeriod}
              />
            </ReportMetricGrid>
          </ReportSection>

          <ReportSection title="Category Improvements">
            {data.categoryImprovements.length === 0 ? (
              <ReportEmptyState>
                Category score history is not yet available for this review period.
              </ReportEmptyState>
            ) : (
              <ReportTable>
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
                        <ReportDelta value={row.change} compact />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </ReportTable>
            )}
          </ReportSection>

          <ReportSection title="Resolved Recommendations">
            {data.resolvedRecommendations.length === 0 ? (
              <ReportEmptyState>
                No recommendations were resolved during this review period.
              </ReportEmptyState>
            ) : (
              <div className="space-y-3">
                {data.resolvedRecommendations.map((item) => (
                  <ReportDataCard
                    key={item.id}
                    title={
                      <>
                        <p className="font-medium">{item.title}</p>
                        <ReportPriorityBadge priority={item.priority} />
                      </>
                    }
                    description={item.businessImpact}
                    meta={`${item.categoryName} · Resolved ${
                      item.resolvedAt ? formatDisplayDate(item.resolvedAt) : "—"
                    }`}
                  />
                ))}
              </div>
            )}
          </ReportSection>

          <ReportSection title="Remaining Opportunities">
            {data.remainingOpportunities.length === 0 ? (
              <ReportEmptyState>No open improvement opportunities at this time.</ReportEmptyState>
            ) : (
              <div className="space-y-3">
                {data.remainingOpportunities.slice(0, 8).map((item) => (
                  <ReportDataCard
                    key={item.id}
                    title={
                      <>
                        <p className="font-medium">{item.title}</p>
                        <ReportPriorityBadge priority={item.priority} />
                        <Badge variant="outline">
                          {RECOMMENDATION_STATUS_LABELS[item.status]}
                        </Badge>
                      </>
                    }
                    description={item.businessImpact}
                  />
                ))}
              </div>
            )}
          </ReportSection>

          <ReportSection title="Current Roadmap">
            {data.roadmapPhases.length === 0 ? (
              <ReportEmptyState>
                No active technology roadmap phases are configured yet.
              </ReportEmptyState>
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
                      {phase.summary ? <p className="mt-2 text-sm">{phase.summary}</p> : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ReportSection>

          <ReportSection title="Business Goal Progress">
            {data.businessGoalLabel ? (
              <p className="mb-2 text-sm font-medium">{data.businessGoalLabel}</p>
            ) : null}
            <ReportExecutiveSummary value={data.businessGoalProgress} />
          </ReportSection>

          <ReportSection title="Technology Vision Progress">
            <ReportExecutiveSummary value={data.visionProgress} />
          </ReportSection>

          <ReportSection title="Next Quarter Priorities">
            {data.nextQuarterPriorities.length === 0 ? (
              <ReportEmptyState>
                Priorities will be confirmed during the next planning cycle.
              </ReportEmptyState>
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
          </ReportSection>

          <ReportFooter />
        </ReportBody>
      </ReportDocument>
    </ReportShell>
  );
}
