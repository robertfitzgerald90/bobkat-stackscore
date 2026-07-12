"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Loader2, Mail, Copy } from "lucide-react";
import {
  InvoiceStatusBadge,
  formatBillingMoney,
} from "@/components/billing/billing-ui";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { InvoiceStatus } from "@/generated/prisma/client";

type InvoiceDetailProps = {
  clientId: string;
  invoiceId: string;
  isStaff: boolean;
};

type InvoiceDetail = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string | null;
  dueDate: string | null;
  paymentTermsDays: number;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  creditCents: number;
  depositAppliedCents: number;
  totalCents: number;
  amountPaidCents: number;
  balanceDueCents: number;
  clientNotes: string | null;
  internalNotes: string | null;
  billToName: string | null;
  billToEmail: string | null;
  billToPhone: string | null;
  stripePaymentLinkUrl: string | null;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
    amountCents: number;
    category: string;
    clientNote: string | null;
  }>;
  paymentApplications: Array<{
    appliedCents: number;
    payment: {
      id: string;
      paymentDate: string;
      method: string;
      status: string;
      transactionReference: string | null;
    };
  }>;
  deliveries: Array<{
    id: string;
    status: string;
    recipientEmail: string;
    sentAt: string | null;
  }>;
  tip: { id: string; title: string } | null;
  project: { id: string; title: string } | null;
};

export function InvoiceDetailView({ clientId, invoiceId, isStaff }: InvoiceDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [acting, setActing] = useState(false);

  async function reload() {
    const res = await fetch(`/api/v1/clients/${clientId}/billing/invoices/${invoiceId}`);
    if (res.ok) {
      const body = (await res.json()) as { invoice: InvoiceDetail };
      setInvoice(body.invoice);
    }
  }

  useEffect(() => {
    void reload().finally(() => setLoading(false));
  }, [clientId, invoiceId]);

  async function runAction(action: string, extra?: Record<string, unknown>) {
    setActing(true);
    try {
      const res = await fetch(`/api/v1/clients/${clientId}/billing/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Action failed");
      }
      toast.success("Updated");
      await reload();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading invoice…
      </div>
    );
  }

  if (!invoice) {
    return <p className="text-muted-foreground">Invoice not found.</p>;
  }

  const pdfUrl = `/api/v1/clients/${clientId}/billing/invoices/${invoiceId}/pdf`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href={`/clients/${clientId}/billing`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← Billing
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="page-title">{invoice.invoiceNumber}</h2>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="page-description">
            {invoice.billToName ?? "Client"} · Due{" "}
            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={pdfUrl} className={buttonClassName({ variant: "outline" })}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </a>
          {!isStaff && invoice.stripePaymentLinkUrl ? (
            <a href={invoice.stripePaymentLinkUrl} className={buttonClassName({ variant: "default" })}>
              Pay Invoice
            </a>
          ) : null}
          {isStaff ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={acting}
                onClick={() => runAction("send")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Invoice
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={acting}
                onClick={async () => {
                  const res = await fetch(
                    `/api/v1/clients/${clientId}/billing/invoices/${invoiceId}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "checkout" }),
                    },
                  );
                  const body = (await res.json()) as { url?: string };
                  if (body.url) {
                    await navigator.clipboard.writeText(body.url);
                    toast.success("Payment link copied");
                    await reload();
                  }
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Payment Link
              </Button>
              {invoice.status === "draft" ? (
                <Button type="button" disabled={acting} onClick={() => runAction("ready")}>
                  Mark Ready to Send
                </Button>
              ) : null}
              {!["voided", "paid"].includes(invoice.status) ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={acting}
                  onClick={() => runAction("void", { voidReason: "Voided by user" })}
                >
                  Void
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 pr-4 text-right">Qty</th>
                  <th className="pb-2 pr-4 text-right">Unit</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((line) => (
                  <tr key={line.id} className="border-b border-border/60">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{line.description}</p>
                      {line.clientNote ? (
                        <p className="mt-1 text-xs text-muted-foreground">{line.clientNote}</p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">{line.quantity}</td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {formatBillingMoney(line.unitPriceCents)}
                    </td>
                    <td className="py-3 text-right tabular-nums font-medium">
                      {formatBillingMoney(line.amountCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <SummaryRow label="Subtotal" value={formatBillingMoney(invoice.subtotalCents)} />
            {invoice.discountCents > 0 ? (
              <SummaryRow label="Discount" value={`-${formatBillingMoney(invoice.discountCents)}`} />
            ) : null}
            {invoice.taxCents > 0 ? (
              <SummaryRow label="Tax" value={formatBillingMoney(invoice.taxCents)} />
            ) : null}
            {invoice.depositAppliedCents > 0 ? (
              <SummaryRow
                label="Deposit applied"
                value={`-${formatBillingMoney(invoice.depositAppliedCents)}`}
              />
            ) : null}
            <SummaryRow label="Total" value={formatBillingMoney(invoice.totalCents)} bold />
            <SummaryRow label="Paid" value={formatBillingMoney(invoice.amountPaidCents)} />
            <SummaryRow
              label="Balance due"
              value={formatBillingMoney(invoice.balanceDueCents)}
              bold
              highlight
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{invoice.billToName ?? "—"}</p>
            <p className="text-muted-foreground">{invoice.billToEmail ?? "—"}</p>
            {invoice.billToPhone ? <p className="text-muted-foreground">{invoice.billToPhone}</p> : null}
            <p className="pt-2 text-muted-foreground">Terms: Net {invoice.paymentTermsDays}</p>
            {invoice.clientNotes ? <p className="pt-2">{invoice.clientNotes}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {invoice.tip ? (
              <p>
                Plan:{" "}
                <Link href={`/clients/${clientId}/improvement-plan/${invoice.tip.id}`} className="text-primary hover:underline">
                  {invoice.tip.title}
                </Link>
              </p>
            ) : null}
            {invoice.project ? <p>Project: {invoice.project.title}</p> : null}
            {!invoice.tip && !invoice.project ? (
              <p className="text-muted-foreground">No linked plan or project.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {isStaff && invoice.internalNotes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{invoice.internalNotes}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {invoice.paymentApplications.length === 0 ? (
              <p className="text-muted-foreground">No payments recorded.</p>
            ) : (
              invoice.paymentApplications.map((app) => (
                <div key={app.payment.id} className="flex justify-between gap-2 border-b border-border/60 py-2">
                  <div>
                    <p className="font-medium">{formatBillingMoney(app.appliedCents)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(app.payment.paymentDate).toLocaleDateString()} · {app.payment.method}
                    </p>
                  </div>
                  <span className="text-muted-foreground">{app.payment.status}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {invoice.deliveries.length === 0 ? (
              <p className="text-muted-foreground">Not sent yet.</p>
            ) : (
              invoice.deliveries.map((delivery) => (
                <div key={delivery.id} className="border-b border-border/60 py-2">
                  <p className="font-medium">{delivery.recipientEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    {delivery.status}
                    {delivery.sentAt ? ` · ${new Date(delivery.sentAt).toLocaleString()}` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-semibold tabular-nums" : "tabular-nums"}>{value}</span>
    </div>
  );
}
