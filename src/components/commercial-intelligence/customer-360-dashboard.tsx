import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Customer360Dashboard } from "@/lib/commercial-intelligence/types";
import { getReportLibrary } from "@/lib/commercial-intelligence/reporting-library";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Customer360View({ dashboard }: { dashboard: Customer360Dashboard }) {
  const reports = getReportLibrary(dashboard.clientId);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#082f5b]">
          Customer 360
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{dashboard.companyName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {dashboard.primaryContactName} · {dashboard.primaryContactEmail}
          {dashboard.industry ? ` · ${dashboard.industry}` : ""}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Client Health Score"
          value={dashboard.overallClientHealthScore}
          score
        />
        <Metric label="Current StackScore" value={dashboard.currentStackScore} score />
        <Metric label="Roadmap Progress" value={`${dashboard.roadmapProgressPercent}%`} />
        <Metric
          label="Monthly Recurring Revenue"
          value={formatCurrency(dashboard.monthlyRecurringRevenue)}
        />
        <Metric label="Active Projects" value={dashboard.activeProjects} />
        <Metric label="Completed Projects" value={dashboard.completedProjects} />
        <Metric label="Proposal Pipeline" value={dashboard.proposalPipelineCount} />
        <Metric
          label="Pipeline Value"
          value={formatCurrency(dashboard.proposalPipelineValue)}
        />
        <Metric label="Open Opportunities" value={dashboard.openOpportunities} />
        <Metric label="Managed Services" value={dashboard.managedServicesCount} />
        <Metric
          label="Technology Trend"
          value={dashboard.technologyTrend?.replaceAll("_", " ") ?? "—"}
        />
        <Metric
          label="Upcoming Review"
          value={
            dashboard.upcomingReviewDate
              ? new Date(dashboard.upcomingReviewDate).toLocaleDateString()
              : "—"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recent Assessments">
          {dashboard.recentAssessments.length === 0 ? (
            <Empty>No completed assessments yet.</Empty>
          ) : (
            <ul className="space-y-2">
              {dashboard.recentAssessments.map((assessment) => (
                <li key={assessment.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{assessment.name}</p>
                  <p className="text-muted-foreground">
                    {assessment.completedAt
                      ? new Date(assessment.completedAt).toLocaleDateString()
                      : "—"}
                    {assessment.score != null ? ` · Score ${assessment.score}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Upcoming Renewals">
          {dashboard.upcomingRenewals.length === 0 ? (
            <Empty>No renewals in the near term.</Empty>
          ) : (
            <ul className="space-y-2">
              {dashboard.upcomingRenewals.map((item) => (
                <li key={`${item.title}-${item.dueDate}`} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground">
                    {item.kind.replaceAll("_", " ")} ·{" "}
                    {new Date(item.dueDate).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Managed Services">
          {dashboard.activeManagedServices.length === 0 ? (
            <Empty>No active managed services.</Empty>
          ) : (
            <ul className="space-y-2">
              {dashboard.activeManagedServices.map((service) => (
                <li key={service} className="rounded-lg border px-3 py-2 text-sm">
                  {service}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent Communications">
          {dashboard.recentCommunications.length === 0 ? (
            <Empty>No recent communications.</Empty>
          ) : (
            <ul className="space-y-2">
              {dashboard.recentCommunications.map((message) => (
                <li key={message.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{message.subject}</p>
                  <p className="text-muted-foreground">
                    {new Date(message.sentAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Reporting Library">
        <div className="grid gap-2 sm:grid-cols-2">
          {reports.map((report) => (
            <Link
              key={report.key}
              href={report.hrefTemplate}
              className="rounded-lg border px-3 py-3 text-sm transition hover:bg-slate-50"
            >
              <p className="font-medium">{report.title}</p>
              <p className="mt-1 text-muted-foreground">{report.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{report.engine}</p>
            </Link>
          ))}
        </div>
      </Panel>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/clients/${dashboard.clientId}/lifecycle`}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          Lifecycle
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link
          href={`/clients/${dashboard.clientId}/roadmap`}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          Roadmap
        </Link>
        <Link
          href={`/clients/${dashboard.clientId}/billing`}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          Billing
        </Link>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  score,
}: {
  label: string;
  value: string | number | null;
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
        {value ?? "—"}
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

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
