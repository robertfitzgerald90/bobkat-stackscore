"use client";

import Link from "next/link";
import { Megaphone, Upload, UserPlus, Users } from "lucide-react";
import {
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

export function OutreachDashboardSection({ stats }: { stats: OutreachDashboardStats }) {
  const quickInvite = useQuickInviteOptional();

  const cards = [
    { label: "Active Campaigns", value: stats.activeCampaigns },
    { label: "Invitations Sent", value: stats.invitationsSent },
    { label: "Assessments Started", value: stats.assessmentsStarted },
    { label: "Assessments Completed", value: stats.assessmentsCompleted },
    {
      label: "Conversion Rate",
      value: stats.conversionRate === null ? "—" : `${stats.conversionRate}%`,
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
              className={buttonClassName({ variant: "default", className: "bg-[#082F5B] hover:bg-[#062646]" })}
              onClick={() => quickInvite?.openQuickInvite()}
            >
              <UserPlus className="size-4" />
              Quick Invite
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[#1e3a5f]/10 bg-card p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#082F5B]">{card.value}</p>
          </div>
        ))}
      </div>

      <CommunicationsPanel title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonClassName({ variant: "default", className: "bg-[#082F5B] hover:bg-[#062646]" })}
            onClick={() => quickInvite?.openQuickInvite()}
          >
            <UserPlus className="size-4" />
            Quick Invite
          </button>
          <Link href="/admin/communications/campaigns/new" className={buttonClassName({ variant: "outline" })}>
            <Megaphone className="size-4" />
            New Campaign
          </Link>
          <Link href="/admin/communications/prospects/import" className={buttonClassName({ variant: "outline" })}>
            <Upload className="size-4" />
            Import CSV
          </Link>
          <Link href="/admin/communications/prospects" className={buttonClassName({ variant: "outline" })}>
            <Users className="size-4" />
            Browse Prospects
          </Link>
          <Link
            href="/admin/communications/templates/EMAIL-009"
            className={buttonClassName({ variant: "outline" })}
          >
            Preview Invitation
          </Link>
        </div>
      </CommunicationsPanel>

      <CommunicationsPanel title="Recent Campaigns">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Conversion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.recentCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No campaigns yet. Use Quick Invite to send your first assessment invitation.
                </TableCell>
              </TableRow>
            ) : (
              stats.recentCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Link
                      href={`/admin/communications/campaigns/${campaign.id}`}
                      className="font-medium text-[#082F5B] hover:underline"
                    >
                      {campaign.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">by {campaign.createdByName}</p>
                  </TableCell>
                  <TableCell>
                    <StatusPill tone="info">
                      {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
                    </StatusPill>
                  </TableCell>
                  <TableCell>{campaign.recipientCount}</TableCell>
                  <TableCell>{campaign.metrics.invitationsSent}</TableCell>
                  <TableCell>{campaign.metrics.assessmentCompletions}</TableCell>
                  <TableCell>
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
