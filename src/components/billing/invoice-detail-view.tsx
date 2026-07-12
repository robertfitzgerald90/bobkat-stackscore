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
import type { InvoiceLineKind, InvoiceStatus } from "@/generated/prisma/client";
import {
  buildInvoiceContextNote,
  formatInvoiceDate,
  formatPaymentTerms,
  parseBillToAddress,
  resolveAcceptedPaymentMethods,
  resolvePaymentUrl,
  resolveRelatedRecord,
} from "@/lib/pdf/invoice-pdf-data";

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
  billToAddressJson: unknown;
  stripePaymentLinkUrl: string | null;
  onlinePaymentEnabled: boolean;
  client: { companyName: string };
  deposit: { label: string } | null;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
    amountCents: number;
    category: string;
    lineKind: InvoiceLineKind;
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
  const billToAddress = parseBillToAddress(invoice.billToAddressJson);
  const relatedRecord = resolveRelatedRecord({
    tip: invoice.tip,
    project: invoice.project,
    deposit: invoice.deposit,
  });
  const contextNote = buildInvoiceContextNote({
    relatedRecord,
    depositAppliedCents: invoice.depositAppliedCents,
  });
  const paymentUrl = resolvePaymentUrl(invoice);
  const acceptedPaymentMethods = resolveAcceptedPaymentMethods(invoice);
  const oneTimeSubtotal = invoice.lineItems
    .filter((line) => line.lineKind === "one_time")
    .reduce((sum, line) => sum + line.amountCents, 0);
  const recurringSubtotal = invoice.lineItems
    .filter((line) => line.lineKind === "recurring")
    .reduce((sum, line) => sum + line.amountCents, 0);
  const showSplitSummary = oneTimeSubtotal > 0 && recurringSubtotal > 0;
  const billToContactName =
    invoice.billToName && invoice.billToName !== invoice.client.companyName
      ? invoice.billToName
      : null;

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
            {invoice.client.companyName} · Due{" "}
            {invoice.dueDate ? formatInvoiceDate(new Date(invoice.dueDate)) : "—"}
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="rounded-lg border border-primary/15 bg-primary/[0.04] px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Balance Due
            </p>
            <p className="text-2xl font-semibold tabular-nums text-primary">
              {formatBillingMoney(invoice.balanceDueCents)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
          <a href={pdfUrl} className={buttonClassName({ variant: "outline" })}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </a>
          {!isStaff && paymentUrl ? (
            <a href={paymentUrl} className={buttonClassName({ variant: "default" })}>
              Pay Invoice Online
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 rounded-lg border border-border/60 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <PreviewMeta label="Invoice Number" value={invoice.invoiceNumber} />
            <PreviewMeta
              label="Issue Date"
              value={invoice.issueDate ? formatInvoiceDate(new Date(invoice.issueDate)) : "—"}
            />
            <PreviewMeta
              label="Due Date"
              value={invoice.dueDate ? formatInvoiceDate(new Date(invoice.dueDate)) : "—"}
            />
            <PreviewMeta label="Payment Terms" value={formatPaymentTerms(invoice.paymentTermsDays)} />
            <PreviewMeta label="Status" value={invoice.status.replaceAll("_", " ")} />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bill To
            </p>
            <p className="mt-2 font-medium text-foreground">{invoice.client.companyName}</p>
            {billToContactName ? <p className="text-sm text-foreground">{billToContactName}</p> : null}
            {invoice.billToEmail ? (
              <p className="text-sm text-muted-foreground">{invoice.billToEmail}</p>
            ) : null}
            {invoice.billToPhone ? (
              <p className="text-sm text-muted-foreground">{invoice.billToPhone}</p>
            ) : null}
            {billToAddress.lines.map((line) => (
              <p key={line} className="text-sm text-muted-foreground">
                {line}
              </p>
            ))}
            {relatedRecord ? (
              <p className="mt-3 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                Related{" "}
                {relatedRecord.kind === "tip"
                  ? "Technology Improvement Plan"
                  : relatedRecord.kind === "project"
                    ? "Project"
                    : "Deposit"}
                : {relatedRecord.label}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b bg-primary text-left text-primary-foreground">
                  <th className="rounded-tl-md px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                  <th className="px-3 py-2 text-right font-medium">Rate</th>
                  <th className="rounded-tr-md px-3 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((line) => (
                  <tr key={line.id} className="border-b border-border/60">
                    <td className="px-3 py-3">
                      <p className="font-medium">{line.description}</p>
                      {line.clientNote ? (
                        <p className="mt-1 text-xs text-muted-foreground">{line.clientNote}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{line.quantity}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatBillingMoney(line.unitPriceCents)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium">
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
            {showSplitSummary ? (
              <>
                <SummaryRow label="One-time charges" value={formatBillingMoney(oneTimeSubtotal)} />
                <SummaryRow label="Recurring charges" value={formatBillingMoney(recurringSubtotal)} />
              </>
            ) : null}
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
            {invoice.creditCents > 0 ? (
              <SummaryRow label="Credits" value={`-${formatBillingMoney(invoice.creditCents)}`} />
            ) : null}
            {invoice.amountPaidCents > 0 ? (
              <SummaryRow
                label="Payments received"
                value={`-${formatBillingMoney(invoice.amountPaidCents)}`}
              />
            ) : null}
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
            <CardTitle className="text-base">Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{formatPaymentTerms(invoice.paymentTermsDays)}</p>
            {invoice.dueDate ? (
              <p className="text-muted-foreground">
                Payment due by {formatInvoiceDate(new Date(invoice.dueDate))}.
              </p>
            ) : null}
            {paymentUrl ? (
              <a href={paymentUrl} className="inline-flex font-medium text-primary hover:underline">
                Pay Invoice Online
              </a>
            ) : null}
            {acceptedPaymentMethods ? (
              <p className="text-muted-foreground">Accepted payment methods: {acceptedPaymentMethods}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {invoice.clientNotes ? <p>{invoice.clientNotes}</p> : null}
            {contextNote ? <p className="text-muted-foreground">{contextNote}</p> : null}
            {!invoice.clientNotes && !contextNote ? (
              <p className="text-muted-foreground">No client-facing notes on this invoice.</p>
            ) : null}
            <p className="font-medium text-primary">
              Thank you for your business. We appreciate the opportunity to support your technology goals.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
            {invoice.deposit ? <p>Deposit: {invoice.deposit.label}</p> : null}
            {!invoice.tip && !invoice.project && !invoice.deposit ? (
              <p className="text-muted-foreground">No linked plan, project, or deposit.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle className="text-base">Billing Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{invoice.client.companyName}</p>
            {billToContactName ? <p>{billToContactName}</p> : null}
            <p className="text-muted-foreground">{invoice.billToEmail ?? "—"}</p>
            {invoice.billToPhone ? <p className="text-muted-foreground">{invoice.billToPhone}</p> : null}
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
    <div
      className={`flex items-center justify-between gap-2 ${highlight ? "rounded-md border border-primary/20 bg-primary/[0.04] px-3 py-2" : ""}`}
    >
      <span className={highlight ? "font-medium text-primary" : "text-muted-foreground"}>{label}</span>
      <span
        className={
          highlight
            ? "text-lg font-semibold tabular-nums text-primary"
            : bold
              ? "font-semibold tabular-nums"
              : "tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

function PreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm capitalize text-foreground">{value}</p>
    </div>
  );
}
