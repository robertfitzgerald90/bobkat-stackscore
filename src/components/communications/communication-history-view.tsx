"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CommunicationsPageHeader,
  CommunicationsPanel,
  StatusPill,
} from "@/components/communications/communications-shell";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CommunicationHistoryRow } from "@/lib/communications/tracking/history-query";
import { listEmailTemplates } from "@/lib/communications/registry";

type CommunicationHistoryViewProps = {
  initialRows: CommunicationHistoryRow[];
  total: number;
  page: number;
  totalPages: number;
  filters: Record<string, string | undefined>;
};

export function CommunicationHistoryView({
  initialRows,
  total,
  page,
  totalPages,
  filters,
}: CommunicationHistoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(filters.query ?? "");
  const templates = useMemo(() => listEmailTemplates(), []);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    if (key !== "page") params.delete("page");
    router.push(`/admin/communications/history?${params.toString()}`);
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/admin/communications/history?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      <CommunicationsPageHeader
        title="Communication History"
        description="Every production and test email sent through StackScore with delivery and engagement status."
        actions={
          <Link href="/admin/communications/analytics" className={buttonClassName({ variant: "outline" })}>
            View Analytics
          </Link>
        }
      />

      <CommunicationsPanel>
        <div className="grid gap-3 lg:grid-cols-[1fr_repeat(4,minmax(0,160px))]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search recipient, organization, subject, template, ID..."
            onKeyDown={(event) => {
              if (event.key === "Enter") updateFilter("query", query);
            }}
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={filters.isTest ?? "production"}
            onChange={(event) => updateFilter("isTest", event.target.value)}
          >
            <option value="production">Production</option>
            <option value="test">Test only</option>
            <option value="all">All messages</option>
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={filters.status ?? "all"}
            onChange={(event) => updateFilter("status", event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="SENT">Sent</option>
            <option value="DELIVERED">Delivered</option>
            <option value="OPENED">Opened</option>
            <option value="CLICKED">Clicked</option>
            <option value="FAILED">Failed</option>
            <option value="BOUNCED">Bounced</option>
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={filters.templateKey ?? "all"}
            onChange={(event) => updateFilter("templateKey", event.target.value)}
          >
            <option value="all">All templates</option>
            {templates.map((template) => (
              <option key={template.key} value={template.key}>
                {template.key}
              </option>
            ))}
          </select>
          <Button type="button" onClick={() => updateFilter("query", query)}>
            Search
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-[#1e3a5f]/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sent</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Related</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No communication records match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                initialRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm">
                      {row.sentAt ? new Date(row.sentAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{row.recipientEmail}</p>
                        {row.recipientName ? (
                          <p className="text-xs text-muted-foreground">{row.recipientName}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{row.organizationName ?? "—"}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{row.templateName}</p>
                        <p className="text-xs text-muted-foreground">{row.templateKey}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{row.subject}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <StatusPill tone={statusTone(row.status)}>{row.statusLabel}</StatusPill>
                        {row.isTest ? <StatusPill tone="info">Test</StatusPill> : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.openCount} opens · {row.clickCount} clicks
                    </TableCell>
                    <TableCell className="text-sm">{row.relatedRecord ?? "—"}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/communications/history/${row.id}`}
                        className="text-sm font-medium text-[#082F5B] hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} message{total === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Previous
            </Button>
            <span>
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CommunicationsPanel>
    </div>
  );
}

function statusTone(status: string): "success" | "warning" | "neutral" | "info" {
  if (status === "DELIVERED" || status === "CLICKED") return "success";
  if (status === "FAILED" || status === "BOUNCED" || status === "COMPLAINED") return "warning";
  if (status === "OPENED") return "info";
  return "neutral";
}
