import { NextResponse } from "next/server";
import { badRequest } from "@/lib/api/helpers";
import { requireBillingClientAccess, requireBillingManagement, isStaff } from "@/lib/billing/api-auth";
import { stripInternalRecurringService } from "@/lib/billing/recurring-service";
import {
  createRecurringService,
  getRecurringMetrics,
  listRecurringServices,
} from "@/lib/billing/recurring-service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const session = await requireBillingClientAccess(clientId);
  if ("error" in session) return session.error;

  const [services, metrics] = await Promise.all([
    listRecurringServices(clientId),
    getRecurringMetrics(clientId),
  ]);

  const staff = isStaff(session.user);
  return NextResponse.json({
    services: services.map((s) => stripInternalRecurringService(s, session.user.role)),
    metrics: staff
      ? metrics
      : {
          mrrCents: metrics.mrrCents,
          arrCents: metrics.arrCents,
          activeRecurringRevenueCents: metrics.activeRecurringRevenueCents,
          upcomingRenewals: metrics.upcomingRenewals,
        },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const session = await requireBillingManagement(clientId);
  if ("error" in session) return session.error;

  const body = (await request.json()) as {
    serviceName: string;
    description?: string;
    quantity?: number;
    unitPriceCents: number;
    billingFrequency: import("@/generated/prisma/client").BillingFrequency;
    startDate?: string;
    nextBillingDate?: string;
    renewalDate?: string;
    minimumTermMonths?: number;
    autoRenew?: boolean;
    relatedTechnology?: string;
    relatedAgreement?: string;
    internalCostCents?: number;
    internalMarginPercent?: number;
  };

  try {
    const service = await createRecurringService({
      clientId,
      serviceName: body.serviceName,
      description: body.description,
      quantity: body.quantity,
      unitPriceCents: body.unitPriceCents,
      billingFrequency: body.billingFrequency,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : undefined,
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : undefined,
      minimumTermMonths: body.minimumTermMonths,
      autoRenew: body.autoRenew,
      relatedTechnology: body.relatedTechnology,
      relatedAgreement: body.relatedAgreement,
      internalCostCents: body.internalCostCents,
      internalMarginPercent: body.internalMarginPercent,
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to create recurring service");
  }
}
