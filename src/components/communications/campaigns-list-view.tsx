"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CommunicationsPageHeader,
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";
import { useQuickInvite } from "@/components/communications/quick-invite-provider";
import { buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/communications/outreach/labels";

export type CampaignListItem = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  templateKey: string;
  createdAt: string;
  createdBy: { id: string; name: string };
  _count: { recipients: number };
  metrics: {
    recipientCount: number;
    invitationsSent: number;
    opens: number;
    clicks: number;
    assessmentStarts: number;
    assessmentCompletions: number;
    conversionRate: number | null;
  };
};

export function CampaignsListView({ campaigns }: { campaigns: CampaignListItem[] }) {
  const { openQuickInvite } = useQuickInvite();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    return campaigns.filter((campaign) => {
      if (status && campaign.status !== status) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        campaign.name.toLowerCase().includes(q) ||
        (campaign.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [campaigns, search, status]);

  return (
    <div className="space-y-6">
      <CommunicationsPageHeader
        title="Campaigns"
        description="Manage assessment invitation campaigns and track conversion through the funnel."
        actions={
          <>
            <Link href="/admin/communications/campaigns/new" className={buttonClassName({})}>
              New Campaign
            </Link>
            <button type="button" className={buttonClassName({ variant: "outline" })} onClick={() => openQuickInvite()}>
              Quick Invite
            </button>
          </>
        }
      />

      <CommunicationsPanel>
        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            {Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Opens</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Conversion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <Link
                    href={`/admin/communications/campaigns/${campaign.id}`}
                    className="font-medium text-[#082F5B] hover:underline"
                  >
                    {campaign.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{campaign.createdBy.name}</p>
                </TableCell>
                <TableCell>
                  <StatusPill tone="info">
                    {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
                  </StatusPill>
                </TableCell>
                <TableCell>{campaign.metrics.recipientCount}</TableCell>
                <TableCell>{campaign.metrics.invitationsSent}</TableCell>
                <TableCell>{campaign.metrics.opens}</TableCell>
                <TableCell>{campaign.metrics.assessmentStarts}</TableCell>
                <TableCell>{campaign.metrics.assessmentCompletions}</TableCell>
                <TableCell>
                  {campaign.metrics.conversionRate === null
                    ? "—"
                    : `${campaign.metrics.conversionRate}%`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CommunicationsPanel>
    </div>
  );
}
