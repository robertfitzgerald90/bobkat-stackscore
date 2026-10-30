import { prisma } from "@/lib/db";
import { getRecentOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { getDashboardSummary } from "@/lib/dashboard/summary";
import {
  buildCommandCenterQuickActions,
  countOpenLeads,
  formatShortDate,
  isTaskIncompleteStatus,
  sortAttentionItems,
} from "@/lib/dashboard/command-center-rules";
import type {
  CommandCenterAttentionItem,
  CommandCenterPortfolioRow,
  CommandCenterProjectRow,
  CommandCenterSummary,
} from "@/lib/dashboard/command-center-types";
import { dashboardActiveProjectsWhere } from "@/lib/dashboard/active-projects";
import { clientProjectDetailPath, clientTechnologyProfilePath } from "@/lib/clients/paths";
import { computeProjectProgress } from "@/lib/projects/progress";
import { getTechnologySnapshotLeadSummaryStats } from "@/lib/technology-snapshot/lead-admin";
import { countNewWebsiteLeads } from "@/lib/website-leads/service";

const ATTENTION_LIMIT = 8;
const PORTFOLIO_LIMIT = 10;
const PROJECT_LIMIT = 6;
const ACTIVITY_LIMIT = 8;

export type CommandCenterOptions = {
  now?: Date;
};

/**
 * SS-ADMIN-004 Command Center — composes existing dashboard, lead, project,
 * activity, and subscription selectors. Does not invent scoring or urgency.
 */
export async function getCommandCenterSummary(
  role: string,
  options: CommandCenterOptions = {},
): Promise<CommandCenterSummary> {
  const now = options.now ?? new Date();
  const isAdmin = role === "admin";

  const [
    dashboard,
    activeAssessments,
    completedAssessments,
    recurringClientRows,
    activity,
    overdueTasks,
    overdueMilestones,
    draftUpdates,
    activeProjects,
    snapshotStats,
    websiteNewLeads,
  ] = await Promise.all([
    getDashboardSummary({ now }),
    prisma.assessment.count({ where: { status: "draft" } }),
    prisma.assessment.count({ where: { status: "completed" } }),
    loadRecurringServiceClientIds(),
    getRecentOrganizationActivity(ACTIVITY_LIMIT),
    prisma.projectTask.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: "completed" },
        project: dashboardActiveProjectsWhere(),
      },
      orderBy: { dueDate: "asc" },
      take: 12,
      select: {
        id: true,
        title: true,
        dueDate: true,
        projectId: true,
        clientId: true,
        project: { select: { title: true } },
        client: { select: { companyName: true } },
      },
    }),
    prisma.projectMilestone.findMany({
      where: {
        targetDate: { lt: now },
        completedAt: null,
        project: dashboardActiveProjectsWhere(),
      },
      orderBy: { targetDate: "asc" },
      take: 12,
      select: {
        id: true,
        title: true,
        targetDate: true,
        projectId: true,
        clientId: true,
        project: { select: { title: true } },
        client: { select: { companyName: true } },
      },
    }),
    prisma.projectCustomerUpdate.findMany({
      where: { status: "draft" },
      orderBy: { updatedAt: "asc" },
      take: 8,
      select: {
        id: true,
        projectId: true,
        clientId: true,
        subject: true,
        updatedAt: true,
        project: { select: { title: true } },
        client: { select: { companyName: true } },
      },
    }),
    prisma.project.findMany({
      where: dashboardActiveProjectsWhere(),
      orderBy: [{ targetCompletionDate: "asc" }, { updatedAt: "desc" }],
      take: PROJECT_LIMIT,
      select: {
        id: true,
        title: true,
        status: true,
        clientId: true,
        targetCompletionDate: true,
        client: { select: { companyName: true } },
        tasks: { select: { status: true, dueDate: true } },
        milestones: {
          where: { completedAt: null, targetDate: { not: null } },
          orderBy: { targetDate: "asc" },
          take: 1,
          select: { title: true, targetDate: true },
        },
      },
    }),
    isAdmin ? getTechnologySnapshotLeadSummaryStats() : Promise.resolve(null),
    isAdmin ? countNewWebsiteLeads() : Promise.resolve(null),
  ]);

  const snapshotOpen = snapshotStats
    ? snapshotStats.newLeads + snapshotStats.followUpNeeded
    : 0;
  const websiteOpen = websiteNewLeads ?? 0;

  const pulse = {
    totalClients: dashboard.kpis.totalClientCount,
    activeAssessments,
    completedAssessments,
    activeProjects: dashboard.kpis.activeProjectsCount,
    openLeads: isAdmin ? countOpenLeads(snapshotOpen, websiteOpen) : null,
    openLeadsBreakdown: isAdmin
      ? { snapshot: snapshotOpen, website: websiteOpen }
      : null,
    recurringServiceClients: recurringClientRows.size,
  };

  const attention = sortAttentionItems(
    await buildAttentionItems({
      now,
      isAdmin,
      overdueTasks,
      overdueMilestones,
      draftUpdates,
      dashboardClients: dashboard.clients,
      snapshotFollowUp: snapshotStats?.followUpNeeded ?? 0,
      websiteNew: websiteOpen,
    }),
  ).slice(0, ATTENTION_LIMIT);

  const portfolio: CommandCenterPortfolioRow[] = dashboard.clients
    .slice(0, PORTFOLIO_LIMIT)
    .map((client) => ({
      ...client,
      lastAssessedAt: null,
    }));

  // Enrich lastAssessedAt for visible portfolio rows only (bounded).
  if (portfolio.length > 0) {
    const profiles = await prisma.technologyProfile.findMany({
      where: { clientId: { in: portfolio.map((row) => row.clientId) } },
      select: { clientId: true, lastAssessedAt: true },
    });
    const byClient = new Map(
      profiles.map((profile) => [profile.clientId, profile.lastAssessedAt?.toISOString() ?? null]),
    );
    for (const row of portfolio) {
      row.lastAssessedAt = byClient.get(row.clientId) ?? null;
    }
  }

  const projectRows: CommandCenterProjectRow[] = activeProjects.map((project) => {
    const progress = computeProjectProgress(project.tasks);
    const overdueTaskCount = project.tasks.filter(
      (task) =>
        task.dueDate != null &&
        task.dueDate.getTime() < now.getTime() &&
        isTaskIncompleteStatus(task.status),
    ).length;
    const upcoming = project.milestones[0];
    return {
      projectId: project.id,
      title: project.title,
      clientId: project.clientId,
      clientName: project.client.companyName,
      status: project.status,
      progressPercent: progress.progressPercent,
      overdueTaskCount,
      upcomingMilestoneLabel: upcoming
        ? `${upcoming.title} · ${formatShortDate(upcoming.targetDate) ?? "scheduled"}`
        : null,
      href: clientProjectDetailPath(project.clientId, project.id),
      targetCompletionDate: project.targetCompletionDate?.toISOString() ?? null,
    };
  });

  const [overdueTaskCount, overdueMilestoneCount, recentlyCompletedCount] = await Promise.all([
    prisma.projectTask.count({
      where: {
        dueDate: { lt: now },
        status: { not: "completed" },
        project: dashboardActiveProjectsWhere(),
      },
    }),
    prisma.projectMilestone.count({
      where: {
        targetDate: { lt: now },
        completedAt: null,
        project: dashboardActiveProjectsWhere(),
      },
    }),
    prisma.project.count({
      where: {
        status: "completed",
        completedAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        client: { status: { not: "archived" } },
      },
    }),
  ]);

  return {
    pulse,
    attention,
    portfolio,
    scoreDistribution: dashboard.scoreDistribution,
    delivery: {
      activeProjectCount: dashboard.kpis.activeProjectsCount,
      overdueTaskCount,
      overdueMilestoneCount,
      recentlyCompletedCount,
      projects: projectRows,
    },
    activity,
    quickActions: buildCommandCenterQuickActions(role),
    dashboard,
    generatedAt: now.toISOString(),
    role,
  };
}

