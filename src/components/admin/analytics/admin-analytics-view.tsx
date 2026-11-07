import Link from "next/link";
import { AnalyticsFilters } from "@/components/admin/analytics/analytics-filters";
import { BreakdownPanel, MetricTile, RateTile } from "@/components/admin/analytics/analytics-panels";
import { AnalyticsTimeChart } from "@/components/admin/analytics/analytics-time-chart";
import { formatRefreshedAt } from "@/lib/admin-analytics/format";
import type { AdminAnalyticsDashboard, AnalyticsSection, CountMetric } from "@/lib/admin-analytics/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SECTIONS: Array<{ id: AnalyticsSection; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "acquisition", label: "Acquisition" },
  { id: "conversion", label: "Conversion" },
  { id: "content", label: "Content" },
];

function sectionHref(dashboard: AdminAnalyticsDashboard, section: AnalyticsSection): string {
  const params = new URLSearchParams({
    site: dashboard.filters.site,
    range: dashboard.filters.preset,
    section,
  });
  if (dashboard.filters.preset === "custom") {
    params.set("from", dashboard.filters.from);
    params.set("to", dashboard.filters.to);
  }
  return `/admin/analytics?${params.toString()}`;
}

function sparkline(metric: CountMetric, dashboard: AdminAnalyticsDashboard): number[] | undefined {
  const key =
    metric.id === "inquiries" ? "inquiries" : metric.id === "snapshots" ? "snapshots" : metric.id === "paid-assessments" ? "purchases" : null;
  if (!key || metric.availability !== "available") return undefined;
  const values = dashboard.activity.points.map((point) => point.values[key] ?? 0);
  return values.length >= 2 ? values : undefined;
}

export function AdminAnalyticsView({ dashboard }: { dashboard: AdminAnalyticsDashboard }) {
  const section = dashboard.filters.section;

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Operations</p>
        <h1 className="page-title">Analytics</h1>
        <p className="page-description max-w-3xl">
          Visitors and page traffic stay anonymous. Contact inquiries, snapshot submissions, and
          assessment purchases are identifiable StackScore records. The two are not one customer journey.
        </p>
        <p className="text-sm text-muted-foreground">
          {dashboard.filters.from} to {dashboard.filters.to} UTC · Prior period {dashboard.filters.previousFrom} to{" "}
          {dashboard.filters.previousTo} · Page built {formatRefreshedAt(dashboard.generatedAt)}
        </p>
      </header>

      {dashboard.filters.warning ? (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">{dashboard.filters.warning}</p>
      ) : null}

      <AnalyticsFilters filters={dashboard.filters} />

      <nav aria-label="Analytics sections" className="flex gap-2 overflow-x-auto">
        {SECTIONS.map((item) => (
          <Link
            key={item.id}
            href={sectionHref(dashboard, item.id)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center rounded-lg border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              item.id === section
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
            aria-current={item.id === section ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {section === "overview" ? <Overview dashboard={dashboard} /> : null}
      {section === "acquisition" ? <Acquisition dashboard={dashboard} /> : null}
      {section === "conversion" ? <Conversion dashboard={dashboard} /> : null}
      {section === "content" ? <Content dashboard={dashboard} /> : null}

      <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-base font-semibold">Connections</h2>
        <ul className="space-y-2">
          {dashboard.connections.map((connection) => (
            <li key={connection.id} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <span className="text-sm font-medium">{connection.label}</span>
              <span className="flex min-w-0 flex-col items-start gap-1 sm:items-end">
                <Badge variant="outline">
                  {connection.state === "connected"
                    ? "Connected"
                    : connection.state === "not_connected"
                      ? "Not connected"
                      : "Unavailable"}
                </Badge>
                <span className="max-w-xl text-xs text-muted-foreground sm:text-right">{connection.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Follow-ups</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {dashboard.followUps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Overview({ dashboard }: { dashboard: AdminAnalyticsDashboard }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboard.visitors.map((metric) => (
          <MetricTile key={metric.id} metric={metric} />
        ))}
        {dashboard.overview.map((metric) => (
          <MetricTile key={metric.id} metric={metric} sparkline={sparkline(metric, dashboard)} />
        ))}
      </div>
      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-base font-semibold">{dashboard.activity.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{dashboard.activity.definition}</p>
        <div className="mt-4">
          <AnalyticsTimeChart series={dashboard.activity} />
        </div>
      </section>
      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-base font-semibold">{dashboard.visitorsOverTime.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{dashboard.visitorsOverTime.definition}</p>
        <div className="mt-4">
          <AnalyticsTimeChart series={dashboard.visitorsOverTime} />
        </div>
      </section>
    </div>
  );
}

function Acquisition({ dashboard }: { dashboard: AdminAnalyticsDashboard }) {
  return (
    <div className="space-y-6">
      <div className="max-w-xl">
        <MetricTile metric={dashboard.demo} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {dashboard.acquisition.map((item) => (
          <BreakdownPanel key={item.id} table={item} />
        ))}
      </div>
    </div>
  );
}

function Conversion({ dashboard }: { dashboard: AdminAnalyticsDashboard }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboard.conversionSteps.map((metric) => (
          <MetricTile key={metric.id} metric={metric} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {dashboard.conversionRates.map((metric) => (
          <RateTile key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function Content({ dashboard }: { dashboard: AdminAnalyticsDashboard }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {dashboard.pages.map((item) => (
        <BreakdownPanel key={item.id} table={item} />
      ))}
      {dashboard.ctas.map((item) => (
        <BreakdownPanel key={item.id} table={item} />
      ))}
    </div>
  );
}
