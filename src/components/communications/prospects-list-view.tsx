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
import { LEAD_SOURCE_LABELS, PROSPECT_STATUS_LABELS } from "@/lib/communications/outreach/labels";

export type ProspectListItem = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string | null;
  industry: string | null;
  status: string;
  leadSource: string;
  createdAt: string;
  lastContactAt: string | null;
  createdByName: string | null;
};

export function ProspectsListView({
  prospects,
  industries,
}: {
  prospects: ProspectListItem[];
  industries: string[];
}) {
  const { openQuickInvite } = useQuickInvite();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [industry, setIndustry] = useState("");

  const filtered = useMemo(() => {
    return prospects.filter((prospect) => {
      if (status && prospect.status !== status) return false;
      if (industry && prospect.industry !== industry) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        prospect.firstName.toLowerCase().includes(q) ||
        prospect.lastName.toLowerCase().includes(q) ||
        prospect.company.toLowerCase().includes(q) ||
        prospect.email.toLowerCase().includes(q)
      );
    });
  }, [prospects, search, status, industry]);

  return (
    <div className="space-y-6">
      <CommunicationsPageHeader
        title="Prospects"
        description="Outreach contacts remain separate from active customers until account activation."
        actions={
          <>
            <button type="button" className={buttonClassName({})} onClick={() => openQuickInvite()}>
              Quick Invite
            </button>
            <Link href="/admin/communications/prospects/import" className={buttonClassName({ variant: "outline" })}>
              Import CSV
            </Link>
          </>
        }
      />

      <CommunicationsPanel>
        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            placeholder="Search name, company, email..."
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
            {Object.entries(PROSPECT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All industries</option>
            {industries.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Last Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((prospect) => (
              <TableRow key={prospect.id}>
                <TableCell>
                  <Link
                    href={`/admin/communications/prospects/${prospect.id}`}
                    className="font-medium text-[#082F5B] hover:underline"
                  >
                    {prospect.firstName} {prospect.lastName}
                  </Link>
                </TableCell>
                <TableCell>{prospect.company}</TableCell>
                <TableCell>{prospect.email}</TableCell>
                <TableCell>
                  <StatusPill tone="neutral">
                    {PROSPECT_STATUS_LABELS[prospect.status] ?? prospect.status}
                  </StatusPill>
                </TableCell>
                <TableCell>{LEAD_SOURCE_LABELS[prospect.leadSource] ?? prospect.leadSource}</TableCell>
                <TableCell>
                  {prospect.lastContactAt
                    ? new Date(prospect.lastContactAt).toLocaleDateString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CommunicationsPanel>
    </div>
  );
}
