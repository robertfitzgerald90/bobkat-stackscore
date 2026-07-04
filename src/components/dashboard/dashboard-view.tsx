import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { MaturityDistribution } from "@/components/dashboard/maturity-distribution";
import { TrendIndicator } from "@/components/analytics/trend-indicator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clientImmediateFocusPath } from "@/lib/clients/paths";
import type { DashboardClientRow, DashboardSummary } from "@/lib/dashboard";
import { RATING_DISPLAY_LABELS } from "@/lib/scoring/rating-display";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { Rating } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

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

type DashboardViewProps = {
  summary: DashboardSummary;
};

function DashboardKpiCard({
  label,
  value,
  description,
  emphasizeScore = false,
  trend,
}: {
  label: string;
  value: string | number;
  description: string;
  emphasizeScore?: boolean;
  trend?: { delta: number; label: string } | null;
}) {
  const numericValue = typeof value === "number" ? value : null;

  return (
    <div className="min-w-0 rounded-lg border border-border/60 bg-card px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xl font-bold tabular-nums sm:text-2xl",
          emphasizeScore && numericValue !== null
            ? getScoreTextColorClass(numericValue)
            : undefined,
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      {trend ? (
        <div
          className={cn(
            "mt-1.5 flex items-center gap-1 text-xs font-medium",
            trend.delta > 0 && "text-success",
            trend.delta < 0 && "text-destructive",
            trend.delta === 0 && "text-muted-foreground",
          )}
        >
          {trend.delta > 0 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : trend.delta < 0 ? (
            <TrendingDown className="h-3.5 w-3.5" />
          ) : null}
          <span>
            {trend.delta > 0 ? "+" : ""}
            {trend.label}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function PortfolioInsights({ summary }: { summary: DashboardSummary }) {
  const { kpis } = summary;
  const insights: string[] = [];

  if (kpis.portfolioScoreTrend !== null && kpis.assessedClientCount > 0) {
    const direction =
      kpis.portfolioScoreTrend > 0
        ? "improving"
        : kpis.portfolioScoreTrend < 0
          ? "declining"
          : "unchanged";
    insights.push(
      `Portfolio average ${direction} ${kpis.portfolioScoreTrend > 0 ? "+" : ""}${kpis.portfolioScoreTrend} pts since prior assessments`,
    );
  }

  if (kpis.clientsImprovingCount > 0 || kpis.clientsDecliningCount > 0) {
    const parts: string[] = [];
    if (kpis.clientsImprovingCount > 0) {
      parts.push(`${kpis.clientsImprovingCount} client${kpis.clientsImprovingCount === 1 ? "" : "s"} improving`);
    }
    if (kpis.clientsDecliningCount > 0) {
      parts.push(`${kpis.clientsDecliningCount} declining`);
    }
    insights.push(parts.join(" · "));
  }

  if (kpis.criticalRecommendationsCount > 0) {
    insights.push(
      `${kpis.criticalRecommendationsCount} critical recommendation${kpis.criticalRecommendationsCount === 1 ? "" : "s"} still open`,
    );
  } else if (kpis.openRecommendationsCount === 0 && kpis.assessedClientCount > 0) {
    insights.push("No open recommendations across assessed clients");
  }

  if (insights.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Portfolio trends
      </p>
      <ul className="mt-2 space-y-1 text-sm text-foreground">
        {insights.map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>
    </div>
  );
}

function ClientAnalyticsRow({ client }: { client: DashboardClientRow }) {
  return (
    <Link
      href={clientImmediateFocusPath(client.clientId)}
      className="group flex min-w-0 flex-col gap-2 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold group-hover:text-primary">{client.companyName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {client.rating ? (
            <Badge variant={RATING_VARIANT[client.rating]} className="text-[10px]">
              {RATING_DISPLAY_LABELS[client.rating]}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              Not assessed
            </Badge>
          )}
          {client.maturityStatus ? (
            <span className="text-xs text-muted-foreground">{client.maturityStatus}</span>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-end">
        <span className="inline-flex items-center gap-1.5">
          <span className="font-medium text-foreground">Score</span>
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              getScoreTextColorClass(client.currentStackScore),
            )}
          >
            {client.currentStackScore ?? "—"}
          </span>
          <TrendIndicator delta={client.scoreChange} showLabel={false} />
        </span>
        <span>
          <span className="font-medium text-foreground">{client.criticalRecommendationsCount}</span>{" "}
          critical
        </span>
        <span>
          <span className="font-medium text-foreground">{client.openProjectsCount}</span> open
          projects
        </span>
        <span className="inline-flex items-center gap-1">
          <Target className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{client.immediateFocusCount}</span> focus
        </span>
        <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary sm:block" />
      </div>
    </Link>
  );
}

export function DashboardView({ summary }: DashboardViewProps) {
  const { kpis, clients, scoreDistribution } = summary;

  return (
    <div className="min-w-0 space-y-4">
      <header className="min-w-0">
        <h2 className="page-title">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Business performance across your client portfolio.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <DashboardKpiCard
          label="Average StackScore"
          value={kpis.averageStackScore ?? "—"}
          emphasizeScore
          description={
            kpis.assessedClientCount > 0
              ? `Across ${kpis.assessedClientCount} assessed client${kpis.assessedClientCount === 1 ? "" : "s"}`
              : "No completed assessments yet"
          }
          trend={
            kpis.portfolioScoreTrend !== null
              ? {
                  delta: kpis.portfolioScoreTrend,
                  label: `${kpis.portfolioScoreTrend > 0 ? "+" : ""}${kpis.portfolioScoreTrend} pts avg vs prior`,
                }
              : null
          }
        />
        <DashboardKpiCard
          label="Immediate Focus"
          value={kpis.immediateFocusTotal}
          description={
            kpis.immediateFocusTotal > 0
              ? "Urgent items across the portfolio"
              : "No urgent focus signals"
          }
        />
        <DashboardKpiCard
          label="Open Recommendations"
          value={kpis.openRecommendationsCount}
          description={
            kpis.criticalRecommendationsCount > 0
              ? `${kpis.criticalRecommendationsCount} critical priority`
              : "Open, accepted, or in progress"
          }
        />
        <DashboardKpiCard
          label="Active Projects"
          value={kpis.activeProjectsCount}
          description="Proposed through in progress"
        />
        <DashboardKpiCard
          label="At-Risk Clients"
          value={kpis.atRiskClientCount}
          description={
            kpis.atRiskClientCount > 0
              ? "StackScore below 60 — review Client Workspace"
              : kpis.assessedClientCount > 0
                ? "None below critical threshold"
                : "No assessed clients yet"
          }
        />
      </section>

      <PortfolioInsights summary={summary} />

      <section className="grid gap-6 xl:grid-cols-5">
        <Card className="stat-card xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Portfolio Client Analytics
            </CardTitle>
            <CardDescription>
              Read-only client health — select a row to open the Client Workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {clients.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm font-medium">No clients in the portfolio</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Client analytics appear once clients are added to StackScore.
                </p>
              </div>
            ) : (
              clients.map((client) => <ClientAnalyticsRow key={client.clientId} client={client} />)
            )}
          </CardContent>
        </Card>

        <Card className="stat-card xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Technology Maturity Distribution</CardTitle>
            <CardDescription>
              How assessed clients are distributed across maturity levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MaturityDistribution distribution={scoreDistribution} />
          </CardContent>
        </Card>
      </section>

      {kpis.atRiskClientCount > 0 ? (
        <Card className="stat-card border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Weakest Maturity Signals
            </CardTitle>
            <CardDescription>
              Clients with the lowest StackScores — open workspace for operational follow-up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {clients
              .filter((client) => client.currentStackScore !== null && client.currentStackScore < 60)
              .slice(0, 5)
              .map((client) => (
                <Link
                  key={client.clientId}
                  href={clientImmediateFocusPath(client.clientId)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 transition-colors hover:bg-destructive/10"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{client.companyName}</p>
                    {client.rating ? (
                      <Badge variant={RATING_VARIANT[client.rating]} className="mt-1 text-[10px]">
                        {RATING_DISPLAY_LABELS[client.rating]}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-2xl font-bold tabular-nums text-destructive">
                      {client.currentStackScore}
                    </span>
                    {client.criticalRecommendationsCount > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        {client.criticalRecommendationsCount} critical
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
