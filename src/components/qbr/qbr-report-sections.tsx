"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  HardDrive,
  Network,
  Shield,
  Target,
  Workflow,
} from "lucide-react";
import { BRAND } from "@/lib/branding";
import {
  buildQbrDashboardKpis,
  categoryIconKey,
  formatQbrCurrency,
  formatSignedPoints,
  getBudgetUtilizationPercent,
  getCategoryDeltaTone,
  groupOpportunitiesByPriority,
  roadmapPhaseLabel,
  roadmapPhaseTone,
  summarizeCategoryImprovement,
} from "@/lib/qbr/presentation";
import type { QbrReportData } from "@/lib/qbr/types";
import { getReportTypeMeta } from "@/lib/reports/meta";
import { getReportScoreTextClass } from "@/lib/reports/document-score-display";
import { formatDisplayDate } from "@/lib/display";
import { RECOMMENDATION_STATUS_LABELS } from "@/lib/assessments/results-summary";
import { ReportExecutiveSummary } from "@/components/reports/report-executive-summary";
import { ReportPageBreak, ReportPrintLeadGroup } from "@/components/reports";
import { ReportSection } from "@/components/reports/report-section";
import { cn } from "@/lib/utils";

const DOCUMENT_THEME = true;

function CategoryIcon({ categoryName }: { categoryName: string }) {
  const key = categoryIconKey(categoryName);
  const iconClass = "h-4 w-4";
  switch (key) {
    case "security":
      return <Shield className={iconClass} aria-hidden />;
    case "data":
      return <Database className={iconClass} aria-hidden />;
    case "infrastructure":
      return <Network className={iconClass} aria-hidden />;
    case "operations":
      return <HardDrive className={iconClass} aria-hidden />;
    case "documentation":
      return <FileText className={iconClass} aria-hidden />;
    case "continuity":
      return <Workflow className={iconClass} aria-hidden />;
    case "strategy":
      return <Target className={iconClass} aria-hidden />;
    default:
      return <ClipboardList className={iconClass} aria-hidden />;
  }
}

function PriorityChip({ priority }: { priority: string }) {
  const tone =
    priority === "critical"
      ? "qbr-chip-critical"
      : priority === "high"
        ? "qbr-chip-high"
        : priority === "medium"
          ? "qbr-chip-medium"
          : "qbr-chip-low";
  return <span className={cn("qbr-chip", tone)}>{priority}</span>;
}

function QbrEmpty({ children }: { children: ReactNode }) {
  return <div className="qbr-empty">{children}</div>;
}

export function QbrReportCover({ data }: { data: QbrReportData }) {
  const meta = getReportTypeMeta("quarterly_business_review");

  return (
    <header className="qbr-report-cover print:break-after-page">
      <p className="qbr-report-cover-eyebrow">
        Prepared by {BRAND.companyName} · {BRAND.productName}
      </p>
      <h1 className="qbr-report-cover-title">{meta.title}</h1>
      <p className="qbr-report-cover-client">{data.clientName}</p>
      <p className="qbr-report-cover-subtitle">
        {data.reviewPeriodLabel} · Executive technology performance, outcomes, and next-quarter
        priorities
      </p>

      <div className="qbr-report-cover-meta">
        <div>
          <p className="qbr-report-cover-meta-label">Review Period</p>
          <p className="qbr-report-cover-meta-value">{data.reviewPeriodLabel}</p>
        </div>
        <div>
          <p className="qbr-report-cover-meta-label">Generated</p>
          <p className="qbr-report-cover-meta-value">{data.generatedDateLabel}</p>
        </div>
        <div>
          <p className="qbr-report-cover-meta-label">Maturity Tier</p>
          <p className="qbr-report-cover-meta-value">{data.currentMaturityLabel ?? "—"}</p>
        </div>
        <div>
          <p className="qbr-report-cover-meta-label">Document</p>
          <p className="qbr-report-cover-meta-value">{data.title}</p>
        </div>
      </div>

      <div className="qbr-report-cover-score">
        <p className="qbr-report-cover-score-label">Technology Score</p>
        <p className="qbr-report-cover-score-value">
          {data.scoreAtPeriodEnd ?? data.currentStackScore ?? "—"}
        </p>
        <p className="qbr-report-cover-score-hint">
          {data.scoreChange !== null
            ? `${formatSignedPoints(data.scoreChange)} vs prior period`
            : "Quarter-end StackScore"}
        </p>
      </div>

      <p className="qbr-report-cover-confidential">
        CONFIDENTIAL — Prepared exclusively for {data.clientName}. Do not distribute without
        written consent from {BRAND.companyName}.
      </p>
    </header>
  );
}

