import { prisma } from "@/lib/db";
import { normalizeToMonthlyCents } from "@/lib/billing/calculations";
import { markInvoicesOverdue } from "@/lib/billing/invoice-service";

export async function getBillingOverview(clientId: string) {
  await markInvoicesOverdue(clientId);

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    allInvoices,
    paidYtdPayments,
    recurringServices,
    deposits,
    approvedTipsWithoutDeposit,
  ] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        clientId,
        status: { notIn: ["voided"] },
      },
    }),
    prisma.billingPayment.findMany({
      where: {
        clientId,
        status: "succeeded",
        paymentDate: { gte: yearStart },
      },
    }),
    prisma.recurringService.findMany({ where: { clientId } }),
    prisma.billingDeposit.findMany({ where: { clientId } }),
    prisma.technologyImprovementPlan.findMany({
      where: { clientId, status: "approved" },
      include: { billingDeposits: { where: { status: { in: ["paid", "applied"] } } } },
    }),
  ]);

  const openInvoices = allInvoices.filter((i) => !["draft", "ready_to_send"].includes(i.status));

  const outstandingBalanceCents = openInvoices
    .filter((i) => !["paid", "refunded", "voided"].includes(i.status))
    .reduce((sum, i) => sum + i.balanceDueCents, 0);

  const overdueBalanceCents = openInvoices
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + i.balanceDueCents, 0);

  const paidYearToDateCents = paidYtdPayments.reduce((sum, p) => sum + p.amountCents, 0);

  const activeRecurring = recurringServices.filter((s) => s.status === "active");
  const monthlyRecurringRevenueCents = activeRecurring.reduce(
    (sum, s) =>
      sum +
      normalizeToMonthlyCents(
        s.unitPriceCents,
        Number(s.quantity),
        s.billingFrequency,
        s.customFrequencyDays,
      ),
    0,
  );

  const draftInvoices = allInvoices.filter((i) =>
    ["draft", "ready_to_send"].includes(i.status),
  ).length;
  const failedPayments = await prisma.billingPayment.count({
    where: { clientId, status: "failed" },
  });
  const depositsAwaitingPayment = deposits.filter((d) =>
    ["requested", "invoice_sent", "partially_paid"].includes(d.status),
  ).length;

  const partiallyPaidInvoices = openInvoices.filter((i) => i.status === "partially_paid");
  const draftWaiting = allInvoices.filter((i) =>
    ["draft", "ready_to_send"].includes(i.status),
  );
  const overdueInvoices = openInvoices.filter((i) => i.status === "overdue");
  const failedPaymentRows = await prisma.billingPayment.findMany({
    where: { clientId, status: "failed" },
    take: 5,
    orderBy: { paymentDate: "desc" },
  });

  const tipsNeedingDeposit = approvedTipsWithoutDeposit.filter(
    (tip) => tip.billingDeposits.length === 0,
  );

  const unbilledApprovedWorkCents = 0;

  const nextExpectedPayment = openInvoices
    .filter((i) => i.balanceDueCents > 0 && i.dueDate)
    .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()))[0];

  const renewalsApproaching = recurringServices.filter((s) => {
    if (!s.renewalDate) return false;
    const days = (s.renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 45;
  });

  return {
    outstandingBalanceCents,
    overdueBalanceCents,
    paidYearToDateCents,
    monthlyRecurringRevenueCents,
    annualRecurringRevenueCents: monthlyRecurringRevenueCents * 12,
    unbilledApprovedWorkCents,
    draftInvoices,
    failedPayments,
    depositsAwaitingPayment,
    nextExpectedPayment: nextExpectedPayment
      ? {
          invoiceId: nextExpectedPayment.id,
          invoiceNumber: nextExpectedPayment.invoiceNumber,
          dueDate: nextExpectedPayment.dueDate?.toISOString() ?? null,
          balanceDueCents: nextExpectedPayment.balanceDueCents,
        }
      : null,
    attention: {
      overdueInvoices: overdueInvoices.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        balanceDueCents: i.balanceDueCents,
        dueDate: i.dueDate?.toISOString() ?? null,
      })),
      failedPayments: failedPaymentRows.map((p) => ({
        id: p.id,
        amountCents: p.amountCents,
        paymentDate: p.paymentDate.toISOString(),
      })),
      approvedPlansWithoutDeposits: tipsNeedingDeposit.map((t) => ({
        id: t.id,
        title: t.title,
      })),
      draftInvoicesWaiting: draftWaiting.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        totalCents: i.totalCents,
      })),
      partiallyPaidInvoices: partiallyPaidInvoices.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        balanceDueCents: i.balanceDueCents,
      })),
    },
    renewalsApproaching: renewalsApproaching.map((s) => ({
      id: s.id,
      serviceName: s.serviceName,
      renewalDate: s.renewalDate?.toISOString() ?? null,
    })),
  };
}
