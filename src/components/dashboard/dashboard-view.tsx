import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  TriangleAlert,
  Users,
  Zap,
  BriefcaseBusiness,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { PortfolioHealth } from "@/components/dashboard/portfolio-health";
import { TrendIndicator } from "@/components/analytics/trend-indicator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clientTechnologyProfilePath } from "@/lib/clients/paths";
import { formatShortDate } from "@/lib/dashboard/command-center-rules";
import type { CommandCenterSummary } from "@/lib/dashboard/command-center-types";
import type { ProjectStatus } from "@/generated/prisma/client";
import { formatProjectStatus } from "@/lib/projects";
import { RATING_DISPLAY_LABELS } from "@/lib/scoring/rating-display";
import {
  formatMaturityScore,
  getScoreTextColorClass,
} from "@/lib/scoring/score-display";
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

const ACTION_ICONS: Record<string, LucideIcon> = {
  clients: Users,
  assessments: ClipboardList,
  projects: FolderKanban,
  leads: Inbox,
  communications: Activity,
  recurring: BriefcaseBusiness,
};

type DashboardViewProps = {
  summary: CommandCenterSummary;
};

function PulseCard({
  label,
  value,
  description,
  href,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  description: string;
  href?: string;
  icon: LucideIcon;
}) {
  const content = (
    <>
      <div className="mb-4 flex items-start justify-between gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <ArrowRight
          className="mt-1 h-3.5 w-3.5 text-muted-foreground"
          aria-hidden
        />
      </div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-3xl font-bold tabular-nums sm:text-4xl">
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </>
  );

  if (!href) {
    return (
      <div className="min-w-0 rounded-lg border border-border/60 bg-card px-3 py-2.5">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="min-w-0 rounded-lg border border-border/60 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}

export function DashboardView({ summary }: DashboardViewProps) {
  const { pulse, attention, portfolio, delivery, activity, quickActions } =
    summary;
  const isAdmin = summary.role === "admin";

  return (
    <div className="min-w-0 space-y-5">
      <header className="brand-level-1 brand-frame min-w-0 rounded-sm border border-border bg-card/40 p-4 sm:p-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Your business at a glance
        </p>
        <h1 className="page-title">Command Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See client health, focus your attention, and keep delivery moving.
        </p>
      </header>

      <section aria-labelledby="business-pulse-heading" className="space-y-2">
        <h2
          id="business-pulse-heading"
          className="text-sm font-semibold tracking-tight text-primary"
        >
          Business Pulse
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <PulseCard
            icon={Users}
            label="Total Clients"
            value={pulse.totalClients}
            description="Current client organizations"
            href="/clients"
          />
          <PulseCard
            icon={ClipboardList}
            label="Active Assessments"
            value={pulse.activeAssessments}
            description="Assessments underway"
            href="/assessments"
          />
          <PulseCard
            icon={CheckCircle2}
            label="Completed Assessments"
            value={pulse.completedAssessments}
            description="Finished assessments"
            href="/assessments"
          />
          <PulseCard
            icon={FolderKanban}
            label="Active Projects"
            value={pulse.activeProjects}
            description="Planned and ongoing delivery"
            href="/projects"
          />
          {isAdmin && pulse.openLeads !== null ? (
            <PulseCard
              icon={Inbox}
              label="Open Intake Leads"
              value={pulse.openLeads}
              description={
                pulse.openLeadsBreakdown
                  ? `Snapshot ${pulse.openLeadsBreakdown.snapshot} · Website ${pulse.openLeadsBreakdown.website}`
                  : "Snapshot and website inquiries"
              }
              href="/leads"
            />
          ) : null}
          <PulseCard
            icon={BriefcaseBusiness}
            label="Recurring Services"
            value={pulse.recurringServiceClients}
            description="Clients with active services"
            href="/admin/vcio"
          />
        </div>
      </section>

      <section
        className="grid items-stretch gap-4 xl:grid-cols-2"
        aria-label="Portfolio health and priorities"
      >
        <PortfolioHealth summary={summary} />
        <section aria-labelledby="needs-attention-heading" className="min-w-0">
          <Card className="stat-card h-full">
            <CardHeader className="pb-3">
              <CardTitle
                id="needs-attention-heading"
                className="flex items-center gap-2 text-base"
              >
                <TriangleAlert className="h-4 w-4 text-primary" aria-hidden />
                Needs Attention
              </CardTitle>
              <CardDescription>
                Your next moves, ordered by urgency and age.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[26rem] space-y-1 overflow-y-auto">
              {attention.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center">
                  <CheckCircle2
                    className="mx-auto h-5 w-5 text-primary"
                    aria-hidden
                  />
                  <p className="mt-2 text-sm font-medium">
                    Nothing requires attention right now
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Overdue work, draft assessments, and lead follow-ups will
                    appear here.
                  </p>
                </div>
              ) : (
                attention.map((item, index) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex min-w-0 flex-col gap-1 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums",
                          item.kind.startsWith("overdue")
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.entityLabel}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {item.dateLabel ? <span>{item.dateLabel}</span> : null}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </section>

      <section
        className="grid gap-4 xl:grid-cols-2"
        aria-label="Portfolio and delivery"
      >
        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" aria-hidden />
              Client Portfolio
            </CardTitle>
            <CardDescription>
              Official scores and active work for each client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {portfolio.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-6 text-center">
                <p className="text-sm font-medium">No clients yet</p>
                <Link
                  href="/clients"
                  className="mt-2 inline-flex text-sm text-primary hover:underline"
                >
                  Open Clients
                </Link>
              </div>
            ) : (
              portfolio.map((client) => (
                <Link
                  key={client.clientId}
                  href={clientTechnologyProfilePath(client.clientId)}
                  className="group flex min-w-0 flex-col gap-2 rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold group-hover:text-primary">
                      {client.companyName}
                    </p>
                    <div
                      className="my-2 h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-muted"
                      aria-hidden
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${client.currentStackScore === null ? 0 : Math.max(0, Math.min(100, client.currentStackScore))}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {client.rating ? (
                        <Badge
                          variant={RATING_VARIANT[client.rating]}
                          className="text-[10px]"
                        >
                          {RATING_DISPLAY_LABELS[client.rating]}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Not assessed
                        </Badge>
                      )}
                      {client.maturityStatus ? (
                        <span className="text-xs text-muted-foreground">
                          {client.maturityStatus}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-end">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-medium text-foreground">Score</span>
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          getScoreTextColorClass(client.currentStackScore),
                        )}
                      >
                        {formatMaturityScore(client.currentStackScore)}
                      </span>
                      <TrendIndicator
                        delta={client.scoreChange}
                        showLabel={false}
                      />
                    </span>
                    <span>
                      Assessed {formatShortDate(client.lastAssessedAt) ?? "—"}
                    </span>
                    <span>
                      <span className="font-medium text-foreground">
                        {client.openProjectsCount}
                      </span>{" "}
                      active projects
                    </span>
                  </div>
                </Link>
              ))
            )}
            {summary.role === "admin" ? (
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-1 pt-1 text-sm text-primary hover:underline"
              >
                Open Portfolio
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4" aria-hidden />
              Project Delivery
            </CardTitle>
            <CardDescription>
              Task completion across active projects ·{" "}
              <Link href="/projects" className="text-primary hover:underline">
                Projects register
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-md border border-border/50 px-2.5 py-2">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Active
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {delivery.activeProjectCount}
                </p>
              </div>
              <div className="rounded-md border border-border/50 px-2.5 py-2">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Overdue tasks
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {delivery.overdueTaskCount}
                </p>
              </div>
              <div className="rounded-md border border-border/50 px-2.5 py-2">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Overdue milestones
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {delivery.overdueMilestoneCount}
                </p>
              </div>
              <div className="rounded-md border border-border/50 px-2.5 py-2">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Completed (30d)
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {delivery.recentlyCompletedCount}
                </p>
              </div>
            </div>

            {delivery.projects.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-6 text-center">
                <p className="text-sm font-medium">No active projects</p>
                <Link
                  href="/projects"
                  className="mt-2 inline-flex text-sm text-primary hover:underline"
                >
                  Open Projects
                </Link>
              </div>
            ) : (
              delivery.projects.map((project) => (
                <Link
                  key={project.projectId}
                  href={project.href}
                  className="block rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {project.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.clientName}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {formatProjectStatus(project.status as ProjectStatus)}
                    </Badge>
                  </div>
                  {project.progressPercent !== null ? (
                    <div
                      role="progressbar"
                      aria-label={`${project.title} task completion`}
                      aria-valuenow={project.progressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.max(0, Math.min(100, project.progressPercent))}%`,
                        }}
                      />
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      No tasks recorded yet
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Progress{" "}
                      <span className="font-medium text-foreground">
                        {project.progressPercent === null
                          ? "—"
                          : `${project.progressPercent}%`}
                      </span>
                    </span>
                    {project.overdueTaskCount > 0 ? (
                      <span className="text-destructive">
                        {project.overdueTaskCount} overdue task
                        {project.overdueTaskCount === 1 ? "" : "s"}
                      </span>
                    ) : null}
                    {project.upcomingMilestoneLabel ? (
                      <span>Next: {project.upcomingMilestoneLabel}</span>
                    ) : null}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section
        className="grid gap-4 lg:grid-cols-5"
        aria-label="Activity and actions"
      >
        <Card className="stat-card lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" aria-hidden />
              Recent Activity
            </CardTitle>
            <CardDescription>
              The latest movement across your client work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {activity.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-6 text-center">
                <p className="text-sm font-medium">No recent activity</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Completed assessments, projects, and communications appear
                  here when recorded.
                </p>
              </div>
            ) : (
              activity.map((item) => {
                const body = (
                  <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.clientName}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-xs text-muted-foreground"
                      dateTime={item.occurredAt}
                    >
                      {formatShortDate(item.occurredAt)}
                    </time>
                  </div>
                );
                return item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="relative ml-2 block border-l border-primary/30 py-3 pl-6 pr-3 transition-colors before:absolute before:-left-[4.5px] before:top-5 before:h-2 before:w-2 before:rounded-full before:bg-primary hover:bg-muted/30"
                  >
                    {body}
                  </Link>
                ) : (
                  <div
                    key={item.id}
                    className="relative ml-2 border-l border-primary/30 py-3 pl-6 pr-3 before:absolute before:-left-[4.5px] before:top-5 before:h-2 before:w-2 before:rounded-full before:bg-primary"
                  >
                    {body}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="stat-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" aria-hidden />
              Quick Actions
            </CardTitle>
            <CardDescription>Jump into the work that matters.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = ACTION_ICONS[action.id] ?? ArrowRight;
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className="group flex min-w-0 flex-col items-start gap-3 rounded-lg border border-border/60 p-4 text-sm transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary"
                      aria-hidden
                    />
                  </span>
                  <span>
                    <span className="font-medium">{action.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {action.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
