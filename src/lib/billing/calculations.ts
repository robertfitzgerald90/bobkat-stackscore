import type { InvoiceLineItem } from "@/generated/prisma/client";
import { lineAmountCents } from "@/lib/billing/money";

export type InvoiceTotalsInput = {
  lineItems: Pick<InvoiceLineItem, "amountCents">[];
  discountCents?: number;
  taxCents?: number;
  creditCents?: number;
  depositAppliedCents?: number;
  amountPaidCents?: number;
};

export type InvoiceTotals = {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  creditCents: number;
  depositAppliedCents: number;
  totalCents: number;
  amountPaidCents: number;
  balanceDueCents: number;
};

export function computeInvoiceTotals(input: InvoiceTotalsInput): InvoiceTotals {
  const subtotalCents = input.lineItems.reduce((sum, line) => sum + line.amountCents, 0);
  const discountCents = input.discountCents ?? 0;
  const taxCents = input.taxCents ?? 0;
  const creditCents = input.creditCents ?? 0;
  const depositAppliedCents = input.depositAppliedCents ?? 0;
  const amountPaidCents = input.amountPaidCents ?? 0;

  const totalCents = Math.max(
    0,
    subtotalCents - discountCents + taxCents - creditCents - depositAppliedCents,
  );
  const balanceDueCents = Math.max(0, totalCents - amountPaidCents);

  return {
    subtotalCents,
    discountCents,
    taxCents,
    creditCents,
    depositAppliedCents,
    totalCents,
    amountPaidCents,
    balanceDueCents,
  };
}

export function computeLineAmount(quantity: number, unitPriceCents: number): number {
  return lineAmountCents(quantity, unitPriceCents);
}

export function deriveInvoiceStatus(
  currentStatus: string,
  balanceDueCents: number,
  totalCents: number,
  amountPaidCents: number,
  dueDate: Date | null,
  now = new Date(),
): string {
  if (currentStatus === "voided" || currentStatus === "refunded") return currentStatus;
  if (totalCents === 0 && amountPaidCents === 0) return currentStatus;
  if (balanceDueCents <= 0 && amountPaidCents > 0) return "paid";
  if (amountPaidCents > 0 && balanceDueCents > 0) return "partially_paid";
  if (
    dueDate &&
    dueDate < now &&
    balanceDueCents > 0 &&
    ["sent", "viewed", "partially_paid", "overdue"].includes(currentStatus)
  ) {
    return "overdue";
  }
  return currentStatus;
}

/** MRR from active recurring services (monthly-normalized cents). */
export function normalizeToMonthlyCents(
  unitPriceCents: number,
  quantity: number,
  frequency: string,
  customFrequencyDays?: number | null,
): number {
  const base = Math.round(unitPriceCents * Number(quantity));
  switch (frequency) {
    case "monthly":
      return base;
    case "quarterly":
      return Math.round(base / 3);
    case "semiannual":
      return Math.round(base / 6);
    case "annual":
      return Math.round(base / 12);
    case "custom":
      if (customFrequencyDays && customFrequencyDays > 0) {
        return Math.round((base * 30) / customFrequencyDays);
      }
      return base;
    default:
      return base;
  }
}
