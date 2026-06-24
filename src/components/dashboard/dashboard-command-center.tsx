import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FolderKanban,
  Lightbulb,
  Plus,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { MaturityDistribution } from "@/components/dashboard/maturity-distribution";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/branding";
import { RATING_DISPLAY_LABELS } from "@/lib/scoring/rating-display";
import { getScoreBarColorClass, getScoreTextColorClass } from "@/lib/scoring/score-display";
import type { ClientStatus, Priority, Rating, RecommendationStatus } from "@/generated/prisma/client";
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

const PRIORITY_VARIANT: Record<Priority, "destructive" | "warning" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

type ClientHealthRow = {
  id: string;
  companyName: string;
  status: ClientStatus;
  score: number | null;
  rating: Rating | null;
  assessmentId: string | null;
};

type RecentAssessmentRow = {
  id: string;
  assessmentName: string;
  companyName: string;
  clientId: string;
  score: number;
  completedAt: Date | null;
};

type RecentProjectRow = {
  id: string;
  title: string;
  companyName: string;
  status: string;
  priority: Priority;
  updatedAt: Date;
};

type RecentRecommendationRow = {
  id: string;
  title: string;
  companyName: string;
  clientId: string;
  assessmentId: string;
  priority: Priority;
  status: RecommendationStatus;
  updatedAt: Date;
};

type UrgentRecommendationRow = {
  id: string;
  title: string;
  companyName: string;
  clientId: string;
  assessmentId: string;
  priority: Priority;
};

type CriticalClientRow = {
  id: string;
  companyName: string;
  score: number;
  rating: Rating;
};

export type DashboardCommandCenterProps = {
  averageClientScore: number | null;
  averageClientRating: Rating | null;
  scoreTrend: { change: number } | null;
  atRiskClientCount: number;
  openRecommendationsCount: number;
  activeProjectsCount: number;
  clientHealth: ClientHealthRow[];
  scoreDistribution: Record<Rating, number>;
  recentAssessments: RecentAssessmentRow[];
  recentProjects: RecentProjectRow[];
  recentRecommendations: RecentRecommendationRow[];
  criticalClients: CriticalClientRow[];
  urgentRecommendations: UrgentRecommendationRow[];
};

