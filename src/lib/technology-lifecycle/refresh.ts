import type { TechnologyLifecycleStatus } from "@/generated/prisma/client";
import type { LifecycleRefreshEvent } from "./types";

type TechnologyRefreshInput = {
  id: string;
  displayName: string | null;
  technologyName: string;
  categoryName: string;
  lifecycleStatus: TechnologyLifecycleStatus;
  warrantyExpiresAt: Date | null;
  licenseRenewalDate: Date | null;
  renewalDate: Date | null;
  plannedReplacementDate: Date | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HORIZON_DAYS = 365;

function daysUntil(date: Date, now: Date): number {
  return Math.ceil((date.getTime() - now.getTime()) / MS_PER_DAY);
}

function urgency(days: number): LifecycleRefreshEvent["urgency"] {
  if (days < 0) return "overdue";
  if (days <= 90) return "upcoming";
  return "planned";
}

export function buildRefreshEvents(
  technologies: TechnologyRefreshInput[],
  now: Date = new Date(),
): LifecycleRefreshEvent[] {
  const events: LifecycleRefreshEvent[] = [];

  for (const tech of technologies) {
    const title = tech.displayName?.trim() || tech.technologyName;

    const candidates: Array<{
      eventType: LifecycleRefreshEvent["eventType"];
      dueDate: Date | null;
    }> = [
      { eventType: "warranty_expiration", dueDate: tech.warrantyExpiresAt },
      { eventType: "license_renewal", dueDate: tech.licenseRenewalDate },
      { eventType: "renewal", dueDate: tech.renewalDate },
      { eventType: "planned_replacement", dueDate: tech.plannedReplacementDate },
    ];

    if (
      tech.lifecycleStatus === "end_of_support" ||
      tech.lifecycleStatus === "end_of_sale"
    ) {
      candidates.push({
        eventType: "end_of_support",
        dueDate: tech.plannedReplacementDate ?? now,
      });
    }

    for (const candidate of candidates) {
      if (!candidate.dueDate) continue;
      const days = daysUntil(candidate.dueDate, now);
      if (days > HORIZON_DAYS) continue;

      events.push({
        id: `${tech.id}:${candidate.eventType}`,
        title,
        category: tech.categoryName,
        eventType: candidate.eventType,
        dueDate: candidate.dueDate.toISOString(),
        daysUntilDue: days,
        lifecycleStatus: tech.lifecycleStatus,
        urgency: urgency(days),
      });
    }
  }

  return events.sort((left, right) => left.daysUntilDue - right.daysUntilDue);
}
