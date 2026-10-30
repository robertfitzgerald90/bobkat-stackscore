import type { Rating } from "@/generated/prisma/client";
import type { ActivityFeedItem } from "@/lib/communications/activity/record-activity";
import type { DashboardClientRow, DashboardSummary } from "@/lib/dashboard/types";

/** Business Pulse KPIs — SS-ADMIN-004. */
export type CommandCenterPulse = {
  totalClients: number;
  activeAssessments: number;
  completedAssessments: number;
  activeProjects: number;
  /** null when role cannot see lead metrics (technician). */
  openLeads: number | null;
  openLeadsBreakdown: { snapshot: number; website: number } | null;
  recurringServiceClients: number;
};

export type CommandCenterAttentionKind =
  | "assessment_draft"
  | "overdue_task"
  | "overdue_milestone"
  | "customer_update_draft"
  | "lead_follow_up"
  | "client_focus";

export type CommandCenterAttentionItem = {
  id: string;
  kind: CommandCenterAttentionKind;
  title: string;
  entityLabel: string;
  reason: string;
  dateLabel: string | null;
  href: string;
  /** ISO timestamp used for deterministic overdue-first then age ordering. */
  sortAt: string;
};

export type CommandCenterPortfolioRow = DashboardClientRow & {
  lastAssessedAt: string | null;
};

export type CommandCenterProjectRow = {
  projectId: string;
  title: string;
  clientId: string;
  clientName: string;
  status: string;
  progressPercent: number | null;
  overdueTaskCount: number;
  upcomingMilestoneLabel: string | null;
  href: string;
  targetCompletionDate: string | null;
};

export type CommandCenterDeliverySummary = {
  activeProjectCount: number;
  overdueTaskCount: number;
  overdueMilestoneCount: number;
  recentlyCompletedCount: number;
  projects: CommandCenterProjectRow[];
};

export type CommandCenterQuickAction = {
  id: string;
  label: string;
  href: string;
  description: string;
};

export type CommandCenterSummary = {
  pulse: CommandCenterPulse;
  attention: CommandCenterAttentionItem[];
  portfolio: CommandCenterPortfolioRow[];
  scoreDistribution: Record<Rating, number>;
  delivery: CommandCenterDeliverySummary;
  activity: ActivityFeedItem[];
  quickActions: CommandCenterQuickAction[];
  /** Underlying dashboard summary for shared portfolio KPI narrative. */
  dashboard: DashboardSummary;
  generatedAt: string;
  role: string;
};
