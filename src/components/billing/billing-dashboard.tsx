"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import {
  BillingAttentionList,
  BillingMetricCard,
  InvoiceStatusBadge,
  formatBillingMoney,
} from "@/components/billing/billing-ui";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvoiceStatus } from "@/generated/prisma/client";

type BillingDashboardProps = {
  clientId: string;
  isStaff: boolean;
};

type Overview = {
  outstandingBalanceCents: number;
  overdueBalanceCents: number;
  paidYearToDateCents: number;
  monthlyRecurringRevenueCents: number;
  annualRecurringRevenueCents: number;
  draftInvoices: number;
  failedPayments: number;
  depositsAwaitingPayment: number;
  attention: {
    overdueInvoices: Array<{ id: string; invoiceNumber: string; balanceDueCents: number }>;
    draftInvoicesWaiting: Array<{ id: string; invoiceNumber: string; totalCents: number }>;
    partiallyPaidInvoices: Array<{ id: string; invoiceNumber: string; balanceDueCents: number }>;
    approvedPlansWithoutDeposits: Array<{ id: string; title: string }>;
  };
};

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  dueDate: string | null;
  totalCents: number;
  balanceDueCents: number;
  status: InvoiceStatus;
};

export function BillingDashboard({ clientId, isStaff }: BillingDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [overviewRes, invoicesRes] = await Promise.all([
          fetch(`/api/v1/clients/${clientId}/billing/overview`),
          fetch(`/api/v1/clients/${clientId}/billing/invoices`),
        ]);
        if (!cancelled && overviewRes.ok) {
          const body = (await overviewRes.json()) as { overview: Overview };
          setOverview(body.overview);
        }
        if (!cancelled && invoicesRes.ok) {
          const body = (await invoicesRes.json()) as { invoices: InvoiceRow[] };
          setInvoices(body.invoices.slice(0, 8));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading billing…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Billing</h2>
          <p className="page-description">Invoices, payments, deposits, and recurring services</p>
        </div>
        {isStaff ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/clients/${clientId}/billing/invoices/new`}
              className={buttonClassName({ variant: "default" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
            <Link
              href={`/clients/${clientId}/billing/invoices`}
              className={buttonClassName({ variant: "outline" })}
            >
              All Invoices
            </Link>
          </div>
        ) : null}
      </div>

      {overview ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BillingMetricCard
            label="Outstanding Balance"
            value={formatBillingMoney(overview.outstandingBalanceCents)}
            highlight
          />
          <BillingMetricCard
            label="Overdue Balance"
            value={formatBillingMoney(overview.overdueBalanceCents)}
          />
          <BillingMetricCard
            label="Paid Year to Date"
            value={formatBillingMoney(overview.paidYearToDateCents)}
          />
          <BillingMetricCard
            label="Monthly Recurring Revenue"
            value={formatBillingMoney(overview.monthlyRecurringRevenueCents)}
          />
          <BillingMetricCard label="Draft Invoices" value={String(overview.draftInvoices)} />
          <BillingMetricCard label="Failed Payments" value={String(overview.failedPayments)} />
          <BillingMetricCard
            label="Deposits Awaiting Payment"
            value={String(overview.depositsAwaitingPayment)}
          />
          <BillingMetricCard label="ARR" value={formatBillingMoney(overview.annualRecurringRevenueCents)} />
        </div>
      ) : null}

      {isStaff && overview?.attention ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <BillingAttentionList
            title="Overdue Invoices"
            emptyMessage="No overdue invoices."
            hrefBuilder={(id) => `/clients/${clientId}/billing/invoices/${id}`}
            items={overview.attention.overdueInvoices.map((i) => ({
              id: i.id,
              label: i.invoiceNumber,
              meta: formatBillingMoney(i.balanceDueCents),
            }))}
          />
          <BillingAttentionList
            title="Draft Invoices Waiting to Send"
            emptyMessage="No draft invoices."
            hrefBuilder={(id) => `/clients/${clientId}/billing/invoices/${id}`}
            items={overview.attention.draftInvoicesWaiting.map((i) => ({
              id: i.id,
              label: i.invoiceNumber,
              meta: formatBillingMoney(i.totalCents),
            }))}
          />
          <BillingAttentionList
            title="Partially Paid"
            emptyMessage="No partially paid invoices."
            hrefBuilder={(id) => `/clients/${clientId}/billing/invoices/${id}`}
            items={overview.attention.partiallyPaidInvoices.map((i) => ({
              id: i.id,
              label: i.invoiceNumber,
              meta: formatBillingMoney(i.balanceDueCents),
            }))}
          />
          <BillingAttentionList
            title="Approved Plans Without Deposits"
            emptyMessage="All approved plans have deposit coverage."
            items={overview.attention.approvedPlansWithoutDeposits.map((t) => ({
              id: t.id,
              label: t.title,
            }))}
          />
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Invoice</th>
                <th className="pb-2 pr-4 font-medium">Due</th>
                <th className="pb-2 pr-4 font-medium">Total</th>
                <th className="pb-2 pr-4 font-medium">Balance</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No invoices yet.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
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
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{formatBillingMoney(invoice.totalCents)}</td>
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
        </CardContent>
      </Card>
    </div>
  );
}