async function loadRecurringServiceClientIds(): Promise<Set<string>> {
  const [subscriptions, recurringServices] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        serviceType: "stackscore_vcio",
        status: { in: ["active", "trialing"] },
        client: { status: { not: "archived" } },
      },
      select: { clientId: true },
    }),
    prisma.recurringService.findMany({
      where: {
        status: { in: ["active", "pending_activation"] },
        client: { status: { not: "archived" } },
      },
      select: { clientId: true },
    }),
  ]);

  const ids = new Set<string>();
  for (const row of subscriptions) ids.add(row.clientId);
  for (const row of recurringServices) ids.add(row.clientId);
  return ids;
}

async function buildAttentionItems(input: {
  now: Date;
  isAdmin: boolean;
  overdueTasks: Array<{
    id: string;
    title: string;
    dueDate: Date | null;
    projectId: string;
    clientId: string;
    project: { title: string };
    client: { companyName: string };
  }>;
  overdueMilestones: Array<{
    id: string;
    title: string;
    targetDate: Date | null;
    projectId: string;
    clientId: string;
    project: { title: string };
    client: { companyName: string };
  }>;
  draftUpdates: Array<{
    id: string;
    projectId: string;
    clientId: string;
    subject: string | null;
    updatedAt: Date;
    project: { title: string };
    client: { companyName: string };
  }>;
  dashboardClients: Array<{
    clientId: string;
    companyName: string;
    immediateFocusCount: number;
  }>;
  snapshotFollowUp: number;
  websiteNew: number;
}): Promise<CommandCenterAttentionItem[]> {
  const items: CommandCenterAttentionItem[] = [];

  const draftAssessments = await prisma.assessment.findMany({
    where: { status: "draft" },
    orderBy: { updatedAt: "asc" },
    take: 8,
    select: {
      id: true,
      updatedAt: true,
      clientId: true,
      client: { select: { companyName: true } },
    },
  });

  for (const assessment of draftAssessments) {
    items.push({
      id: `assessment:${assessment.id}`,
      kind: "assessment_draft",
      title: "Assessment in progress",
      entityLabel: assessment.client.companyName,
      reason: "Draft assessment awaiting completion",
      dateLabel: formatShortDate(assessment.updatedAt),
      href: `/assessments/${assessment.id}`,
      sortAt: assessment.updatedAt.toISOString(),
    });
  }

  for (const task of input.overdueTasks) {
    items.push({
      id: `task:${task.id}`,
      kind: "overdue_task",
      title: task.title,
      entityLabel: `${task.client.companyName} · ${task.project.title}`,
      reason: "Overdue project task",
      dateLabel: formatShortDate(task.dueDate),
      href: clientProjectDetailPath(task.clientId, task.projectId),
      sortAt: task.dueDate?.toISOString() ?? input.now.toISOString(),
    });
  }

  for (const milestone of input.overdueMilestones) {
    items.push({
      id: `milestone:${milestone.id}`,
      kind: "overdue_milestone",
      title: milestone.title,
      entityLabel: `${milestone.client.companyName} · ${milestone.project.title}`,
      reason: "Overdue project milestone",
      dateLabel: formatShortDate(milestone.targetDate),
      href: clientProjectDetailPath(milestone.clientId, milestone.projectId),
      sortAt: milestone.targetDate?.toISOString() ?? input.now.toISOString(),
    });
  }

  for (const update of input.draftUpdates) {
    items.push({
      id: `update:${update.id}`,
      kind: "customer_update_draft",
      title: update.subject?.trim() || "Customer project update",
      entityLabel: `${update.client.companyName} · ${update.project.title}`,
      reason: "Customer update awaiting approved send",
      dateLabel: formatShortDate(update.updatedAt),
      href: clientProjectDetailPath(update.clientId, update.projectId),
      sortAt: update.updatedAt.toISOString(),
    });
  }

  if (input.isAdmin && input.snapshotFollowUp > 0) {
    items.push({
      id: "leads:snapshot-follow-up",
      kind: "lead_follow_up",
      title: "Snapshot leads need follow-up",
      entityLabel: `${input.snapshotFollowUp} lead${input.snapshotFollowUp === 1 ? "" : "s"}`,
      reason: "Technology Snapshot status is follow_up",
      dateLabel: null,
      href: "/snapshot-leads",
      sortAt: input.now.toISOString(),
    });
  }

  if (input.isAdmin && input.websiteNew > 0) {
    items.push({
      id: "leads:website-new",
      kind: "lead_follow_up",
      title: "New website leads",
      entityLabel: `${input.websiteNew} lead${input.websiteNew === 1 ? "" : "s"}`,
      reason: "Website lead status is NEW",
      dateLabel: null,
      href: "/website-leads",
      sortAt: input.now.toISOString(),
    });
  }

  for (const client of input.dashboardClients) {
    if (client.immediateFocusCount <= 0) continue;
    items.push({
      id: `focus:${client.clientId}`,
      kind: "client_focus",
      title: "Immediate focus items",
      entityLabel: client.companyName,
      reason: `${client.immediateFocusCount} portfolio focus signal${client.immediateFocusCount === 1 ? "" : "s"}`,
      dateLabel: null,
      href: clientTechnologyProfilePath(client.clientId),
      sortAt: input.now.toISOString(),
    });
  }

  return items;
}
