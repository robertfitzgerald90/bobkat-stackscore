import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { normalizeToMonthlyCents } from "@/lib/billing/calculations";

export async function listRecurringServices(clientId: string) {
  return prisma.recurringService.findMany({
    where: { clientId },
    orderBy: [{ status: "asc" }, { serviceName: "asc" }],
  });
}

export async function createRecurringService(input: {
  clientId: string;
  serviceName: string;
  description?: string;
  quantity?: number;
  unitPriceCents: number;
  billingFrequency: import("@/generated/prisma/client").BillingFrequency;
  startDate?: Date;
  nextBillingDate?: Date;
  renewalDate?: Date;
  minimumTermMonths?: number;
  autoRenew?: boolean;
  relatedTechnology?: string;
  relatedAgreement?: string;
  internalCostCents?: number;
  internalMarginPercent?: number;
}) {
  return prisma.recurringService.create({
    data: {
      clientId: input.clientId,
      serviceName: input.serviceName,
      description: input.description,
      quantity: input.quantity ?? 1,
      unitPriceCents: input.unitPriceCents,
      billingFrequency: input.billingFrequency,
      startDate: input.startDate,
      nextBillingDate: input.nextBillingDate,
      renewalDate: input.renewalDate,
      minimumTermMonths: input.minimumTermMonths,
      autoRenew: input.autoRenew ?? true,
      relatedTechnology: input.relatedTechnology,
      relatedAgreement: input.relatedAgreement,
      internalCostCents: input.internalCostCents,
      internalMarginPercent: input.internalMarginPercent,
      status: "draft",
    },
  });
}

export async function getRecurringMetrics(clientId: string) {
  const services = await listRecurringServices(clientId);
  const active = services.filter((s) => s.status === "active");
  const pastDue = services.filter((s) => s.status === "past_due");
  const canceled = services.filter((s) => s.status === "canceled");

  const mrr = active.reduce(
    (sum, s) =>
      sum + normalizeToMonthlyCents(s.unitPriceCents, Number(s.quantity), s.billingFrequency, s.customFrequencyDays),
    0,
  );
  const pastDueRevenue = pastDue.reduce(
    (sum, s) =>
      sum + normalizeToMonthlyCents(s.unitPriceCents, Number(s.quantity), s.billingFrequency, s.customFrequencyDays),
    0,
  );

  return {
    mrrCents: mrr,
    arrCents: mrr * 12,
    activeRecurringRevenueCents: mrr,
    pastDueRecurringRevenueCents: pastDueRevenue,
    churnedRecurringRevenueCents: canceled.reduce(
      (sum, s) =>
        sum + normalizeToMonthlyCents(s.unitPriceCents, Number(s.quantity), s.billingFrequency, s.customFrequencyDays),
      0,
    ),
    upcomingRenewals: services.filter((s) => s.renewalDate).length,
  };
}

export function stripInternalRecurringService<T extends { internalCostCents?: number | null; internalMarginPercent?: unknown }>(
  service: T,
  role: UserRole,
): T {
  if (role === "admin" || role === "technician") return service;
  const { internalCostCents: _c, internalMarginPercent: _m, ...rest } = service;
  return rest as T;
}
