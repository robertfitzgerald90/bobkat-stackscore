import type { InvoiceLineKind, InvoiceStatus } from "@/generated/prisma/client";
import { INVOICE_STATUS_LABELS } from "@/lib/billing/labels";
import { formatMoney } from "@/lib/billing/money";

export type InvoicePdfLineItem = {
  description: string;
  clientNote: string | null;
  quantity: string;
  unitPriceCents: number;
  amountCents: number;
  lineKind: InvoiceLineKind;
};

export type InvoicePdfAddress = {
  lines: string[];
};

export type InvoicePdfRelatedRecord = {
  kind: "tip" | "project" | "deposit";
  label: string;
};

export type InvoicePdfData = {
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date | null;
  dueDate: Date | null;
  paymentTermsDays: number;
  billToCompanyName: string;
  billToContactName: string | null;
  billToEmail: string | null;
  billToPhone: string | null;
  billToAddress: InvoicePdfAddress;
  relatedRecord: InvoicePdfRelatedRecord | null;
  clientNotes: string | null;
  currency: string;
  subtotalCents: number;
  oneTimeSubtotalCents: number;
  recurringSubtotalCents: number;
  discountCents: number;
  taxCents: number;
  creditCents: number;
  depositAppliedCents: number;
  totalCents: number;
  amountPaidCents: number;
  balanceDueCents: number;
  lineItems: InvoicePdfLineItem[];
  paymentTermsLabel: string;
  paymentUrl: string | null;
  acceptedPaymentMethods: string | null;
  contextNote: string | null;
};

export type InvoicePdfSource = {
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date | null;
  dueDate: Date | null;
  paymentTermsDays: number;
  billToName: string | null;
  billToEmail: string | null;
  billToPhone: string | null;
  billToAddressJson: unknown;
  clientNotes: string | null;
  internalNotes?: string | null;
  currency: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  creditCents: number;
  depositAppliedCents: number;
  totalCents: number;
  amountPaidCents: number;
  balanceDueCents: number;
  stripePaymentLinkUrl?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  onlinePaymentEnabled: boolean;
  client: { companyName: string };
  tip?: { title: string } | null;
  project?: { title: string } | null;
  deposit?: { label: string } | null;
  lineItems: Array<{
    description: string;
    clientNote?: string | null;
    quantity: unknown;
    unitPriceCents: number;
    amountCents: number;
    lineKind: InvoiceLineKind;
    internalCostCents?: number | null;
  }>;
};

export function formatInvoiceDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPaymentTerms(days: number): string {
  return `Net ${days}`;
}

