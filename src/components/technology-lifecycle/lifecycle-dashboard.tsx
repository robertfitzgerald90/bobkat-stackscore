import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { TechnologyLifecycleDashboard } from "@/lib/technology-lifecycle/types";
import {
  CLIENT_METRIC_WELL,
  CLIENT_SECTION_EYEBROW,
  CLIENT_SURFACE_CARD,
} from "@/lib/client-ui/tokens";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HEALTH_STYLES = {
  healthy: "bg-emerald-50 text-emerald-800 border-emerald-200",
  watch: "bg-amber-50 text-amber-800 border-amber-200",
  at_risk: "bg-orange-50 text-orange-800 border-orange-200",
  critical: "bg-red-50 text-red-800 border-red-200",
} as const;

export function LifecycleDashboard({
  dashboard,
}: {
  dashboard: TechnologyLifecycleDashboard;
}) {
  return (
    <div className="space-y-6">
      <header className={cn("rounded-xl border bg-card p-6", CLIENT_SURFACE_CARD)}>
        <p className={cn(CLIENT_SECTION_EYEBROW, "text-xs tracking-wide")}>
          Technology Lifecycle
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          How healthy is {dashboard.clientName}&apos;s technology environment today?
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Continuous maturity management across assessment history, roadmap progress, managed
          services, budget planning, and upcoming refresh cycles.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ScoreCard label="Current StackScore" value={dashboard.currentStackScore} />
        <ScoreCard label="Previous StackScore" value={dashboard.previousStackScore} />
        <ScoreCard label="Target StackScore" value={dashboard.targetStackScore} />
        <KpiCard
          label="Roadmap Completion"
          value={`${dashboard.roadmapCompletionPercent}%`}
        />
        <BandCard label="Technology Health" band={dashboard.technologyHealth} value={dashboard.technologyHealthLabel} />
        <BandCard label="Business Risk" band={dashboard.businessRisk} value={dashboard.businessRiskLabel} />
        <KpiCard
          label="Overall Trend"
          value={dashboard.trendLabel}
          hint={
            dashboard.scoreDelta !== null
              ? `${dashboard.scoreDelta > 0 ? "+" : ""}${dashboard.scoreDelta} pts`
              : undefined
          }
          icon={
            dashboard.scoreDelta !== null && dashboard.scoreDelta > 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : dashboard.scoreDelta !== null && dashboard.scoreDelta < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <Activity className="h-4 w-4 text-muted-foreground" />
            )
          }
        />
        <KpiCard
          label="Last / Next Review"
          value={
            dashboard.lastReviewDate
              ? new Date(dashboard.lastReviewDate).toLocaleDateString()
              : "—"
          }
          hint={
            dashboard.nextReviewDate
              ? `Next: ${new Date(dashboard.nextReviewDate).toLocaleDateString()}`
              : "Next review not scheduled"
          }
        />
      </div>

      <section className={cn("rounded-xl border bg-card p-5", CLIENT_SURFACE_CARD)}>
        <h2 className={cn(CLIENT_SECTION_EYEBROW, "text-sm tracking-wide")}>
          Maturity Pillars
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.pillars.map((pillar) => (
            <div key={pillar.key} className={CLIENT_METRIC_WELL}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                {pillar.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-xl font-bold tabular-nums",
                  getScoreTextColorClass(pillar.score),
                )}
              >
                {pillar.score ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cn("rounded-xl border bg-card p-5", CLIENT_SURFACE_CARD)}>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h2 className={cn(CLIENT_SECTION_EYEBROW, "text-sm tracking-wide")}>
              Technology Budget Planning
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <BudgetRow label="Completed Investment" value={dashboard.budget.completedInvestment} />
            <BudgetRow label="Planned Investment" value={dashboard.budget.plannedInvestment} />
            <BudgetRow label="Deferred Investment" value={dashboard.budget.deferredInvestment} />
            <BudgetRow
              label="Monthly Services"
              value={dashboard.budget.monthlyServices}
              suffix="/mo"
            />
            <BudgetRow
              label="Annual Services"
              value={dashboard.budget.annualServices}
              suffix="/yr"
            />
            <BudgetRow label="Future Refresh Budget" value={dashboard.budget.futureRefreshBudget} />
            <BudgetRow
              label="Estimated 3-Year Investment"
              value={dashboard.budget.estimatedThreeYearInvestment}
              emphasize
            />
          </div>
        </section>

        <section className={cn("rounded-xl border bg-card p-5", CLIENT_SURFACE_CARD)}>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className={cn(CLIENT_SECTION_EYEBROW, "text-sm tracking-wide")}>
              Technology Refresh Planning
            </h2>
          </div>
          {dashboard.refreshEvents.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No warranty, renewal, or replacement events in the next 12 months.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {dashboard.refreshEvents.slice(0, 8).map((event) => (
                <li key={event.id} className="rounded-lg border px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{event.title}</p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase",
                        event.urgency === "overdue" && "border-red-200 bg-red-50 text-red-700",
                        event.urgency === "upcoming" && "border-amber-200 bg-amber-50 text-amber-800",
                        event.urgency === "planned" && "border-border bg-muted/40 text-muted-foreground",
                      )}
                    >
                      {event.urgency}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {event.eventType.replaceAll("_", " ")} ·{" "}
                    {new Date(event.dueDate).toLocaleDateString()} · {event.category}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cn("rounded-xl border bg-card p-5", CLIENT_SURFACE_CARD)}>
          <h2 className={cn(CLIENT_SECTION_EYEBROW, "text-sm tracking-wide")}>
            Roadmap & Projects
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <KpiCard label="Current Phase" value={dashboard.currentPhaseName ?? "Complete"} />
            <KpiCard label="Next Phase" value={dashboard.upcomingPhaseName ?? "—"} />
            <KpiCard label="Completed Initiatives" value={dashboard.completedProjectsCount} />
            <KpiCard label="Upcoming Initiatives" value={dashboard.upcomingProjectsCount} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/clients/${dashboard.clientId}/roadmap`}
              className={buttonClassName({ variant: "outline", size: "sm" })}
            >
              Open roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={`/clients/${dashboard.clientId}/quarterly-reviews`}
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              Quarterly reviews
            </Link>
          </div>
        </section>

        <section className={cn("rounded-xl border bg-card p-5", CLIENT_SURFACE_CARD)}>
          <h2 className={cn(CLIENT_SECTION_EYEBROW, "text-sm tracking-wide")}>
            Managed Services Alignment
          </h2>
          <ul className="mt-4 space-y-2">
            {dashboard.managedServices.map((service) => (
              <li key={service.serviceKey} className="rounded-lg border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{service.serviceName}</p>
                  {service.active ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Available</span>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">{service.description}</p>
                {service.supportsObjectives.length > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supports: {service.supportsObjectives.slice(0, 2).join("; ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {dashboard.scoreTrends.length > 1 ? (
        <section className={cn("rounded-xl border bg-card p-5", CLIENT_SURFACE_CARD)}>
          <h2 className={cn(CLIENT_SECTION_EYEBROW, "text-sm tracking-wide")}>
            Historical Trend
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Date</th>
                  <th className="py-2 pr-3 font-semibold">Overall</th>
                  <th className="py-2 pr-3 font-semibold">Security</th>
                  <th className="py-2 pr-3 font-semibold">Infrastructure</th>
                  <th className="py-2 pr-3 font-semibold">Backup</th>
                  <th className="py-2 pr-3 font-semibold">Continuity</th>
                  <th className="py-2 font-semibold">Documentation</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.scoreTrends.map((point) => (
                  <tr key={point.date} className="border-b last:border-0">
                    <td className="py-2 pr-3">
                      {new Date(point.date).toLocaleDateString()}
                    </td>
                    <td className={cn("py-2 pr-3 font-semibold", getScoreTextColorClass(point.overallScore))}>
                      {point.overallScore}
                    </td>
                    <td className="py-2 pr-3">{point.securityScore ?? "—"}</td>
                    <td className="py-2 pr-3">{point.infrastructureScore ?? "—"}</td>
                    <td className="py-2 pr-3">{point.backupScore ?? "—"}</td>
                    <td className="py-2 pr-3">{point.businessContinuityScore ?? "—"}</td>
                    <td className="py-2">{point.documentationScore ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className={cn("rounded-xl border bg-card p-5", CLIENT_SURFACE_CARD)}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={cn(CLIENT_SECTION_EYEBROW, "text-sm tracking-wide")}>
            Initiative Effectiveness
          </h2>
          <span className="text-xs text-muted-foreground">
            {dashboard.openOpportunityCount} open opportunities
          </span>
        </div>
        {dashboard.initiativeEffectiveness.filter((item) => item.status === "completed").length ===
        0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Completed initiatives will appear here with estimated vs actual score impact for ROI
            reporting.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {dashboard.initiativeEffectiveness
              .filter((item) => item.status === "completed")
              .slice(0, 8)
              .map((item) => (
                <li key={item.initiativeId} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-muted-foreground">
                    Est. +{item.estimatedScoreIncrease} pts
                    {item.actualScoreIncrease != null
                      ? ` · Actual +${item.actualScoreIncrease} pts`
                      : ""}
                    {item.completionDate
                      ? ` · Completed ${new Date(item.completionDate).toLocaleDateString()}`
                      : ""}
                  </p>
                  {item.businessValue ? (
                    <p className="mt-1 text-muted-foreground">{item.businessValue}</p>
                  ) : null}
                </li>
              ))}
          </ul>
        )}

        {dashboard.opportunities.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Emerging Opportunities
            </h3>
            <ul className="mt-3 space-y-2">
              {dashboard.opportunities.slice(0, 5).map((opportunity) => (
                <li key={opportunity.id} className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-medium">{opportunity.title}</p>
                    <p className="mt-1 text-muted-foreground">{opportunity.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", CLIENT_SURFACE_CARD)}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-2 text-2xl font-bold tabular-nums", getScoreTextColorClass(value))}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", CLIENT_SURFACE_CARD)}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {icon}
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      </div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function BandCard({
  label,
  band,
  value,
}: {
  label: string;
  band: keyof typeof HEALTH_STYLES;
  value: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", CLIENT_SURFACE_CARD)}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <span
        className={cn(
          "mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
          HEALTH_STYLES[band],
        )}
      >
        {value}
      </span>
    </div>
  );
}

function BudgetRow({
  label,
  value,
  suffix,
  emphasize,
}: {
  label: string;
  value: number;
  suffix?: string;
  emphasize?: boolean;
}) {
  return (
    <div className={cn(CLIENT_METRIC_WELL, emphasize && "bg-primary/5")}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">
        {formatCurrency(value)}
        {suffix ?? ""}
      </p>
    </div>
  );
}
