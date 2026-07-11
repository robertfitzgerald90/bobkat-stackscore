"use client";

import Link from "next/link";
import {
  CommunicationsPageHeader,
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";
import { useQuickInvite } from "@/components/communications/quick-invite-provider";
import { buttonClassName } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CAMPAIGN_EVENT_LABELS, CAMPAIGN_STATUS_LABELS } from "@/lib/communications/outreach/labels";

type CampaignDetailViewProps = {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    templateKey: string;
    createdAt: string;
    createdBy: { name: string; email: string };
    metrics: {
      recipientCount: number;
      invitationsSent: number;
      delivered: number;
      opens: number;
      clicks: number;
      assessmentStarts: number;
      assessmentCompletions: number;
      deliveryRate: number | null;
      openRate: number | null;
      clickRate: number | null;
      assessmentStartRate: number | null;
      assessmentCompletionRate: number | null;
      conversionRate: number | null;
    };
    recipients: Array<{
      id: string;
      invitedAt: string | null;
      openedAt: string | null;
      clickedAt: string | null;
      assessmentStartedAt: string | null;
      assessmentCompletedAt: string | null;
      prospect: {
        id: string;
        firstName: string;
        lastName: string;
        company: string;
        email: string;
        status: string;
      };
      message: { id: string; status: string; sentAt: string | null } | null;
    }>;
  };
  timeline: Array<{
    id: string;
    eventType: string;
    title: string;
    description: string | null;
    occurredAt: string;
    actorName: string | null;
    prospectName: string | null;
  }>;
};

export function CampaignDetailView({ campaign, timeline }: CampaignDetailViewProps) {
  const { openQuickInvite } = useQuickInvite();

  const metricCards = [
    { label: "Invitations Sent", value: campaign.metrics.invitationsSent },
    { label: "Delivery Rate", value: campaign.metrics.deliveryRate === null ? "—" : `${campaign.metrics.deliveryRate}%` },
    { label: "Open Rate", value: campaign.metrics.openRate === null ? "—" : `${campaign.metrics.openRate}%` },
    { label: "Click Rate", value: campaign.metrics.clickRate === null ? "—" : `${campaign.metrics.clickRate}%` },
    { label: "Start Rate", value: campaign.metrics.assessmentStartRate === null ? "—" : `${campaign.metrics.assessmentStartRate}%` },
    { label: "Completion Rate", value: campaign.metrics.assessmentCompletionRate === null ? "—" : `${campaign.metrics.assessmentCompletionRate}%` },
  ];

  return (
    <div className="space-y-6">
      <CommunicationsPageHeader
        title={campaign.name}
        description={campaign.description ?? "Assessment invitation campaign"}
        actions={
          <>
            <button
              type="button"
              className={buttonClassName({})}
              onClick={() => openQuickInvite({ campaignId: campaign.id })}
            >
              Quick Invite to Campaign
            </button>
            <Link href="/admin/communications/campaigns" className={buttonClassName({ variant: "outline" })}>
              Back to Campaigns
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusPill tone="info">{CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}</StatusPill>
        <span className="text-sm text-muted-foreground">Template: {campaign.templateKey}</span>
        <span className="text-sm text-muted-foreground">Created by {campaign.createdBy.name}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[#1e3a5f]/10 bg-card p-4">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#082F5B]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CommunicationsPanel title="Recipients">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prospect</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.recipients.map((recipient) => (
                <TableRow key={recipient.id}>
                  <TableCell>
                    <Link
                      href={`/admin/communications/prospects/${recipient.prospect.id}`}
                      className="font-medium text-[#082F5B] hover:underline"
                    >
                      {recipient.prospect.firstName} {recipient.prospect.lastName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{recipient.prospect.company}</p>
                  </TableCell>
                  <TableCell>{recipient.invitedAt ? "Yes" : "—"}</TableCell>
                  <TableCell>{recipient.openedAt ? "Yes" : "—"}</TableCell>
                  <TableCell>{recipient.assessmentStartedAt ? "Yes" : "—"}</TableCell>
                  <TableCell>{recipient.assessmentCompletedAt ? "Yes" : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CommunicationsPanel>

        <CommunicationsPanel title="Campaign Timeline">
          <div className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              timeline.map((event) => (
                <div key={event.id} className="border-l-2 border-[#082F5B]/20 pl-4">
                  <p className="font-medium text-[#082F5B]">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {CAMPAIGN_EVENT_LABELS[event.eventType] ?? event.eventType} ·{" "}
                    {new Date(event.occurredAt).toLocaleString()}
                  </p>
                  {event.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CommunicationsPanel>
      </div>
    </div>
  );
}
