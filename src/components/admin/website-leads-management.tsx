"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Mail, Phone, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { WebsiteLead, WebsiteLeadSource, WebsiteLeadStatus } from "@/generated/prisma/client";
import { formatDisplayDate } from "@/lib/display";
import {
  ALL_WEBSITE_LEAD_SOURCES,
  ALL_WEBSITE_LEAD_STATUSES,
  formatWebsiteLeadSource,
  formatWebsiteLeadStatus,
} from "@/lib/website-leads/display";
import type { WebsiteLeadSummaryStats } from "@/lib/website-leads/service";

type WebsiteLeadListItem = WebsiteLead & {
  linkedClient?: { id: string; companyName: string; status: string } | null;
};

type WebsiteLeadsManagementProps = {
  initialLeads: WebsiteLeadListItem[];
  initialStats: WebsiteLeadSummaryStats;
};

function ContactCell({ lead }: { lead: WebsiteLeadListItem }) {
  return (
    <div className="space-y-1 text-sm">
      <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
        <Mail className="h-3.5 w-3.5" />
        {lead.email}
      </a>
      {lead.phone ? (
        <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <Phone className="h-3.5 w-3.5" />
          {lead.phone}
        </a>
      ) : null}
    </div>
  );
}

export function WebsiteLeadsManagement({
  initialLeads,
  initialStats,
}: WebsiteLeadsManagementProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const now = new Date();

    const filtered = initialLeads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        lead.name.toLowerCase().includes(normalizedQuery) ||
        (lead.company?.toLowerCase().includes(normalizedQuery) ?? false) ||
        lead.email.toLowerCase().includes(normalizedQuery) ||
        (lead.phone?.toLowerCase().includes(normalizedQuery) ?? false);

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;

      let matchesDate = true;
      if (dateFilter === "7d") {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 7);
        matchesDate = new Date(lead.submittedAt) >= cutoff;
      } else if (dateFilter === "30d") {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 30);
        matchesDate = new Date(lead.submittedAt) >= cutoff;
      }

      return matchesQuery && matchesStatus && matchesSource && matchesDate;
    });

    return filtered.sort((a, b) => {
      const aTime = new Date(a.submittedAt).getTime();
      const bTime = new Date(b.submittedAt).getTime();
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
  }, [dateFilter, initialLeads, query, sort, sourceFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total leads" value={initialStats.total} />
        <StatCard label="New" value={initialStats.newLeads} highlight />
        <StatCard label="Contacted" value={initialStats.contacted} />
        <StatCard label="Qualified" value={initialStats.qualified} />
        <StatCard label="Converted" value={initialStats.converted} />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg">Website Leads</CardTitle>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative md:col-span-2 xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, company, email, phone…"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ALL_WEBSITE_LEAD_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatWebsiteLeadStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value ?? "all")}>
              <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {ALL_WEBSITE_LEAD_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {formatWebsiteLeadSource(source)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value ?? "all")}>
              <SelectTrigger><SelectValue placeholder="Date" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(value) => setSort(value as "newest" | "oldest")}>
              <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Last contacted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No website leads match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.company ?? "—"}</TableCell>
                      <TableCell><ContactCell lead={lead} /></TableCell>
                      <TableCell>{formatWebsiteLeadSource(lead.source)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{formatWebsiteLeadStatus(lead.status)}</Badge>
                      </TableCell>
                      <TableCell>{formatDisplayDate(lead.submittedAt)}</TableCell>
                      <TableCell>{formatDisplayDate(lead.lastContactedAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/website-leads/${lead.id}`}
                          className={buttonClassName({ variant: "outline", size: "sm" })}
                        >
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {filteredLeads.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No website leads match the current filters.
              </p>
            ) : (
              filteredLeads.map((lead) => (
                <MobileDataCard key={lead.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.company ?? "No company"}</p>
                    </div>
                    <Badge variant="outline">{formatWebsiteLeadStatus(lead.status)}</Badge>
                  </div>
                  <MobileDataRow label="Email">{lead.email}</MobileDataRow>
                  <MobileDataRow label="Phone">{lead.phone ?? "—"}</MobileDataRow>
                  <MobileDataRow label="Source">{formatWebsiteLeadSource(lead.source)}</MobileDataRow>
                  <MobileDataRow label="Submitted">{formatDisplayDate(lead.submittedAt)}</MobileDataRow>
                  <MobileDataRow label="Last contacted">
                    {formatDisplayDate(lead.lastContactedAt)}
                  </MobileDataRow>
                  <Link
                    href={`/website-leads/${lead.id}`}
                    className={buttonClassName({ variant: "outline", className: "mt-2 w-full" })}
                  >
                    View lead
                  </Link>
                </MobileDataCard>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
