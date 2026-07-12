"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import {
  InvoiceStatusBadge,
  formatBillingMoney,
} from "@/components/billing/billing-ui";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvoiceStatus } from "@/generated/prisma/client";

type InvoiceListViewProps = {
  clientId: string;
  isStaff: boolean;
};

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  dueDate: string | null;
  issueDate: string | null;
  totalCents: number;
  amountPaidCents: number;
  balanceDueCents: number;
  status: InvoiceStatus;
  tip?: { title: string } | null;
  project?: { title: string } | null;
};

export function InvoiceListView({ clientId, isStaff }: InvoiceListViewProps) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/clients/${clientId}/billing/invoices`);
        if (!cancelled && res.ok) {
          const body = (await res.json()) as { invoices: InvoiceRow[] };
          setInvoices(body.invoices);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const filtered = invoices.filter((invoice) => {
    if (statusFilter !== "all" && invoice.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const related = invoice.tip?.title ?? invoice.project?.title ?? "";
      return (
        invoice.invoiceNumber.toLowerCase().includes(q) ||
        related.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/clients/${clientId}/billing`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← Billing
          </Link>
          <h2 className="page-title mt-2">Invoices</h2>
        </div>
        {isStaff ? (
          <Link
            href={`/clients/${clientId}/billing/invoices/new`}
            className={buttonClassName({ variant: "default" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search invoices…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {isStaff ? (
            <>
              <option value="draft">Draft</option>
              <option value="ready_to_send">Ready to Send</option>
            </>
          ) : null}
          <option value="sent">Sent</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{filtered.length} invoice(s)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading…
            </div>
          ) : (
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Invoice</th>
                  <th className="pb-2 pr-4 font-medium">Related</th>
                  <th className="pb-2 pr-4 font-medium">Issue</th>
                  <th className="pb-2 pr-4 font-medium">Due</th>
                  <th className="pb-2 pr-4 font-medium">Total</th>
                  <th className="pb-2 pr-4 font-medium">Paid</th>
                  <th className="pb-2 pr-4 font-medium">Balance</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No invoices match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border/60">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/clients/${clientId}/billing/invoices/${invoice.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {invoice.tip?.title ?? invoice.project?.title ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {invoice.issueDate
                          ? new Date(invoice.issueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {formatBillingMoney(invoice.totalCents)}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {formatBillingMoney(invoice.amountPaidCents)}
                      </td>
                      <td className="py-3 pr-4 tabular-nums font-medium">
                        {formatBillingMoney(invoice.balanceDueCents)}
                      </td>
                      <td className="py-3">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