type QbrExecutiveDashboardPageProps = {
  data: QbrReportData;
  executiveSummary: string;
  isEditable?: boolean;
  onExecutiveSummaryChange?: (value: string) => void;
};

export function QbrExecutiveDashboardPage({
  data,
  executiveSummary,
  isEditable,
  onExecutiveSummaryChange,
}: QbrExecutiveDashboardPageProps) {
  const kpis = buildQbrDashboardKpis(data);

  return (
    <>
      <ReportSection
        title="Executive Dashboard"
        subtitle="Thirty-second view of quarter performance and technology health"
        documentTheme={DOCUMENT_THEME}
      >
        <div className="qbr-score-hero">
          <div className="qbr-score-hero-card">
            <p className="qbr-score-hero-label">Last Quarter</p>
            <p
              className={cn(
                "qbr-score-hero-value",
                getReportScoreTextClass(data.scoreAtPeriodStart),
              )}
            >
              {data.scoreAtPeriodStart ?? "—"}
            </p>
          </div>
          <div className="qbr-score-hero-delta">
            <p className="qbr-score-hero-delta-value">{formatSignedPoints(data.scoreChange)}</p>
            <p className="qbr-score-hero-delta-label">Quarter-over-quarter</p>
            <ArrowRight className="mx-auto mt-2 hidden h-4 w-4 text-[color:var(--report-muted)] md:block" />
          </div>
          <div className="qbr-score-hero-card">
            <p className="qbr-score-hero-label">Current Score</p>
            <p
              className={cn(
                "qbr-score-hero-value",
                getReportScoreTextClass(data.scoreAtPeriodEnd),
              )}
            >
              {data.scoreAtPeriodEnd ?? "—"}
            </p>
          </div>
        </div>

        <div className="qbr-kpi-grid">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="qbr-kpi-card">
              <p className="qbr-kpi-card-label">{kpi.label}</p>
              <p
                className={cn(
                  "qbr-kpi-card-value",
                  kpi.tone === "positive" && "qbr-kpi-card-value-positive",
                  kpi.tone === "warning" && "qbr-kpi-card-value-warning",
                  kpi.tone === "critical" && "qbr-kpi-card-value-critical",
                )}
              >
                {kpi.value}
              </p>
              {kpi.hint ? <p className="qbr-kpi-card-hint">{kpi.hint}</p> : null}
            </article>
          ))}
        </div>
      </ReportSection>

      <ReportSection
        title="Executive Summary"
        subtitle="Business briefing for leadership"
        documentTheme={DOCUMENT_THEME}
      >
        <ReportPrintLeadGroup>
          {isEditable && onExecutiveSummaryChange ? (
            <ReportExecutiveSummary
              value={executiveSummary}
              isEditable
              onChange={onExecutiveSummaryChange}
              placeholder="Summarize the quarter's technology progress in business language…"
              className="qbr-executive-prose min-h-32 rounded-lg border bg-[color:var(--report-background)] px-3 py-2"
            />
          ) : (
            <div className="qbr-executive-prose-stack qbr-executive-prose">
              {executiveSummary
                .trim()
                .split(/\n\n+/)
                .filter(Boolean)
                .map((paragraph) => (
                  <p key={paragraph.slice(0, 64)}>{paragraph}</p>
                ))}
            </div>
          )}
        </ReportPrintLeadGroup>
      </ReportSection>

      {(data.businessGoalLabel || data.technologyVision) && (
        <div className="qbr-meta-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="qbr-meta-box">
            <p className="qbr-meta-label">Business Goal</p>
            <p className="qbr-meta-value">{data.businessGoalLabel ?? "Not specified"}</p>
            <p className="qbr-work-body">{data.businessGoalProgress}</p>
          </div>
          <div className="qbr-meta-box">
            <p className="qbr-meta-label">Technology Vision</p>
            <p className="qbr-meta-value">{data.technologyVision ?? "Not specified"}</p>
            <p className="qbr-work-body">{data.visionProgress}</p>
          </div>
        </div>
      )}

      <ReportPageBreak />
    </>
  );
}

