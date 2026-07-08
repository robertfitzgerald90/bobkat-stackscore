"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  IT_MANAGEMENT_LABELS,
  SNAPSHOT_LEAD_STATUS_LABELS,
} from "@/lib/technology-snapshot/display";
import type { SnapshotItManagementModel } from "@/lib/technology-snapshot/types";
import { toast } from "sonner";

type SnapshotLeadsManagementProps = {
  initialLeads: TechnologySnapshotLead[];
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString();
}

export function SnapshotLeadsManagement({ initialLeads }: SnapshotLeadsManagementProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      current.map((lead) => (lead.id === updated.id ? updated : lead)),
    );
    toast.success("Lead status updated");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Snapshot Leads</CardTitle>
        <CardDescription>
          Public Technology Snapshot submissions for follow-up and conversion tracking.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">No snapshot leads yet.</p>
        ) : (
          <>
            <div className="hidden min-w-0 md:block">
              <div className="overflow-safe-x table-desktop">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>IT Model</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="min-w-0 max-w-[160px] break-words font-medium">
                          {lead.companyName}
                        </TableCell>
                        <TableCell className="min-w-0 break-words">{lead.contactName}</TableCell>
                        <TableCell className="min-w-0 break-words">{lead.email}</TableCell>
                        <TableCell className="min-w-0 break-words">{lead.industry}</TableCell>
                        <TableCell className="min-w-0 break-words text-sm">
                          {IT_MANAGEMENT_LABELS[lead.itManagementModel as SnapshotItManagementModel]}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatSnapshotClassification(lead.classification)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(lead.createdAt)}
                        </TableCell>
                        <TableCell>
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
                            <SelectTrigger className="!w-full min-w-[160px] max-w-[200px]">
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {leads.map((lead) => (
                <MobileDataCard key={lead.id}>
                  <p className="break-words font-semibold">{lead.companyName}</p>
                  <MobileDataRow label="Contact">{lead.contactName}</MobileDataRow>
                  <MobileDataRow label="Email">
                    <span className="break-all">{lead.email}</span>
                  </MobileDataRow>
                  <MobileDataRow label="Industry">{lead.industry}</MobileDataRow>
                  <MobileDataRow label="IT model">
                    {IT_MANAGEMENT_LABELS[lead.itManagementModel as SnapshotItManagementModel]}
                  </MobileDataRow>
                  <MobileDataRow label="Classification">
                    <Badge variant="outline">
                      {formatSnapshotClassification(lead.classification)}
                    </Badge>
                  </MobileDataRow>
                  <MobileDataRow label="Created">{formatDate(lead.createdAt)}</MobileDataRow>
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
                </MobileDataCard>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