export function formatInvoiceQuantity(quantity: unknown): string {
  const value = typeof quantity === "number" ? quantity : Number(String(quantity));
  if (!Number.isFinite(value)) return String(quantity);
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

export function parseBillToAddress(json: unknown): InvoicePdfAddress {
  if (!json || typeof json !== "object") {
    return { lines: [] };
  }

  const record = json as Record<string, unknown>;
  const line1 = pickString(record, ["line1", "addressLine1", "street"]);
  const line2 = pickString(record, ["line2", "addressLine2"]);
  const city = pickString(record, ["city"]);
  const state = pickString(record, ["state", "region"]);
  const postalCode = pickString(record, ["postalCode", "zip", "postal"]);
  const country = pickString(record, ["country"]);

  const cityLine = [city, state].filter(Boolean).join(", ");
  const cityPostal = [cityLine, postalCode].filter(Boolean).join(" ");

  const lines = [line1, line2, cityPostal, country].filter(
    (line): line is string => Boolean(line && line.trim()),
  );

  return { lines };
}

function pickString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function buildInvoiceContextNote(input: {
  relatedRecord: InvoicePdfRelatedRecord | null;
  depositAppliedCents: number;
}): string | null {
  if (input.relatedRecord?.kind === "tip") {
    return `This invoice supports the approved Technology Improvement Plan initiative: ${input.relatedRecord.label}.`;
  }
  if (input.relatedRecord?.kind === "project") {
    return `This invoice is associated with the project: ${input.relatedRecord.label}.`;
  }
  if (input.relatedRecord?.kind === "deposit") {
    return `This invoice reflects ${input.relatedRecord.label} deposit or milestone billing terms.`;
  }
  if (input.depositAppliedCents > 0) {
    return "A prior deposit has been applied to this invoice.";
  }
  return null;
}

export function resolveRelatedRecord(invoice: {
  tip?: { title: string } | null;
  project?: { title: string } | null;
  deposit?: { label: string } | null;
}): InvoicePdfRelatedRecord | null {
  if (invoice.tip?.title) {
    return { kind: "tip", label: invoice.tip.title };
  }
  if (invoice.project?.title) {
    return { kind: "project", label: invoice.project.title };
  }
  if (invoice.deposit?.label) {
    return { kind: "deposit", label: invoice.deposit.label };
  }
  return null;
}

export function resolveAcceptedPaymentMethods(
  invoice: Pick<InvoicePdfSource, "onlinePaymentEnabled" | "stripePaymentLinkUrl">,
): string | null {
  if (!invoice.onlinePaymentEnabled || !invoice.stripePaymentLinkUrl) {
    return null;
  }
  return "Credit card and ACH bank transfer (secure online checkout)";
}

export function resolvePaymentUrl(
  invoice: Pick<
    InvoicePdfSource,
    "onlinePaymentEnabled" | "stripePaymentLinkUrl" | "balanceDueCents" | "status"
  >,
): string | null {
  if (
    !invoice.onlinePaymentEnabled ||
    !invoice.stripePaymentLinkUrl ||
    invoice.balanceDueCents <= 0 ||
    invoice.status === "voided" ||
    invoice.status === "paid" ||
    invoice.status === "draft"
  ) {
    return null;
  }
  return invoice.stripePaymentLinkUrl;
}

export function mapInvoiceToPdfData(invoice: InvoicePdfSource): InvoicePdfData {
  const lineItems: InvoicePdfLineItem[] = invoice.lineItems.map((line) => ({
    description: line.description,
    clientNote: line.clientNote ?? null,
    quantity: formatInvoiceQuantity(line.quantity),
    unitPriceCents: line.unitPriceCents,
    amountCents: line.amountCents,
    lineKind: line.lineKind,
  }));

  const oneTimeSubtotalCents = lineItems
    .filter((line) => line.lineKind === "one_time")
    .reduce((sum, line) => sum + line.amountCents, 0);
  const recurringSubtotalCents = lineItems
    .filter((line) => line.lineKind === "recurring")
    .reduce((sum, line) => sum + line.amountCents, 0);

  const relatedRecord = resolveRelatedRecord(invoice);
  const billToContactName =
    invoice.billToName && invoice.billToName !== invoice.client.companyName
      ? invoice.billToName
      : null;

  return {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    paymentTermsDays: invoice.paymentTermsDays,
    billToCompanyName: invoice.client.companyName,
    billToContactName,
    billToEmail: invoice.billToEmail,
    billToPhone: invoice.billToPhone,
    billToAddress: parseBillToAddress(invoice.billToAddressJson),
    relatedRecord,
    clientNotes: invoice.clientNotes,
    currency: invoice.currency,
    subtotalCents: invoice.subtotalCents,
    oneTimeSubtotalCents,
    recurringSubtotalCents,
    discountCents: invoice.discountCents,
    taxCents: invoice.taxCents,
    creditCents: invoice.creditCents,
    depositAppliedCents: invoice.depositAppliedCents,
    totalCents: invoice.totalCents,
    amountPaidCents: invoice.amountPaidCents,
    balanceDueCents: invoice.balanceDueCents,
    lineItems,
    paymentTermsLabel: formatPaymentTerms(invoice.paymentTermsDays),
    paymentUrl: resolvePaymentUrl(invoice),
    acceptedPaymentMethods: resolveAcceptedPaymentMethods(invoice),
    contextNote: buildInvoiceContextNote({
      relatedRecord,
      depositAppliedCents: invoice.depositAppliedCents,
    }),
  };
}

export function formatInvoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_LABELS[status];
}

export function formatInvoiceMoney(cents: number, currency: string): string {
  return formatMoney(cents, currency);
}

export const INVOICE_PDF_STATUS_BADGE: Record<
  InvoiceStatus,
  { backgroundColor: string; color: string; borderColor: string }
> = {
  draft: { backgroundColor: "#F1F5F9", color: "#475569", borderColor: "#CBD5E1" },
  ready_to_send: { backgroundColor: "#F8FAFC", color: "#334155", borderColor: "#E2E8F0" },
  sent: { backgroundColor: "#EEF4F8", color: "#082F5B", borderColor: "#CBD5E1" },
  viewed: { backgroundColor: "#EEF4F8", color: "#082F5B", borderColor: "#CBD5E1" },
  partially_paid: { backgroundColor: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" },
  paid: { backgroundColor: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" },
  overdue: { backgroundColor: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" },
  voided: { backgroundColor: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" },
  refunded: { backgroundColor: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" },
};

export function normalizeWebsiteUrl(website: string): string {
  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }
  return `https://${website}`;
}
