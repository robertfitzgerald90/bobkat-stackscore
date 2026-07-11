"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Megaphone,
  Percent,
  Send,
  Target,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import {
  CommunicationsEmptyState,
  CommunicationsMetricsGrid,
  CommunicationsPageHeader,
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";
import { useQuickInviteOptional } from "@/components/communications/quick-invite-provider";
import { buttonClassName } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/communications/outreach/labels";

export type OutreachDashboardStats = {
  activeCampaigns: number;
  invitationsSent: number;
  assessmentsStarted: number;
  assessmentsCompleted: number;
  conversionRate: number | null;
  recentCampaigns: Array<{
    id: string;
    name: string;
    status: string;
    recipientCount: number;
    createdAt: string;
    createdByName: string;
    metrics: {
      invitationsSent: number;
      assessmentCompletions: number;
      conversionRate: number | null;
    };
  }>;
};

function campaignStatusTone(status: string): "success" | "warning" | "neutral" | "info" {
  if (status === "completed" || status === "active") return "success";
  if (status === "draft" || status === "paused") return "warning";
  if (status === "ready") return "info";
  return "neutral";
}

export function OutreachDashboardSection({ stats }: { stats: OutreachDashboardStats }) {
  const quickInvite = useQuickInviteOptional();

  const metrics = [
    { label: "Active Campaigns", value: stats.activeCampaigns, icon: Megaphone },
    { label: "Invitations Sent", value: stats.invitationsSent, icon: Send },
    { label: "Assessments Started", value: stats.assessmentsStarted, icon: Target },
    { label: "Assessments Completed", value: stats.assessmentsCompleted, icon: CheckCircle2 },
    {
      label: "Conversion Rate",
      value: stats.conversionRate === null ? "—" : `${stats.conversionRate}%`,
      icon: Percent,
    },
  ];

  return (
    <div className="space-y-6">
      <CommunicationsPageHeader
        title="Outreach & Campaigns"
        description="Quick Invite prospects into StackScore and track invitation performance through assessment completion."
        actions={
          <>
            <Link
              href="/admin/communications/campaigns/new"
              className={buttonClassName({ variant: "outline" })}
            >
              <Megaphone className="size-4" />
              New Campaign
            </Link>
            <button
              type="button"
              className={buttonClassName({ variant: "default" })}
              onClick={() => quickInvite?.openQuickInvite()}
            >
              <UserPlus className="size-4" />
              Quick Invite
            </button>
          </>
        }
      />

      <CommunicationsMetricsGrid metrics={metrics} columns={5} />

      <CommunicationsPanel title="Quick Actions" compact>
        <div className="action-bar-start gap-2">
          <button
            type="button"
            className={buttonClassName({ variant: "default", size: "sm" })}
            onClick={() => quickInvite?.openQuickInvite()}
          >
            <UserPlus className="size-4" />
            Quick Invite
          </button>
          <Link
            href="/admin/communications/campaigns/new"
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <Megaphone className="size-4" />
            New Campaign
          </Link>
          <Link
            href="/admin/communications/prospects/import"
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <Upload className="size-4" />
            Import CSV
          </Link>
          <Link
            href="/admin/communications/prospects"
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <Users className="size-4" />
            Browse Prospects
          </Link>
          <Link
            href="/admin/communications/templates/EMAIL-009"
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            Preview Invitation
          </Link>
        </div>
      </CommunicationsPanel>

      <CommunicationsPanel title="Recent Campaigns" contentClassName="p-0 sm:p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5">Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead className="pr-5">Conversion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.recentCampaigns.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-5">
                  <CommunicationsEmptyState
                    title="No campaigns yet"
                    description="Use Quick Invite to send your first assessment invitation."
                  />
                </TableCell>
              </TableRow>
            ) : (
              stats.recentCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="px-5">
                    <Link
                      href={`/admin/communications/campaigns/${campaign.id}`}
                      className="font-medium text-foreground hover:text-link hover:underline"
                    >
                      {campaign.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">by {campaign.createdByName}</p>
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={campaignStatusTone(campaign.status)}>
                      {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
                    </StatusPill>
                  </TableCell>
                  <TableCell className="tabular-nums text-foreground">{campaign.recipientCount}</TableCell>
                  <TableCell className="tabular-nums text-foreground">
                    {campaign.metrics.invitationsSent}
                  </TableCell>
                  <TableCell className="tabular-nums text-foreground">
                    {campaign.metrics.assessmentCompletions}
                  </TableCell>
                  <TableCell className="pr-5 tabular-nums text-foreground">
                    {campaign.metrics.conversionRate === null
                      ? "—"
                      : `${campaign.metrics.conversionRate}%`}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CommunicationsPanel>
    </div>
  );
}
