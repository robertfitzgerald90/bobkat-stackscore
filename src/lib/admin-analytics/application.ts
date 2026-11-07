import { isDayInRange, rangeEndExclusive, rangeStart } from "@/lib/admin-analytics/range";
import { isInternalOrTestEmail, isStripeTestSession } from "@/lib/admin-analytics/internal-activity";
import type { PurchaseFact } from "@/lib/admin-analytics/revenue";
import type { AdminAnalyticsFilters } from "@/lib/admin-analytics/types";
import { prisma } from "@/lib/db";
import { TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE } from "@/lib/stripe/products";

type DailyCount = {
  total: number;
  previous: number;
  excluded: number;
  daily: Record<string, number>;
};

export type ApplicationAnalytics = {
  refreshedAt: string;
  staffEmails: string[];
  inquiries: DailyCount;
  consultationsMarked: { total: number; previous: number; excluded: number };
  snapshots: DailyCount;
  purchaseFacts: { current: PurchaseFact[]; previous: PurchaseFact[] };
  completions: { total: number; previous: number; excluded: number };
};

function emptyDaily(): DailyCount {
  return { total: 0, previous: 0, excluded: 0, daily: {} };
}

function addDaily(target: DailyCount, day: string, currentFrom: string, currentTo: string, previousFrom: string, previousTo: string) {
  if (isDayInRange(day, currentFrom, currentTo)) {
    target.total += 1;
    target.daily[day] = (target.daily[day] ?? 0) + 1;
    return;
  }
  if (isDayInRange(day, previousFrom, previousTo)) target.previous += 1;
}

