import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  MessageSquare,
  RefreshCw,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Customer360Dashboard } from "@/lib/commercial-intelligence/types";
import { getReportLibrary } from "@/lib/commercial-intelligence/reporting-library";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { formatDisplayDate } from "@/lib/display";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECTION_HEADER_CLASS =
  "text-[15px] font-semibold tracking-[0.04em] text-primary sm:text-base";

const LIST_PRIMARY_CLASS = "text-[15px] font-semibold leading-snug text-foreground";
const LIST_SECONDARY_CLASS = "mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm";

const RENEWAL_KIND_LABELS: Record<string, string> = {
  warranty_expiration: "Warranty expiration",
  license_renewal: "License renewal",
  planned_replacement: "Planned replacement",
  renewal: "Renewal",
  end_of_support: "End of support",
};

function formatRenewalKind(kind: string): string {
  return RENEWAL_KIND_LABELS[kind] ?? kind.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCommunicationTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const datePart = formatDisplayDate(date);
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${datePart} • ${timePart}`;
}

export function Customer360View({ dashboard }: { dashboard: Customer360Dashboard }) {
  const reports = getReportLibrary(dashboard.clientId);
  const clientBase = `/clients/${dashboard.clientId}`;

  return (
    <div className="space-y-8">
      <header className={cn("rounded-xl border bg-card p-6 shadow-sm", CLIENT_SURFACE_CARD)}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Customer 360
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {dashboard.companyName}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
          value={formatDisplayDate(dashboard.upcomingReviewDate)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Recent Assessments"
          icon={BarChart3}
          action={{ href: `${clientBase}/assessments`, label: "View All" }}
        >
          {dashboard.recentAssessments.length === 0 ? (
            <Empty>No completed assessments yet.</Empty>
          ) : (
            <ScrollableList>
              {dashboard.recentAssessments.map((assessment) => (
                <ListRow key={assessment.id}>
                  <p className={LIST_PRIMARY_CLASS}>{assessment.name}</p>
                  <p className={LIST_SECONDARY_CLASS}>
                    {formatDisplayDate(assessment.completedAt)}
                    {assessment.score != null ? ` • Score ${assessment.score}` : ""}
                  </p>
                </ListRow>
              ))}
            </ScrollableList>
          )}
        </Panel>

        <Panel
          title="Upcoming Renewals"
          icon={RefreshCw}
          action={{ href: `${clientBase}/lifecycle`, label: "View All" }}
        >
          {dashboard.upcomingRenewals.length === 0 ? (
            <Empty>No renewals in the near term.</Empty>
          ) : (
            <ScrollableList>
              {dashboard.upcomingRenewals.map((item) => (
                <ListRow key={`${item.title}-${item.dueDate}`}>
                  <p className={LIST_PRIMARY_CLASS}>{item.title}</p>
                  <p className={LIST_SECONDARY_CLASS}>
                    {formatRenewalKind(item.kind)} • {formatDisplayDate(item.dueDate)}
                  </p>
                </ListRow>
              ))}
            </ScrollableList>
          )}
        </Panel>

        <Panel
          title="Managed Services"
          icon={Wrench}
          action={{ href: `${clientBase}/billing`, label: "Manage" }}
        >
          {dashboard.activeManagedServices.length === 0 ? (
            <Empty>No active managed services.</Empty>
          ) : (
            <ScrollableList>
              {dashboard.activeManagedServices.map((service) => (
                <ListRow key={service}>
                  <p className={LIST_PRIMARY_CLASS}>{service}</p>
                </ListRow>
              ))}
            </ScrollableList>
          )}
        </Panel>

        <Panel
          title="Recent Communications"
          icon={MessageSquare}
          action={{ href: `${clientBase}/communications`, label: "View Inbox" }}
        >
          {dashboard.recentCommunications.length === 0 ? (
            <Empty>No recent communications.</Empty>
          ) : (
            <ScrollableList>
              {dashboard.recentCommunications.map((message) => (
                <ListRow key={message.id}>
                  <p className={LIST_PRIMARY_CLASS}>{message.subject}</p>
                  <p className={LIST_SECONDARY_CLASS}>
                    {formatCommunicationTimestamp(message.sentAt)}
                  </p>
                </ListRow>
              ))}
            </ScrollableList>
          )}
        </Panel>
      </div>

      <Panel title="Reporting Library">
        <div className="grid gap-3 sm:grid-cols-2">
          {reports.map((report) => (
            <Link
              key={report.key}
              href={report.hrefTemplate}
              className={cn(
                "rounded-lg border border-[rgba(70,120,255,0.12)] bg-background/40 px-4 py-3.5 text-sm",
                "transition-all duration-200 ease-out motion-reduce:transition-none",
                "hover:-translate-y-0.5 hover:border-primary/25 hover:bg-muted/20",
                "hover:shadow-[0_8px_28px_rgba(0,0,0,0.22),0_0_16px_rgba(35,135,255,0.06)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <p className="font-semibold text-foreground">{report.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {report.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/80">{report.engine}</p>
            </Link>
          ))}
        </div>
      </Panel>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`${clientBase}/lifecycle`}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          Lifecycle
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link
          href={`${clientBase}/roadmap`}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          Roadmap
        </Link>
        <Link
          href={`${clientBase}/billing`}
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
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", CLIENT_SURFACE_CARD)}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight text-foreground",
          score && typeof value === "number" ? getScoreTextColorClass(value) : undefined,
        )}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  action?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-xl border bg-card p-5 shadow-sm sm:p-6",
        CLIENT_SURFACE_CARD,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(70,120,255,0.1)] pb-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              aria-hidden
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} />
            </span>
          ) : null}
          <h2 className={SECTION_HEADER_CLASS}>{title}</h2>
        </div>
        {action ? (
          <Link
            href={action.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary/90",
              "transition-colors duration-200 hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm",
            )}
          >
            {action.label}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
      <div className="mt-5 min-h-0 flex-1">{children}</div>
    </section>
  );
}

function ScrollableList({ children }: { children: ReactNode }) {
  return (
    <ul
      className={cn(
        "max-h-[min(18rem,42vh)] space-y-2.5 overflow-y-auto pr-1",
        "[scrollbar-width:thin] [scrollbar-color:rgba(70,120,255,0.35)_transparent]",
      )}
    >
      {children}
    </ul>
  );
}

function ListRow({ children }: { children: ReactNode }) {
  return (
    <li
      className={cn(
        "rounded-lg border border-[rgba(70,120,255,0.12)] bg-background/30 px-3.5 py-3",
        "transition-all duration-200 ease-out motion-reduce:transition-none",
        "hover:-translate-y-px hover:border-primary/25 hover:bg-muted/25",
        "hover:shadow-[0_6px_20px_rgba(0,0,0,0.18),0_0_12px_rgba(35,135,255,0.05)]",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
      )}
    >
      {children}
    </li>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}
