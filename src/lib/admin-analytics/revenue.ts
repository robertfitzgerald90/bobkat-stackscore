import { isInternalOrTestEmail, isStripeTestSession } from "@/lib/admin-analytics/internal-activity";

export type PurchaseFact = {
  occurredAt: string;
  status: string;
  paymentStatus: string;
  amountTotal: number | null;
  currency: string | null;
  purchaserEmail: string;
  stripeSessionId: string;
  billingPaymentStatus: string | null;
  assessmentStatus: string | null;
};

export type PurchaseSummary = {
  paidCount: number;
  revenueCents: number | null;
  currency: string | null;
  revenueAvailability: "available" | "unavailable";
  cohortCompleted: number;
  cohortDenominator: number;
  notes: string[];
  countNotes: string[];
  dailyPaid: Record<string, number>;
};

function dayKey(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

/**
 * Net assessment checkout total from confirmed purchase rows.
 * Full refunds are removed. Partial refunds and disputes are omitted because
 * the retained cents are not stored on the purchase. DOC-311 purchase records.
 */
export function summarizePurchases(
  purchases: PurchaseFact[],
  staffEmails: ReadonlySet<string>,
): PurchaseSummary {
  let paidCount = 0;
  let refundedCount = 0;
  let partialCount = 0;
  let disputedCount = 0;
  let internalOrTestCount = 0;
  let missingAmountCount = 0;
  let cohortCompleted = 0;
  const dailyPaid: Record<string, number> = {};
  const revenueRows: Array<{ cents: number; currency: string; day: string }> = [];

  for (const purchase of purchases) {
    if (isStripeTestSession(purchase.stripeSessionId) || isInternalOrTestEmail(purchase.purchaserEmail, staffEmails)) {
      internalOrTestCount += 1;
      continue;
    }

    const billing = purchase.billingPaymentStatus;
    if (purchase.status === "refunded" || billing === "refunded") {
      refundedCount += 1;
      continue;
    }
    if (billing === "disputed" || billing === "canceled") {
      disputedCount += 1;
      continue;
    }

    const confirmed =
      purchase.status === "fulfilled" && purchase.paymentStatus.trim().toLowerCase() === "paid";
    if (!confirmed) continue;

    const day = dayKey(purchase.occurredAt);
    if (!day) continue;

    paidCount += 1;
    dailyPaid[day] = (dailyPaid[day] ?? 0) + 1;
    if (purchase.assessmentStatus === "completed") cohortCompleted += 1;

    if (billing === "partially_refunded") {
      partialCount += 1;
      continue;
    }

    if (purchase.amountTotal == null || !purchase.currency) {
      missingAmountCount += 1;
      continue;
    }

    revenueRows.push({
      cents: purchase.amountTotal,
      currency: purchase.currency.toLowerCase(),
      day,
    });
  }

  const notes: string[] = [];
  const countNotes: string[] = [];
  if (internalOrTestCount > 0) {
    const text = `Excluded ${internalOrTestCount} Stripe test-mode or internal/test purchase${internalOrTestCount === 1 ? "" : "s"}.`;
    notes.push(text);
    countNotes.push(text);
  }
  if (refundedCount > 0) {
    const text = `Excluded ${refundedCount} fully refunded purchase${refundedCount === 1 ? "" : "s"}.`;
    notes.push(text);
    countNotes.push(text);
  }
  if (partialCount > 0) {
    countNotes.push(
      `Includes ${partialCount} partially refunded purchase${partialCount === 1 ? "" : "s"}. The refunded cents are not stored, so those rows are left out of revenue.`,
    );
    notes.push(
      `Omitted ${partialCount} partially refunded purchase${partialCount === 1 ? "" : "s"} because the refunded cents are not stored.`,
    );
  }
  if (disputedCount > 0) {
    const text = `Omitted ${disputedCount} disputed or canceled payment${disputedCount === 1 ? "" : "s"} because the retained amount is not stored.`;
    notes.push(text);
    countNotes.push(text);
  }
  if (missingAmountCount > 0) {
    notes.push(
      `Omitted ${missingAmountCount} paid purchase${missingAmountCount === 1 ? "" : "s"} with no stored amount or currency.`,
    );
  }

  const currencies = new Set(revenueRows.map((row) => row.currency));
  if (currencies.size > 1) {
    notes.push("Revenue is unavailable because the included purchases use more than one currency.");
    return {
      paidCount,
      revenueCents: null,
      currency: null,
      revenueAvailability: "unavailable",
      cohortCompleted,
      cohortDenominator: paidCount,
      notes,
      countNotes,
      dailyPaid,
    };
  }

  if (revenueRows.length === 0 && (partialCount > 0 || missingAmountCount > 0 || disputedCount > 0) && paidCount > 0) {
    notes.push("No purchase in this range has a known retained amount.");
    return {
      paidCount,
      revenueCents: null,
      currency: null,
      revenueAvailability: "unavailable",
      cohortCompleted,
      cohortDenominator: paidCount,
      notes,
      countNotes,
      dailyPaid,
    };
  }

  const revenueCents = revenueRows.reduce((sum, row) => sum + row.cents, 0);
  return {
    paidCount,
    revenueCents,
    currency: revenueRows[0]?.currency ?? "usd",
    revenueAvailability: "available",
    cohortCompleted,
    cohortDenominator: paidCount,
    notes,
    countNotes,
    dailyPaid,
  };
}
