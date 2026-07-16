"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Search } from "lucide-react";
import {
  SnapshotLeadActions,
  SnapshotLeadPhoneCell,
} from "@/components/admin/snapshot-lead-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MobileDataCard, MobileDataRow } from "@/components/ui/mobile-data-card";
import type { TechnologySnapshotLead, TechnologySnapshotLeadStatus } from "@/generated/prisma/client";
import {
  ALL_SNAPSHOT_LEAD_STATUSES,
  formatSnapshotClassification,
  SNAPSHOT_LEAD_STATUS_LABELS,
  SNAPSHOT_MAX_SCORE,
} from "@/lib/technology-snapshot/display";
import type { SnapshotLeadSummaryStats } from "@/lib/technology-snapshot/lead-admin";
import { resolveLeadDisplayName } from "@/lib/technology-snapshot/contact-helpers";
import { toast } from "sonner";

type SnapshotLeadListItem = TechnologySnapshotLead & {
  notes?: Array<{ id: string; note: string; createdAt: Date | string }>;
};

type SnapshotLeadsManagementProps = {
  initialLeads: SnapshotLeadListItem[];
  initialStats: SnapshotLeadSummaryStats;
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString();
}

const CLASSIFICATION_OPTIONS = [
  { value: "all", label: "All risk levels" },
  { value: "healthy", label: "Healthy" },
  { value: "needs_attention", label: "Needs Attention" },
  { value: "elevated_risk", label: "Elevated Risk" },
  { value: "immediate_action", label: "Immediate Action" },
];

