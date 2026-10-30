/**
 * SS-ADMIN-005 — Leads hub summaries.
 * Keeps TechnologySnapshotLead, WebsiteLead, and Prospect separate.
 */

import { listProspects } from "@/lib/communications/outreach/prospects";
import { getTechnologySnapshotLeadSummaryStats } from "@/lib/technology-snapshot/lead-admin";
import { getWebsiteLeadSummaryStats } from "@/lib/website-leads/service";

export type LeadsHubSnapshotPanel = {
  newLeads: number;
  contacted: number;
  assessmentInvitationsSent: number;
  converted: number;
  followUpNeeded: number;
  /** new + follow_up — awaiting staff follow-up */
  awaitingFollowUp: number;
};

export type LeadsHubWebsitePanel = {
  total: number;
  newLeads: number;
  contacted: number;
  qualified: number;
  converted: number;
};

export type LeadsHubProspectsPanel = {
  /** null when count could not be loaded safely */
  total: number | null;
  newCount: number | null;
};

export type LeadsHubSummary = {
  snapshot: LeadsHubSnapshotPanel;
  website: LeadsHubWebsitePanel;
  prospects: LeadsHubProspectsPanel;
  generatedAt: string;
};

/**
 * Admin-only hub loader. Does not merge models or invent combined totals.
 */
export async function getLeadsHubSummary(): Promise<LeadsHubSummary> {
  const [snapshotStats, websiteStats, prospectsAll, prospectsNew] = await Promise.all([
    getTechnologySnapshotLeadSummaryStats(),
    getWebsiteLeadSummaryStats(),
    listProspects({ limit: 1 }).catch(() => null),
    listProspects({ status: "new", limit: 1 }).catch(() => null),
  ]);

  return {
    snapshot: {
      newLeads: snapshotStats.newLeads,
      contacted: snapshotStats.contacted,
      assessmentInvitationsSent: snapshotStats.assessmentInvitationsSent,
      converted: snapshotStats.converted,
      followUpNeeded: snapshotStats.followUpNeeded,
      awaitingFollowUp: snapshotStats.newLeads + snapshotStats.followUpNeeded,
    },
    website: {
      total: websiteStats.total,
      newLeads: websiteStats.newLeads,
      contacted: websiteStats.contacted,
      qualified: websiteStats.qualified,
      converted: websiteStats.converted,
    },
    prospects: {
      total: prospectsAll?.total ?? null,
      newCount: prospectsNew?.total ?? null,
    },
    generatedAt: new Date().toISOString(),
  };
}