export function QbrTechnologyHealthPage({ data }: { data: QbrReportData }) {
  return (
    <>
      <ReportSection
        title="Technology Health"
        subtitle="Category score movement across the technology environment"
        documentTheme={DOCUMENT_THEME}
      >
        {data.categoryImprovements.length === 0 ? (
          <QbrEmpty>
            Category score history is not yet available for this review period.
          </QbrEmpty>
        ) : (
          <div className="qbr-category-grid">
            {data.categoryImprovements.map((row) => {
              const tone = getCategoryDeltaTone(row.change);
              const current = row.currentScore ?? 0;
              return (
                <article key={row.categoryName} className="qbr-category-card">
                  <div className="qbr-category-card-header">
                    <div className="qbr-category-card-title">
                      <span className="qbr-category-card-icon">
                        <CategoryIcon categoryName={row.categoryName} />
                      </span>
                      {row.categoryName}
                    </div>
                    <span
                      className={cn(
                        "qbr-category-delta",
                        tone === "positive" && "qbr-category-delta-positive",
                        tone === "warning" && "qbr-category-delta-warning",
                        tone === "neutral" && "qbr-category-delta-neutral",
                      )}
                    >
                      {formatSignedPoints(row.change)}
                    </span>
                  </div>
                  <div className="qbr-category-scores">
                    <div className="qbr-category-score-box">
                      <p className="qbr-category-score-label">Previous</p>
                      <p className="qbr-category-score-value">{row.previousScore ?? "—"}</p>
                    </div>
                    <div className="qbr-category-score-box">
                      <p className="qbr-category-score-label">Current</p>
                      <p
                        className={cn(
                          "qbr-category-score-value",
                          getReportScoreTextClass(row.currentScore),
                        )}
                      >
                        {row.currentScore ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="qbr-category-bar-track">
                    <div
                      className="qbr-category-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(0, current))}%` }}
                    />
                  </div>
                  <p className="qbr-category-summary">{summarizeCategoryImprovement(row)}</p>
                </article>
              );
            })}
          </div>
        )}
      </ReportSection>
      <ReportPageBreak />
    </>
  );
}

export function QbrCompletedWorkPage({ data }: { data: QbrReportData }) {
  return (
    <>
      <ReportSection
        title="Completed Work"
        subtitle="Resolved recommendations and delivered projects this quarter"
        documentTheme={DOCUMENT_THEME}
      >
        <div className="qbr-kpi-grid" style={{ marginBottom: "1.25rem" }}>
          <article className="qbr-kpi-card">
            <p className="qbr-kpi-card-label">Projects Completed</p>
            <p className="qbr-kpi-card-value">{data.projectsCompletedInPeriod}</p>
          </article>
          <article className="qbr-kpi-card">
            <p className="qbr-kpi-card-label">Recommendations Resolved</p>
            <p className="qbr-kpi-card-value">{data.recommendationsResolvedInPeriod}</p>
          </article>
          <article className="qbr-kpi-card">
            <p className="qbr-kpi-card-label">Assessments Completed</p>
            <p className="qbr-kpi-card-value">{data.assessmentsCompletedInPeriod}</p>
          </article>
          <article className="qbr-kpi-card">
            <p className="qbr-kpi-card-label">Journey Milestones</p>
            <p className="qbr-kpi-card-value">{data.journeyEvents.length}</p>
          </article>
        </div>

        <h3 className="qbr-priority-group-title">
          <CheckCircle2 className="h-4 w-4 text-[color:var(--report-status-strong)]" />
          Resolved Recommendations
        </h3>
        {data.resolvedRecommendations.length === 0 ? (
          <QbrEmpty>No recommendations were resolved during this review period.</QbrEmpty>
        ) : (
          <div className="qbr-work-list">
            {data.resolvedRecommendations.map((item) => (
              <article key={item.id} className="qbr-work-card">
                <div className="qbr-work-icon">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h4 className="qbr-work-title">{item.title}</h4>
                  <div className="qbr-work-meta">
                    <PriorityChip priority={item.priority} />
                    <span className="qbr-chip qbr-chip-success">Resolved</span>
                    <span className="qbr-chip">{item.categoryName}</span>
                    <span className="qbr-chip">
                      {item.resolvedAt ? formatDisplayDate(item.resolvedAt) : "Date unavailable"}
                    </span>
                  </div>
                  <p className="qbr-work-body">{item.businessImpact}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        <h3 className="qbr-priority-group-title" style={{ marginTop: "1.75rem" }}>
          <Workflow className="h-4 w-4 text-[color:var(--report-accent)]" />
          Completed Projects
        </h3>
        {data.completedProjects.length === 0 ? (
          <QbrEmpty>No projects were completed during this review period.</QbrEmpty>
        ) : (
          <div className="qbr-work-list">
            {data.completedProjects.map((project) => (
              <article key={project.id} className="qbr-work-card">
                <div className="qbr-work-icon">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h4 className="qbr-work-title">{project.title}</h4>
                  <div className="qbr-work-meta">
                    <span className="qbr-chip qbr-chip-success">Completed</span>
                    <span className="qbr-chip">{formatDisplayDate(project.completedAt)}</span>
                    {project.impactPoints !== null ? (
                      <span className="qbr-chip qbr-chip-success">
                        +{project.impactPoints} impact pts
                      </span>
                    ) : null}
                  </div>
                  {project.description ? (
                    <p className="qbr-work-body">{project.description}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </ReportSection>
      <ReportPageBreak />
    </>
  );
}

export function QbrOpportunitiesPage({ data }: { data: QbrReportData }) {
  const groups = groupOpportunitiesByPriority(data.remainingOpportunities);

  return (
    <>
      <ReportSection
        title="Remaining Opportunities"
        subtitle="Open recommendations grouped by business priority"
        documentTheme={DOCUMENT_THEME}
      >
        {groups.length === 0 ? (
          <QbrEmpty>No open improvement opportunities at this time.</QbrEmpty>
        ) : (
          groups.map((group) => (
            <div key={group.priority}>
              <h3 className="qbr-priority-group-title">
                <PriorityChip priority={group.priority} />
                {group.label} Priority · {group.items.length}
              </h3>
              <div className="qbr-opportunity-list">
                {group.items.map((item) => (
                  <article key={item.id} className="qbr-opportunity-card">
                    <h4 className="qbr-opportunity-title">{item.title}</h4>
                    <div className="qbr-opportunity-meta">
                      <PriorityChip priority={item.priority} />
                      <span className="qbr-chip">
                        {RECOMMENDATION_STATUS_LABELS[item.status]}
                      </span>
                      <span className="qbr-chip">{item.categoryName}</span>
                    </div>
                    <p className="qbr-opportunity-body">{item.businessImpact}</p>
                    <div className="qbr-meta-grid">
                      <div className="qbr-meta-box">
                        <p className="qbr-meta-label">Business Value</p>
                        <p className="qbr-meta-value">
                          Strengthens {item.categoryName.toLowerCase()} posture
                        </p>
                      </div>
                      <div className="qbr-meta-box">
                        <p className="qbr-meta-label">Target Focus</p>
                        <p className="qbr-meta-value">Next planning cycle</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </ReportSection>

      <ReportSection
        title="Top Risks"
        subtitle="Highest-priority technology and business risks requiring attention"
        documentTheme={DOCUMENT_THEME}
      >
        {data.technologyRisks.length === 0 ? (
          <QbrEmpty>
            No explicit technology risks were recorded for this review. Continue monitoring
            open high-priority opportunities.
          </QbrEmpty>
        ) : (
          <div className="qbr-risk-list">
            {data.technologyRisks.map((risk, index) => (
              <article key={`${index}-${risk}`} className="qbr-risk-card">
                <div className="qbr-work-meta">
                  <span className="qbr-chip qbr-chip-critical">Risk</span>
                  <span className="qbr-chip">Priority {index + 1}</span>
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--report-status-critical)]" />
                  <p className="qbr-risk-body" style={{ marginTop: 0 }}>
                    {risk}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </ReportSection>
      <ReportPageBreak />
    </>
  );
}

export function QbrInvestmentPage({ data }: { data: QbrReportData }) {
  const budget = data.budgetForecast;
  const utilization = getBudgetUtilizationPercent(budget);
  const planned = budget?.plannedInvestment ?? 0;
  const completed = budget?.completedInvestment ?? 0;
  const deferred = budget?.deferredInvestment ?? 0;
  const monthly = budget?.monthlyServices ?? 0;
  const threeYear = budget?.estimatedThreeYearInvestment ?? 0;
  const maxBar = Math.max(planned, completed, deferred, threeYear, 1);

  return (
    <>
      <ReportSection
        title="Technology Investment"
        subtitle="Executive view of planned, completed, and ongoing technology spend"
        documentTheme={DOCUMENT_THEME}
      >
        {!budget ? (
          <QbrEmpty>
            A living technology budget forecast is not available yet. Activate roadmap budgeting
            to unlock planned vs completed investment visibility.
          </QbrEmpty>
        ) : (
          <>
            <div className="qbr-budget-grid">
              <article className="qbr-budget-card">
                <p className="qbr-budget-label">Planned Investment</p>
                <p className="qbr-budget-value">{formatQbrCurrency(planned)}</p>
              </article>
              <article className="qbr-budget-card">
                <p className="qbr-budget-label">Completed Investment</p>
                <p className="qbr-budget-value">{formatQbrCurrency(completed)}</p>
              </article>
              <article className="qbr-budget-card qbr-budget-card-emphasize">
                <p className="qbr-budget-label">Budget Utilization</p>
                <p className="qbr-budget-value">
                  {utilization !== null ? `${utilization}%` : "—"}
                </p>
              </article>
              <article className="qbr-budget-card">
                <p className="qbr-budget-label">Deferred Investment</p>
                <p className="qbr-budget-value">{formatQbrCurrency(deferred)}</p>
              </article>
              <article className="qbr-budget-card">
                <p className="qbr-budget-label">Monthly Services</p>
                <p className="qbr-budget-value">{formatQbrCurrency(monthly)}/mo</p>
              </article>
              <article className="qbr-budget-card">
                <p className="qbr-budget-label">Estimated 3-Year Investment</p>
                <p className="qbr-budget-value">{formatQbrCurrency(threeYear)}</p>
              </article>
            </div>

            <div className="qbr-bar-compare">
              {[
                { label: "Completed", value: completed, className: "qbr-bar-fill" },
                { label: "Planned", value: planned, className: "qbr-bar-fill qbr-bar-fill-secondary" },
                { label: "Deferred", value: deferred, className: "qbr-bar-fill" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="qbr-bar-row-label">
                    <span>{row.label}</span>
                    <span>{formatQbrCurrency(row.value)}</span>
                  </div>
                  <div className="qbr-bar-track">
                    <div
                      className={row.className}
                      style={{ width: `${Math.round((row.value / maxBar) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {data.roadmapPhases.some(
              (phase) =>
                (phase.oneTimeInvestment ?? 0) > 0 || (phase.monthlyRecurringInvestment ?? 0) > 0,
            ) ? (
              <>
                <h3 className="qbr-priority-group-title" style={{ marginTop: "1.75rem" }}>
                  Investment by Roadmap Phase
                </h3>
                <div className="qbr-budget-grid">
                  {data.roadmapPhases.map((phase) => (
                    <article
                      key={`${phase.phaseName}-${phase.timeframe}`}
                      className="qbr-budget-card"
                    >
                      <p className="qbr-budget-label">{phase.phaseName}</p>
                      <p className="qbr-budget-value">
                        {formatQbrCurrency(phase.oneTimeInvestment ?? 0)}
                      </p>
                      <p className="qbr-kpi-card-hint">
                        {(phase.monthlyRecurringInvestment ?? 0) > 0
                          ? `${formatQbrCurrency(phase.monthlyRecurringInvestment ?? 0)}/mo recurring`
                          : "One-time implementation"}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </ReportSection>
      <ReportPageBreak />
    </>
  );
}

export function QbrRoadmapPage({ data }: { data: QbrReportData }) {
  return (
    <>
      <ReportSection
        title="Technology Roadmap"
        subtitle="Phased journey from assessment through implementation"
        documentTheme={DOCUMENT_THEME}
      >
        {data.roadmapPhases.length === 0 ? (
          <QbrEmpty>No active technology roadmap phases are configured yet.</QbrEmpty>
        ) : (
          <div className="qbr-roadmap-flow">
            <div className="qbr-roadmap-step">
              <div className="qbr-roadmap-rail">
                <div className="qbr-roadmap-dot qbr-roadmap-dot-completed">✓</div>
                <div className="qbr-roadmap-line" />
              </div>
              <article className="qbr-roadmap-card">
                <div className="qbr-roadmap-card-header">
                  <div>
                    <p className="qbr-roadmap-phase-name">Assessment Complete</p>
                    <p className="qbr-roadmap-phase-time">{data.reviewPeriodLabel}</p>
                  </div>
                  <span className="qbr-chip qbr-chip-success">Baseline</span>
                </div>
                <p className="qbr-roadmap-phase-body">
                  Technology maturity baseline established for {data.clientName} with a current
                  StackScore of {data.scoreAtPeriodEnd ?? data.currentStackScore ?? "—"}.
                </p>
              </article>
            </div>

            {data.roadmapPhases.map((phase, index) => {
              const tone = roadmapPhaseTone(phase.status);
              const isLast = index === data.roadmapPhases.length - 1;
              return (
                <div key={`${phase.phaseName}-${phase.timeframe}`} className="qbr-roadmap-step">
                  <div className="qbr-roadmap-rail">
                    <div className={cn("qbr-roadmap-dot", `qbr-roadmap-dot-${tone}`)}>
                      {index + 1}
                    </div>
                    {!isLast ? <div className="qbr-roadmap-line" /> : null}
                  </div>
                  <article className="qbr-roadmap-card">
                    <div className="qbr-roadmap-card-header">
                      <div>
                        <p className="qbr-roadmap-phase-name">{phase.phaseName}</p>
                        <p className="qbr-roadmap-phase-time">{phase.timeframe}</p>
                      </div>
                      <span
                        className={cn(
                          "qbr-chip",
                          tone === "completed" && "qbr-chip-success",
                          tone === "in_progress" && "qbr-chip-high",
                          tone === "awaiting" && "qbr-chip-medium",
                        )}
                      >
                        {roadmapPhaseLabel(phase.status)}
                      </span>
                    </div>
                    <p className="qbr-roadmap-phase-body">
                      {phase.summary ||
                        `${phase.initiativeCount} initiative${phase.initiativeCount === 1 ? "" : "s"} sequenced for delivery.`}
                    </p>
                    <div className="qbr-meta-grid">
                      <div className="qbr-meta-box">
                        <p className="qbr-meta-label">Initiatives</p>
                        <p className="qbr-meta-value">{phase.initiativeCount}</p>
                      </div>
                      <div className="qbr-meta-box">
                        <p className="qbr-meta-label">Investment</p>
                        <p className="qbr-meta-value">
                          {(phase.oneTimeInvestment ?? 0) > 0
                            ? formatQbrCurrency(phase.oneTimeInvestment ?? 0)
                            : "Scoped in proposal"}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </ReportSection>
      <ReportPageBreak />
    </>
  );
}

export function QbrNextQuarterPage({ data }: { data: QbrReportData }) {
  return (
    <ReportSection
      title="Next Quarter Priorities"
      subtitle="What leadership should expect in the upcoming planning cycle"
      documentTheme={DOCUMENT_THEME}
    >
      {data.nextQuarterPriorities.length === 0 &&
      data.strategicRecommendations.length === 0 ? (
        <QbrEmpty>Priorities will be confirmed during the next planning cycle.</QbrEmpty>
      ) : (
        <div className="qbr-priority-list">
          {data.nextQuarterPriorities.map((priority, index) => (
            <article key={`priority-${index}`} className="qbr-priority-card">
              <div className="qbr-work-meta">
                <span className="qbr-chip qbr-chip-medium">Priority {index + 1}</span>
                <span className="qbr-chip">Next quarter</span>
              </div>
              <h4 className="qbr-priority-title" style={{ marginTop: "0.55rem" }}>
                {priority}
              </h4>
              <div className="qbr-meta-grid">
                <div className="qbr-meta-box">
                  <p className="qbr-meta-label">Expected Outcome</p>
                  <p className="qbr-meta-value">Measurable progress toward technology maturity</p>
                </div>
                <div className="qbr-meta-box">
                  <p className="qbr-meta-label">Success Focus</p>
                  <p className="qbr-meta-value">Delivery + StackScore movement</p>
                </div>
              </div>
            </article>
          ))}

          {data.strategicRecommendations.map((item, index) => (
            <article key={`strategic-${index}`} className="qbr-priority-card">
              <div className="qbr-work-meta">
                <span className="qbr-chip">Strategic recommendation</span>
              </div>
              <div className="mt-2 flex items-start gap-2">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--report-accent)]" />
                <p className="qbr-priority-body" style={{ marginTop: 0 }}>
                  {item}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </ReportSection>
  );
}