export function SnapshotLeadsManagement({
  initialLeads,
  initialStats,
}: SnapshotLeadsManagementProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [stats] = useState(initialStats);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classificationFilter, setClassificationFilter] = useState<string>("all");
  const [contactedFilter, setContactedFilter] = useState<string>("all");

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        resolveLeadDisplayName(lead).toLowerCase().includes(normalizedQuery) ||
        lead.companyName.toLowerCase().includes(normalizedQuery) ||
        lead.email.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesClassification =
        classificationFilter === "all" || lead.classification === classificationFilter;
      const matchesContacted =
        contactedFilter === "all" ||
        (contactedFilter === "yes" ? lead.contactedAt != null : lead.contactedAt == null);

      return matchesQuery && matchesStatus && matchesClassification && matchesContacted;
    });
  }, [classificationFilter, contactedFilter, leads, query, statusFilter]);

  async function updateStatus(id: string, status: TechnologySnapshotLeadStatus) {
    setUpdatingId(id);
    const response = await fetch(`/api/v1/snapshot-leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to update lead status");
      return;
    }

    const updated = (await response.json()) as TechnologySnapshotLead;
    setLeads((current) =>
      current.map((lead) => (lead.id === updated.id ? { ...lead, ...updated } : lead)),
    );
    toast.success("Lead status updated");
    router.refresh();
  }

  async function sendInvitation(id: string) {
    const response = await fetch(`/api/v1/snapshot-leads/${id}/send-invitation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = await response.json();
    if (!response.ok) {
      toast.error(payload.error ?? "Unable to send invitation");
      return;
    }

    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? { ...lead, ...(payload.lead as TechnologySnapshotLead) }
          : lead,
      ),
    );
    toast.success("Assessment invitation sent");
    router.refresh();
  }

  function openConvertDialog(leadId: string) {
    router.push(`/snapshot-leads/${leadId}?convert=1`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "New Leads", value: stats.newLeads },
          { label: "Contacted", value: stats.contacted },
          { label: "Assessment Invitations Sent", value: stats.assessmentInvitationsSent },
          { label: "Converted", value: stats.converted },
          { label: "Follow-Up Needed", value: stats.followUpNeeded },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snapshot Leads</CardTitle>
          <CardDescription>
            Public Technology Snapshot submissions for follow-up and conversion tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, company, or email"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ALL_SNAPSHOT_LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {SNAPSHOT_LEAD_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={classificationFilter}
              onValueChange={(value) => setClassificationFilter(value ?? "all")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Risk level" />
              </SelectTrigger>
              <SelectContent>
                {CLASSIFICATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="max-w-xs">
            <Select
              value={contactedFilter}
              onValueChange={(value) => setContactedFilter(value ?? "all")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Contacted" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All contact states</SelectItem>
                <SelectItem value="yes">Contacted</SelectItem>
                <SelectItem value="no">Not contacted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No snapshot leads match the current filters.</p>
          ) : (
            <>
              <div className="hidden min-w-0 lg:block">
                <div className="min-w-0 max-w-full overflow-x-auto lg:overflow-x-visible">
                  <Table className="table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[240px]">Company</TableHead>
                        <TableHead className="hidden min-w-[200px] lg:table-cell">Email</TableHead>
                        <TableHead className="hidden w-[1%] xl:table-cell">Phone</TableHead>
                        <TableHead className="w-[1%]">Score</TableHead>
                        <TableHead className="w-[1%]">Risk</TableHead>
                        <TableHead className="hidden w-[1%] md:table-cell">Submitted</TableHead>
                        <TableHead className="w-[1%]">Status</TableHead>
                        <TableHead className="w-[1%] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id} className="align-top">
                          <TableCell className="min-w-[240px] align-top whitespace-normal py-3">
                            <div className="space-y-1">
                              <Link
                                href={`/snapshot-leads/${lead.id}`}
                                className="break-words font-semibold text-foreground hover:text-primary hover:underline"
                              >
                                {lead.companyName}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {resolveLeadDisplayName(lead)}
                              </p>
                              {lead.notes?.[0] ? (
                                <p className="flex items-start gap-1 text-xs text-muted-foreground">
                                  <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                                  <span className="whitespace-normal break-words">
                                    {lead.notes[0].note}
                                  </span>
                                </p>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="hidden min-w-[180px] align-top whitespace-normal py-3 lg:table-cell">
                            <a
                              href={`mailto:${lead.email}`}
                              className="break-all text-primary hover:underline"
                            >
                              {lead.email}
                            </a>
                          </TableCell>
                          <TableCell className="hidden w-[1%] align-top whitespace-nowrap py-3 xl:table-cell">
                            <SnapshotLeadPhoneCell phone={lead.phone} />
                          </TableCell>
                          <TableCell className="w-[1%] align-top whitespace-nowrap py-3 tabular-nums">
                            {lead.totalScore}/{SNAPSHOT_MAX_SCORE}
                          </TableCell>
                          <TableCell className="w-[1%] align-top whitespace-nowrap py-3">
                            <Badge variant="outline">
                              {formatSnapshotClassification(lead.classification)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden w-[1%] align-top whitespace-nowrap py-3 text-sm text-muted-foreground md:table-cell">
                            {formatDate(lead.createdAt)}
                          </TableCell>
                          <TableCell className="w-[1%] align-top whitespace-nowrap py-3">
                            <Select
                              value={lead.status}
                              items={SNAPSHOT_LEAD_STATUS_LABELS}
                              onValueChange={(value) =>
                                updateStatus(
                                  lead.id,
                                  (value ?? lead.status) as TechnologySnapshotLeadStatus,
                                )
                              }
                              disabled={updatingId === lead.id}
                            >
                              <SelectTrigger className="w-auto min-w-[8.75rem]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ALL_SNAPSHOT_LEAD_STATUSES.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {SNAPSHOT_LEAD_STATUS_LABELS[status]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="w-[1%] align-top whitespace-nowrap py-3 text-right">
                            <SnapshotLeadActions
                              lead={lead}
                              onStatusChange={(status) => updateStatus(lead.id, status)}
                              onSendInvitation={() => sendInvitation(lead.id)}
                              onConvert={() => openConvertDialog(lead.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-3 lg:hidden">
                {filteredLeads.map((lead) => (
                  <MobileDataCard key={lead.id}>
                    <div className="space-y-1">
                      <Link
                        href={`/snapshot-leads/${lead.id}`}
                        className="break-words font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {lead.companyName}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {resolveLeadDisplayName(lead)}
                      </p>
                    </div>
                    <MobileDataRow label="Email">
                      <a href={`mailto:${lead.email}`} className="break-all text-primary hover:underline">
                        {lead.email}
                      </a>
                    </MobileDataRow>
                    <MobileDataRow label="Phone">
                      <SnapshotLeadPhoneCell phone={lead.phone} />
                    </MobileDataRow>
                    <MobileDataRow label="Score">
                      {lead.totalScore}/{SNAPSHOT_MAX_SCORE}
                    </MobileDataRow>
                    <MobileDataRow label="Risk level">
                      <Badge variant="outline">
                        {formatSnapshotClassification(lead.classification)}
                      </Badge>
                    </MobileDataRow>
                    <MobileDataRow label="Submitted">{formatDate(lead.createdAt)}</MobileDataRow>
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Select
                        value={lead.status}
                        items={SNAPSHOT_LEAD_STATUS_LABELS}
                        onValueChange={(value) =>
                          updateStatus(
                            lead.id,
                            (value ?? lead.status) as TechnologySnapshotLeadStatus,
                          )
                        }
                        disabled={updatingId === lead.id}
                      >
                        <SelectTrigger className="!w-full min-w-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_SNAPSHOT_LEAD_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {SNAPSHOT_LEAD_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-2">
                      <SnapshotLeadActions
                        lead={lead}
                        compact
                        onStatusChange={(status) => updateStatus(lead.id, status)}
                        onSendInvitation={() => sendInvitation(lead.id)}
                        onConvert={() => openConvertDialog(lead.id)}
                      />
                    </div>
                  </MobileDataCard>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