export function DashboardCommandCenter({
  averageClientScore,
  averageClientRating,
  scoreTrend,
  atRiskClientCount,
  openRecommendationsCount,
  activeProjectsCount,
  clientHealth,
  scoreDistribution,
  recentAssessments,
  recentProjects,
  recentRecommendations,
  criticalClients,
  urgentRecommendations,
}: DashboardCommandCenterProps) {
  return (
    <div className="page-shell">
      <section className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary via-primary to-[#0a3d75] text-primary-foreground shadow-md">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
              {BRAND.companyName}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-primary-foreground lg:text-4xl">
              Bobkat {BRAND.productName}
            </h1>
            <p className="text-lg font-medium text-primary-foreground/90">
              Technology Security &amp; Maturity Platform
            </p>
            <p className="text-sm leading-relaxed text-primary-foreground/75">
              Monitor client technology posture, track assessment outcomes, and prioritize remediation
              across your portfolio. Executive-ready visibility into security maturity, open
              recommendations, and active improvement projects.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/clients/new" className={buttonClassName({ variant: "inverse", size: "lg" })}>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Link>
            <Link
              href="/clients"
              className={buttonClassName({ variant: "inverseOutline", size: "lg" })}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              New Assessment
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
        <Card className="stat-card border-primary/20 md:col-span-2 xl:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-brand" />
              Average Client StackScore
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-5xl font-bold tabular-nums tracking-tight",
                  getScoreTextColorClass(averageClientScore),
                )}
              >
                {averageClientScore !== null ? averageClientScore : "—"}
              </span>
              <span className="text-2xl font-medium text-muted-foreground">/ 100</span>
            </div>
            {averageClientRating ? (
              <Badge variant={RATING_VARIANT[averageClientRating]} className="text-sm">
                {RATING_DISPLAY_LABELS[averageClientRating]}
              </Badge>
            ) : (
              <p className="text-sm text-muted-foreground">No completed assessments yet</p>
            )}
            <p className="text-sm text-muted-foreground">Target maturity score: 80+</p>
            {scoreTrend ? (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  scoreTrend.change > 0 && "text-success",
                  scoreTrend.change < 0 && "text-destructive",
                  scoreTrend.change === 0 && "text-muted-foreground",
                )}
              >
                {scoreTrend.change > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : scoreTrend.change < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : null}
                <span>
                  {scoreTrend.change > 0 ? "+" : ""}
                  {scoreTrend.change} from previous assessment
                </span>
              </div>
            ) : null}
            {averageClientScore !== null ? (
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", getScoreBarColorClass(averageClientScore))}
                  style={{ width: `${averageClientScore}%` }}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <MetricCard
          className="xl:col-span-2"
          title="At-Risk Clients"
          value={atRiskClientCount}
          description="Latest StackScore below 60"
          icon={ShieldAlert}
          tone={atRiskClientCount > 0 ? "danger" : "default"}
        />
        <MetricCard
          className="xl:col-span-3"
          title="Open Recommendations"
          value={openRecommendationsCount}
          description="Open, accepted, or in progress"
          icon={Lightbulb}
        />
        <MetricCard
          className="xl:col-span-2"
          title="Active Projects"
          value={activeProjectsCount}
          description="Approved, scheduled, or in progress"
          icon={FolderKanban}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-5">
        <Card className="stat-card xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand" />
              Client Health
            </CardTitle>
            <CardDescription>Score overview across your client portfolio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientHealth.length === 0 ? (
              <EmptyState
                message="No clients yet. Add your first client to begin assessing technology maturity."
                actionLabel="Add Client"
                actionHref="/clients/new"
              />
            ) : (
              clientHealth.map((client) => (
                <ClientHealthCard key={client.id} client={client} />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="stat-card xl:col-span-2">
          <CardHeader>
            <CardTitle>Technology Maturity Overview</CardTitle>
            <CardDescription>Client distribution by score category</CardDescription>
          </CardHeader>
          <CardContent>
            <MaturityDistribution distribution={scoreDistribution} />
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-brand">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">
            Latest assessments, projects, and recommendations across the platform
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <ActivityCard
            title="Recent Assessments"
            icon={ClipboardList}
            emptyMessage="No completed assessments yet. Run an assessment to establish a client's StackScore baseline."
            emptyActionLabel="Start Assessment"
            emptyActionHref="/clients"
          >
            {recentAssessments.map((assessment) => (
              <ActivityRow
                key={assessment.id}
                title={assessment.assessmentName}
                subtitle={assessment.companyName}
                meta={
                  assessment.completedAt
                    ? new Date(assessment.completedAt).toLocaleDateString()
                    : undefined
                }
                trailing={
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      getScoreTextColorClass(assessment.score),
                    )}
                  >
                    {assessment.score}
                  </span>
                }
                href={`/assessments/${assessment.id}/results`}
              />
            ))}
          </ActivityCard>

          <ActivityCard
            title="Recent Projects"
            icon={FolderKanban}
            emptyMessage="No projects yet. Convert recommendations from assessment results into tracked improvement projects."
            emptyActionLabel="View Projects"
            emptyActionHref="/projects"
          >
            {recentProjects.map((project) => (
              <ActivityRow
                key={project.id}
                title={project.title}
                subtitle={project.companyName}
                meta={project.status.replace("_", " ")}
                trailing={
                  <Badge variant={PRIORITY_VARIANT[project.priority]} className="capitalize">
                    {project.priority}
                  </Badge>
                }
                href="/projects"
              />
            ))}
          </ActivityCard>

          <ActivityCard
            title="Recent Recommendations"
            icon={Lightbulb}
            emptyMessage="No recommendations yet. Complete an assessment to generate prioritized remediation guidance."
            emptyActionLabel="View Clients"
            emptyActionHref="/clients"
          >
            {recentRecommendations.map((recommendation) => (
              <ActivityRow
                key={recommendation.id}
                title={recommendation.title}
                subtitle={recommendation.companyName}
                meta={recommendation.status.replace("_", " ")}
                trailing={
                  <Badge
                    variant={PRIORITY_VARIANT[recommendation.priority]}
                    className="capitalize"
                  >
                    {recommendation.priority}
                  </Badge>
                }
                href={`/assessments/${recommendation.assessmentId}/results`}
              />
            ))}
          </ActivityCard>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold text-brand">Immediate Attention</h2>
            <p className="text-sm text-muted-foreground">
              Clients and recommendations requiring priority follow-up
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="stat-card border-destructive/20">
            <CardHeader>
              <CardTitle className="text-base">Clients with Critical Scores</CardTitle>
              <CardDescription>Latest StackScore below the 60-point threshold</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalClients.length === 0 ? (
                <EmptyState
                  message="No clients currently below the critical threshold."
                  positive
                />
              ) : (
                criticalClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                  >
                    <div>
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-link hover:text-link-hover hover:underline"
                      >
                        {client.companyName}
                      </Link>
                      <Badge variant={RATING_VARIANT[client.rating]} className="mt-2 text-xs">
                        {RATING_DISPLAY_LABELS[client.rating]}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-destructive">
                      {client.score}
                      <span className="text-sm font-medium text-muted-foreground"> / 100</span>
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="stat-card border-warning/30">
            <CardHeader>
              <CardTitle className="text-base">High-Priority Recommendations</CardTitle>
              <CardDescription>Critical and high priority items still open</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentRecommendations.length === 0 ? (
                <EmptyState
                  message="No high-priority recommendations pending."
                  positive
                />
              ) : (
                urgentRecommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="rounded-lg border border-border/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{recommendation.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {recommendation.companyName}
                        </p>
                      </div>
                      <Badge
                        variant={PRIORITY_VARIANT[recommendation.priority]}
                        className="shrink-0 capitalize"
                      >
                        {recommendation.priority}
                      </Badge>
                    </div>
                    <Link
                      href={`/assessments/${recommendation.assessmentId}/results`}
                      className={buttonClassName({ variant: "link", className: "mt-2 h-auto p-0" })}
                    >
                      Review recommendation
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function ClientHealthCard({ client }: { client: ClientHealthRow }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/15 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/clients/${client.id}`}
            className="font-medium text-link hover:text-link-hover hover:underline"
          >
            {client.companyName}
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {client.status}
            </Badge>
            {client.rating ? (
              <Badge variant={RATING_VARIANT[client.rating]} className="text-xs">
                {RATING_DISPLAY_LABELS[client.rating]}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Not assessed
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="flex items-baseline justify-end gap-1">
            <span
              className={cn(
                "text-2xl font-bold tabular-nums",
                getScoreTextColorClass(client.score),
              )}
            >
              {client.score !== null ? client.score : "—"}
            </span>
            <span className="text-sm font-medium text-muted-foreground">/ 100</span>
          </p>
        </div>
      </div>

      {client.score !== null ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", getScoreBarColorClass(client.score))}
            style={{ width: `${client.score}%` }}
          />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border/50 pt-3">
        {client.assessmentId ? (
          <Link
            href={`/assessments/${client.assessmentId}/results`}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            View Results
          </Link>
        ) : null}
        <Link
          href={`/clients/${client.id}`}
          className={buttonClassName({ variant: "outline", size: "sm" })}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Run Reassessment
        </Link>
        <Link
          href="/projects"
          className={buttonClassName({ variant: "ghost", size: "sm" })}
        >
          <FolderKanban className="mr-1.5 h-3.5 w-3.5" />
          View Projects
        </Link>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "default",
  className,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "danger";
  className?: string;
}) {
  return (
    <Card className={cn("stat-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Icon
            className={cn("h-4 w-4", tone === "danger" ? "text-destructive" : "text-brand")}
          />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-3xl font-bold tabular-nums",
            tone === "danger" && value > 0 ? "text-destructive" : "text-brand",
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ActivityCard({
  title,
  icon: Icon,
  emptyMessage,
  emptyActionLabel,
  emptyActionHref,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  emptyMessage: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  children: React.ReactNode;
}) {
  const isEmpty = !Array.isArray(children) ? false : children.length === 0;

  return (
    <Card className="stat-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-brand" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isEmpty ? (
          <EmptyState
            message={emptyMessage}
            actionLabel={emptyActionLabel}
            actionHref={emptyActionHref}
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function ActivityRow({
  title,
  subtitle,
  meta,
  trailing,
  href,
}: {
  title: string;
  subtitle: string;
  meta?: string;
  trailing?: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        {meta ? <p className="mt-0.5 text-xs capitalize text-muted-foreground">{meta}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </Link>
  );
}

function EmptyState({
  message,
  actionLabel,
  actionHref,
  positive = false,
}: {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  positive?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed p-5 text-center",
        positive
          ? "border-success/30 bg-success/5"
          : "border-border/60 bg-muted/20",
      )}
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={buttonClassName({ variant: "outline", size: "sm" })}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
