import type { ReactNode } from "react";
import Link from "next/link";
import type { CommercialInsightsDashboard } from "@/lib/commercial-intelligence/types";
import { listAutomationWorkflows } from "@/lib/automation";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

export function InsightsDashboardView({
  dashboard,
}: {
  dashboard: CommercialInsightsDashboard;
}) {
  const { kpis, funnel, forecast, portfolio, clientSuccess } = dashboard;
  const workflows = listAutomationWorkflows();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#082f5b]">
          Business Intelligence
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Commercial insights & operating KPIs
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Funnel conversion, revenue forecasting, portfolio comparisons, and client success
          outcomes across the StackScore operating platform.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Assessments Completed" value={kpis.assessmentsCompleted} />
        <Stat label="Average StackScore" value={kpis.averageStackScore ?? "—"} score={typeof kpis.averageStackScore === "number"} />
        <Stat
          label="Average Improvement"
          value={
            kpis.averageImprovement != null
              ? `${kpis.averageImprovement > 0 ? "+" : ""}${kpis.averageImprovement}`
              : "—"
          }
        />
        <Stat
          label="Proposal Acceptance"
          value={kpis.proposalAcceptanceRate != null ? `${kpis.proposalAcceptanceRate}%` : "—"}
        />
        <Stat
          label="Phase 1 Close Rate"
          value={kpis.phase1CloseRate != null ? `${kpis.phase1CloseRate}%` : "—"}
        />
        <Stat
          label="Phase Expansion Rate"
          value={kpis.phaseExpansionRate != null ? `${kpis.phaseExpansionRate}%` : "—"}
        />
        <Stat
          label="Recurring Revenue"
          value={`${formatCurrency(kpis.recurringRevenueMonthly)}/mo`}
        />
        <Stat label="Project Revenue" value={formatCurrency(kpis.projectRevenue)} />
        <Stat label="Consulting Revenue (ARR proxy)" value={formatCurrency(kpis.consultingRevenue)} />
        <Stat
          label="Avg Client LTV"
          value={
            kpis.averageClientLifetimeValue != null
              ? formatCurrency(kpis.averageClientLifetimeValue)
              : "—"
          }
        />
        <Stat
          label="Assessment Conversion"
          value={
            kpis.assessmentConversionRate != null ? `${kpis.assessmentConversionRate}%` : "—"
          }
        />
        <Stat
          label="Roadmap Completion Rate"
          value={kpis.roadmapCompletionRate != null ? `${kpis.roadmapCompletionRate}%` : "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Revenue Forecast">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Monthly Forecast" value={formatCurrency(forecast.monthlyRevenueForecast)} />
            <Stat
              label="Quarterly Forecast"
              value={formatCurrency(forecast.quarterlyRevenueForecast)}
            />
            <Stat label="Annual Forecast" value={formatCurrency(forecast.annualRevenueForecast)} />
            <Stat label="Pipeline Value" value={formatCurrency(forecast.pipelineValue)} />
            <Stat
              label="Weighted Pipeline"
              value={formatCurrency(forecast.weightedPipelineValue)}
            />
            <Stat
              label="Approved Phase Value"
              value={formatCurrency(forecast.approvedPhaseValue)}
            />
          </div>
        </Panel>

        <Panel title="Sales Funnel">
          <ul className="space-y-2">
            {funnel.map((stage) => (
              <li key={stage.key} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{stage.label}</p>
                  {stage.conversionFromPreviousPercent != null ? (
                    <p className="text-xs text-muted-foreground">
                      {stage.conversionFromPreviousPercent}% from prior stage
                    </p>
                  ) : null}
                </div>
                <span className="text-lg font-bold tabular-nums">{stage.count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PortfolioList
          title="Highest Risk Clients"
          items={portfolio.highestRiskClients.map((item) => ({
            href: `/clients/${item.clientId}/360`,
            label: item.clientName,
            value: item.score ?? "—",
            score: true,
          }))}
        />
        <PortfolioList
          title="Fastest Improving Clients"
          items={portfolio.fastestImprovingClients.map((item) => ({
            href: `/clients/${item.clientId}/360`,
            label: item.clientName,
            value: `+${item.delta}`,
          }))}
        />
        <PortfolioList
          title="Largest Opportunities"
          items={portfolio.largestOpportunities.map((item) => ({
            href: `/clients/${item.clientId}/360`,
            label: item.clientName,
            value: formatCurrency(item.value),
          }))}
        />
        <PortfolioList
          title="Largest Recurring Revenue"
          items={portfolio.largestRecurringRevenue.map((item) => ({
            href: `/clients/${item.clientId}/360`,
            label: item.clientName,
            value: `${formatCurrency(item.mrr)}/mo`,
          }))}
        />
      </div>

      <Panel title="Client Success Outcomes">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Score Growth</th>
                <th className="py-2 pr-3">Roadmap %</th>
                <th className="py-2 pr-3">Risk Reduction</th>
                <th className="py-2 pr-3">Services</th>
                <th className="py-2">Outcome Score</th>
              </tr>
            </thead>
            <tbody>
              {clientSuccess.map((client) => (
                <tr key={client.clientId} className="border-b last:border-0">
                  <td className="py-2 pr-3">
                    <Link href={`/clients/${client.clientId}/360`} className="font-medium hover:underline">
                      {client.clientName}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">
                    {client.technologyScoreGrowth != null
                      ? `${client.technologyScoreGrowth > 0 ? "+" : ""}${client.technologyScoreGrowth}`
                      : "—"}
                  </td>
                  <td className="py-2 pr-3">{client.roadmapCompletionPercent}%</td>
                  <td className="py-2 pr-3">{client.riskReductionPercent}%</td>
                  <td className="py-2 pr-3">{client.serviceAdoptionCount}</td>
                  <td className="py-2 font-semibold">{client.overallOutcomeScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Operational Automation Readiness">
        <ul className="grid gap-2 sm:grid-cols-2">
          {workflows.map((workflow) => (
            <li key={workflow.key} className="rounded-lg border px-3 py-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{workflow.name}</p>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {workflow.status}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">{workflow.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Trigger: {workflow.trigger}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Stat({
  label,
  value,
  score,
}: {
  label: string;
  value: string | number;
  score?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight",
          score && typeof value === "number" ? getScoreTextColorClass(value) : undefined,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#082f5b]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PortfolioList({
  title,
  items,
}: {
  title: string;
  items: Array<{ href: string; label: string; value: string | number; score?: boolean }>;
}) {
  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={`${item.href}-${item.label}`} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm">
              <Link href={item.href} className="font-medium hover:underline">
                {item.label}
              </Link>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  item.score && typeof item.value === "number"
                    ? getScoreTextColorClass(item.value)
                    : undefined,
                )}
              >
                {item.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