export async function loadApplicationAnalytics(
  filters: AdminAnalyticsFilters,
): Promise<ApplicationAnalytics> {
  const windowStart = rangeStart(filters.previousFrom);
  const windowEnd = rangeEndExclusive(filters.to);

  const [staff, leads, marked, snapshots, purchases, completions] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["admin", "technician"] } },
      select: { email: true },
    }),
    prisma.websiteLead.findMany({
      where: {
        source: "BOBKAT_WEBSITE_CONTACT",
        submittedAt: { gte: windowStart, lt: windowEnd },
      },
      select: { email: true, submittedAt: true },
    }),
    prisma.websiteLead.findMany({
      where: {
        source: "BOBKAT_WEBSITE_CONTACT",
        status: "CONSULTATION_BOOKED",
        updatedAt: { gte: windowStart, lt: windowEnd },
      },
      select: { email: true, updatedAt: true },
    }),
    prisma.technologySnapshotLead.findMany({
      where: { createdAt: { gte: windowStart, lt: windowEnd } },
      select: { email: true, createdAt: true },
    }),
    prisma.assessmentPurchase.findMany({
      where: {
        productType: TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE,
        OR: [
          { fulfilledAt: { gte: windowStart, lt: windowEnd } },
          { fulfilledAt: null, createdAt: { gte: windowStart, lt: windowEnd } },
        ],
      },
      select: {
        status: true,
        paymentStatus: true,
        amountTotal: true,
        currency: true,
        purchaserEmail: true,
        stripeSessionId: true,
        stripePaymentIntentId: true,
        fulfilledAt: true,
        createdAt: true,
        assessment: { select: { status: true } },
      },
    }),
    prisma.assessment.findMany({
      where: {
        status: "completed",
        completedAt: { gte: windowStart, lt: windowEnd },
        purchase: { is: { productType: TECHNOLOGY_ASSESSMENT_PRODUCT_TYPE } },
      },
      select: {
        completedAt: true,
        purchase: {
          select: {
            status: true,
            purchaserEmail: true,
            stripeSessionId: true,
          },
        },
      },
    }),
  ]);

  const staffEmails = new Set(staff.map((user) => user.email.trim().toLowerCase()));
  const intentIds = purchases
    .map((purchase) => purchase.stripePaymentIntentId)
    .filter((id): id is string => Boolean(id));
  const payments = intentIds.length
    ? await prisma.billingPayment.findMany({
        where: { stripePaymentIntentId: { in: intentIds } },
        select: { stripePaymentIntentId: true, status: true },
      })
    : [];
  const paymentStatus = new Map(
    payments
      .filter((payment) => payment.stripePaymentIntentId)
      .map((payment) => [payment.stripePaymentIntentId as string, payment.status]),
  );

  const inquiries = emptyDaily();
  for (const lead of leads) {
    if (isInternalOrTestEmail(lead.email, staffEmails)) {
      if (isDayInRange(lead.submittedAt.toISOString().slice(0, 10), filters.from, filters.to)) {
        inquiries.excluded += 1;
      }
      continue;
    }
    addDaily(
      inquiries,
      lead.submittedAt.toISOString().slice(0, 10),
      filters.from,
      filters.to,
      filters.previousFrom,
      filters.previousTo,
    );
  }

  let markedTotal = 0;
  let markedPrevious = 0;
  let markedExcluded = 0;
  for (const lead of marked) {
    const day = lead.updatedAt.toISOString().slice(0, 10);
    if (isInternalOrTestEmail(lead.email, staffEmails)) {
      if (isDayInRange(day, filters.from, filters.to)) markedExcluded += 1;
      continue;
    }
    if (isDayInRange(day, filters.from, filters.to)) markedTotal += 1;
    else if (isDayInRange(day, filters.previousFrom, filters.previousTo)) markedPrevious += 1;
  }

  const snapshotCounts = emptyDaily();
  for (const snapshot of snapshots) {
    const day = snapshot.createdAt.toISOString().slice(0, 10);
    if (isInternalOrTestEmail(snapshot.email, staffEmails)) {
      if (isDayInRange(day, filters.from, filters.to)) snapshotCounts.excluded += 1;
      continue;
    }
    addDaily(snapshotCounts, day, filters.from, filters.to, filters.previousFrom, filters.previousTo);
  }

  const currentPurchases: PurchaseFact[] = [];
  const previousPurchases: PurchaseFact[] = [];
  for (const purchase of purchases) {
    const occurred = purchase.fulfilledAt ?? purchase.createdAt;
    const fact: PurchaseFact = {
      occurredAt: occurred.toISOString(),
      status: purchase.status,
      paymentStatus: purchase.paymentStatus,
      amountTotal: purchase.amountTotal,
      currency: purchase.currency,
      purchaserEmail: purchase.purchaserEmail,
      stripeSessionId: purchase.stripeSessionId,
      billingPaymentStatus: purchase.stripePaymentIntentId
        ? (paymentStatus.get(purchase.stripePaymentIntentId) ?? null)
        : null,
      assessmentStatus: purchase.assessment?.status ?? null,
    };
    const day = fact.occurredAt.slice(0, 10);
    if (isDayInRange(day, filters.from, filters.to)) currentPurchases.push(fact);
    else if (isDayInRange(day, filters.previousFrom, filters.previousTo)) previousPurchases.push(fact);
  }

  let completed = 0;
  let completedPrevious = 0;
  let completedExcluded = 0;
  for (const assessment of completions) {
    if (!assessment.completedAt || !assessment.purchase) continue;
    const day = assessment.completedAt.toISOString().slice(0, 10);
    const internal =
      isStripeTestSession(assessment.purchase.stripeSessionId) ||
      isInternalOrTestEmail(assessment.purchase.purchaserEmail, staffEmails);
    if (internal) {
      if (isDayInRange(day, filters.from, filters.to)) completedExcluded += 1;
      continue;
    }
    if (assessment.purchase.status !== "fulfilled" && assessment.purchase.status !== "refunded") {
      continue;
    }
    if (isDayInRange(day, filters.from, filters.to)) completed += 1;
    else if (isDayInRange(day, filters.previousFrom, filters.previousTo)) completedPrevious += 1;
  }

  return {
    refreshedAt: new Date().toISOString(),
    staffEmails: [...staffEmails],
    inquiries,
    consultationsMarked: { total: markedTotal, previous: markedPrevious, excluded: markedExcluded },
    snapshots: snapshotCounts,
    purchaseFacts: { current: currentPurchases, previous: previousPurchases },
    completions: { total: completed, previous: completedPrevious, excluded: completedExcluded },
  };
}
