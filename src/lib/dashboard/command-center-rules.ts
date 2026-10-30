/**
 * Pure SS-ADMIN-004 Command Center rules — no Prisma.
 * Open Intake Leads = Snapshot (new + follow_up) + Website (NEW). Prospect omitted.
 */

import type {
  CommandCenterAttentionItem,
  CommandCenterQuickAction,
} from "@/lib/dashboard/command-center-types";

export function countOpenLeads(snapshotOpen: number, websiteNew: number): number {
  return Math.max(0, snapshotOpen) + Math.max(0, websiteNew);
}

/** Snapshot statuses that require follow-up without inventing new lifecycle values. */
export const SNAPSHOT_OPEN_LEAD_STATUSES = ["new", "follow_up"] as const;

/** Website statuses counted as open follow-up (canonical NEW only). */
export const WEBSITE_OPEN_LEAD_STATUSES = ["NEW"] as const;

export function sortAttentionItems(
  items: readonly CommandCenterAttentionItem[],
): CommandCenterAttentionItem[] {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(left.sortAt);
    const rightTime = Date.parse(right.sortAt);
    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return left.title.localeCompare(right.title);
    if (Number.isNaN(leftTime)) return 1;
    if (Number.isNaN(rightTime)) return -1;
    if (leftTime !== rightTime) return leftTime - rightTime;
    return left.title.localeCompare(right.title);
  });
}

export function buildCommandCenterQuickActions(role: string): CommandCenterQuickAction[] {
  const isAdmin = role === "admin";
  const actions: CommandCenterQuickAction[] = [
    {
      id: "clients",
      label: "Open Clients",
      href: "/clients",
      description: "Client directory",
    },
    {
      id: "projects",
      label: "Open Projects",
      href: "/projects",
      description: "Delivery register",
    },
    {
      id: "assessments",
      label: "Start Assessment",
      href: "/assessments",
      description: "Global assessments",
    },
  ];

  if (isAdmin) {
    actions.push({
      id: "leads",
      label: "Review Leads",
      href: "/leads",
      description: "Intake leads hub",
    });
  }

  actions.push(
    {
      id: "communications",
      label: "Open Communications",
      href: "/admin/communications",
      description: "Campaigns & history",
    },
    {
      id: "recurring",
      label: "Recurring Services",
      href: "/admin/vcio",
      description: "vCIO relationships",
    },
  );

  return actions.slice(0, 6);
}

export function formatShortDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isTaskIncompleteStatus(status: string): boolean {
  return status !== "completed";
}
