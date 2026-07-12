import type {
  InvoiceLineCategory,
  InvoiceSourceType,
  InvoiceStatus,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { recordBillingAudit } from "@/lib/billing/audit";
import {
  computeInvoiceTotals,
  computeLineAmount,
  deriveInvoiceStatus,
} from "@/lib/billing/calculations";
import { nextInvoiceNumber } from "@/lib/billing/invoice-number";
import { dollarsToCents } from "@/lib/billing/money";
import { getTipPlan } from "@/lib/technology-improvement-plan/service";
import { computeInvestmentView } from "@/lib/technology-improvement-plan/pricing";

export type CreateInvoiceLineInput = {
  description: string;
  quantity?: number;
  unitPriceCents: number;
  category?: InvoiceLineCategory;
  taxable?: boolean;
  clientNote?: string;
  internalCostCents?: number;
  projectId?: string;
  recommendationId?: string;
  recurringServiceId?: string;
};

export type CreateInvoiceInput = {
  clientId: string;
  createdByUserId: string;
  sourceType?: InvoiceSourceType;
  tipId?: string;
  projectId?: string;
  depositId?: string;
  paymentTermsDays?: number;
  clientNotes?: string;
  internalNotes?: string;
  issueDate?: Date;
  dueDate?: Date;
  lineItems: CreateInvoiceLineInput[];
  discountCents?: number;
  taxCents?: number;
  creditCents?: number;
  depositAppliedCents?: number;
};

const invoiceInclude = {
  lineItems: { orderBy: { sortOrder: "asc" as const } },
  client: { select: { id: true, companyName: true, primaryContactEmail: true, primaryContactName: true } },
  tip: { select: { id: true, title: true, status: true } },
  project: { select: { id: true, title: true, status: true } },
  deposit: { select: { id: true, label: true, status: true } },
  deliveries: { orderBy: { createdAt: "desc" as const }, take: 10 },
  paymentApplications: {
    include: {
      payment: {
        select: {
          id: true,
          amountCents: true,
          paymentDate: true,
          method: true,
          status: true,
          processor: true,
          transactionReference: true,
        },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
  billingContact: { select: { id: true, name: true, email: true, phone: true } },
} satisfies Prisma.InvoiceInclude;

export async function listInvoices(clientId: string, options?: { staffView?: boolean }) {
  const staffView = options?.staffView ?? true;
  const where: Prisma.InvoiceWhereInput = { clientId };
  if (!staffView) {
    where.status = { in: ["sent", "viewed", "partially_paid", "paid", "overdue", "refunded"] };
  }

  return prisma.invoice.findMany({
    where,
    orderBy: [{ issueDate: "desc" }, { createdAt: "desc" }],
    include: {
      tip: { select: { id: true, title: true } },
      project: { select: { id: true, title: true } },
    },
  });
}

export async function getInvoice(invoiceId: string, clientId: string) {
  return prisma.invoice.findFirst({
    where: { id: invoiceId, clientId },
    include: invoiceInclude,
  });
}

export async function createInvoice(input: CreateInvoiceInput) {
  const client = await prisma.client.findUnique({
    where: { id: input.clientId },
    include: { billingProfile: true },
  });
  if (!client) throw new Error("Client not found");

  const invoiceNumber = await nextInvoiceNumber(input.clientId);
  const paymentTermsDays =
    input.paymentTermsDays ?? client.billingProfile?.paymentTermsDays ?? 30;
  const issueDate = input.issueDate ?? new Date();
  const dueDate =
    input.dueDate ?? new Date(issueDate.getTime() + paymentTermsDays * 24 * 60 * 60 * 1000);

  const lineRows = input.lineItems.map((line, index) => {
    const quantity = line.quantity ?? 1;
    const amountCents = computeLineAmount(quantity, line.unitPriceCents);
    return {
      sortOrder: index,
      description: line.description,
      quantity,
      unitPriceCents: line.unitPriceCents,
      amountCents,
      category: line.category ?? "other",
      taxable: line.taxable ?? false,
      clientNote: line.clientNote,
      internalCostCents: line.internalCostCents,
      projectId: line.projectId,
      recommendationId: line.recommendationId,
      recurringServiceId: line.recurringServiceId,
    };
  });

  const totals = computeInvoiceTotals({
    lineItems: lineRows.map((l) => ({ amountCents: l.amountCents })),
    discountCents: input.discountCents,
    taxCents: input.taxCents,
    creditCents: input.creditCents,
    depositAppliedCents: input.depositAppliedCents,
  });

  const invoice = await prisma.invoice.create({
    data: {
      clientId: input.clientId,
      invoiceNumber,
      status: "draft",
      sourceType: input.sourceType ?? "manual",
      tipId: input.tipId,
      projectId: input.projectId,
      depositId: input.depositId,
      paymentTermsDays,
      issueDate,
      dueDate,
      clientNotes: input.clientNotes,
      internalNotes: input.internalNotes,
      billToName: client.billingProfile?.billingCompanyName ?? client.companyName,
      billToEmail: client.billingProfile?.billingEmail ?? client.primaryContactEmail,
      billToPhone: client.billingProfile?.billingPhone ?? client.primaryContactPhone,
      createdByUserId: input.createdByUserId,
      ...totals,
      lineItems: { create: lineRows },
    },
    include: invoiceInclude,
  });

  await recordBillingAudit({
    clientId: input.clientId,
    invoiceId: invoice.id,
    action: "invoice_created",
    actorUserId: input.createdByUserId,
    metadata: { sourceType: invoice.sourceType, invoiceNumber },
  });

  return invoice;
}

export async function createInvoiceFromTip(
  clientId: string,
  tipId: string,
  userId: string,
  userRole: import("@/generated/prisma/client").UserRole,
) {
  const plan = await getTipPlan(clientId, tipId, userRole);
  if (!plan) throw new Error("Technology Improvement Plan not found");

  const investment = computeInvestmentView(plan.wizardState.investment);
  const lineItems: CreateInvoiceLineInput[] = [];

  if (investment.labor > 0) {
    lineItems.push({
      description: "Professional Services — consulting, engineering, and implementation labor",
      unitPriceCents: dollarsToCents(investment.labor),
      category: "professional_services",
    });
  }
  if (investment.hardware > 0) {
    lineItems.push({
      description: "Technology & Hardware — equipment, licensing, and infrastructure",
      unitPriceCents: dollarsToCents(investment.hardware),
      category: "technology_hardware",
    });
  }
  if (investment.services > 0) {
    lineItems.push({
      description: "Managed Services — ongoing service delivery and operational support",
      unitPriceCents: dollarsToCents(investment.services),
      category: "managed_services",
    });
  }
  if (investment.marginAmount > 0) {
    lineItems.push({
      description: "Program delivery & project management",
      unitPriceCents: dollarsToCents(investment.marginAmount),
      category: "professional_services",
      internalCostCents: 0,
    });
  }

  if (lineItems.length === 0) {
    lineItems.push({
      description: plan.title,
      unitPriceCents: dollarsToCents(investment.clientTotal),
      category: "professional_services",
    });
  }

  return createInvoice({
    clientId,
    createdByUserId: userId,
    sourceType: "technology_improvement_plan",
    tipId,
    clientNotes: `Technology Improvement Plan v${plan.version}`,
    lineItems,
  });
}

export async function createInvoiceFromProject(
  clientId: string,
  projectId: string,
  userId: string,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, clientId },
  });
  if (!project) throw new Error("Project not found");
  if (!project.estimatedCost) throw new Error("Project has no estimated cost");

  return createInvoice({
    clientId,
    createdByUserId: userId,
    sourceType: "project",
    projectId,
    lineItems: [
      {
        description: project.title,
        unitPriceCents: dollarsToCents(Number(project.estimatedCost)),
        category: "professional_services",
        projectId,
      },
    ],
  });
}

export async function updateDraftInvoice(
  invoiceId: string,
  clientId: string,
  userId: string,
  patch: Partial<{
    clientNotes: string;
    internalNotes: string;
    paymentTermsDays: number;
    dueDate: Date;
    discountCents: number;
    taxCents: number;
    creditCents: number;
    depositAppliedCents: number;
    status: InvoiceStatus;
    lineItems: CreateInvoiceLineInput[];
  }>,
) {
  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, clientId },
    include: { lineItems: true },
  });
  if (!existing) throw new Error("Invoice not found");
  if (existing.status !== "draft" && existing.status !== "ready_to_send") {
    throw new Error("Only draft invoices can be edited");
  }

  let lineItems = existing.lineItems;
  if (patch.lineItems) {
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId } });
    lineItems = await Promise.all(
      patch.lineItems.map((line, index) =>
        prisma.invoiceLineItem.create({
          data: {
            invoiceId,
            sortOrder: index,
            description: line.description,
            quantity: line.quantity ?? 1,
            unitPriceCents: line.unitPriceCents,
            amountCents: computeLineAmount(line.quantity ?? 1, line.unitPriceCents),
            category: line.category ?? "other",
            taxable: line.taxable ?? false,
            clientNote: line.clientNote,
            internalCostCents: line.internalCostCents,
            projectId: line.projectId,
            recommendationId: line.recommendationId,
            recurringServiceId: line.recurringServiceId,
          },
        }),
      ),
    );
  }

  const totals = computeInvoiceTotals({
    lineItems,
    discountCents: patch.discountCents ?? existing.discountCents,
    taxCents: patch.taxCents ?? existing.taxCents,
    creditCents: patch.creditCents ?? existing.creditCents,
    depositAppliedCents: patch.depositAppliedCents ?? existing.depositAppliedCents,
    amountPaidCents: existing.amountPaidCents,
  });

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      clientNotes: patch.clientNotes,
      internalNotes: patch.internalNotes,
      paymentTermsDays: patch.paymentTermsDays,
      dueDate: patch.dueDate,
      status: patch.status,
      ...totals,
    },
    include: invoiceInclude,
  });

  await recordBillingAudit({
    clientId,
    invoiceId,
    action: "invoice_edited",
    actorUserId: userId,
  });

  return updated;
}

export async function voidInvoice(invoiceId: string, clientId: string, userId: string, reason?: string) {
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, clientId } });
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "paid") throw new Error("Paid invoices cannot be voided without adjustment");

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "voided",
      voidedAt: new Date(),
      voidedByUserId: userId,
      voidReason: reason,
    },
    include: invoiceInclude,
  });

  await recordBillingAudit({
    clientId,
    invoiceId,
    action: "invoice_voided",
    actorUserId: userId,
    metadata: { reason },
  });

  return updated;
}

export async function duplicateInvoice(invoiceId: string, clientId: string, userId: string) {
  const source = await getInvoice(invoiceId, clientId);
  if (!source) throw new Error("Invoice not found");

  return createInvoice({
    clientId,
    createdByUserId: userId,
    sourceType: source.sourceType,
    tipId: source.tipId ?? undefined,
    projectId: source.projectId ?? undefined,
    clientNotes: source.clientNotes ?? undefined,
    internalNotes: source.internalNotes ?? undefined,
    paymentTermsDays: source.paymentTermsDays,
    discountCents: source.discountCents,
    taxCents: source.taxCents,
    creditCents: source.creditCents,
    depositAppliedCents: source.depositAppliedCents,
    lineItems: source.lineItems.map((line) => ({
      description: line.description,
      quantity: Number(line.quantity),
      unitPriceCents: line.unitPriceCents,
      category: line.category,
      taxable: line.taxable,
      clientNote: line.clientNote ?? undefined,
      internalCostCents: line.internalCostCents ?? undefined,
      projectId: line.projectId ?? undefined,
      recommendationId: line.recommendationId ?? undefined,
      recurringServiceId: line.recurringServiceId ?? undefined,
    })),
  });
}

export async function refreshInvoicePaymentState(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { paymentApplications: true },
  });
  if (!invoice) return null;

  const amountPaidCents = invoice.paymentApplications.reduce(
    (sum, app) => sum + app.appliedCents,
    0,
  );
  const totals = computeInvoiceTotals({
    lineItems: [{ amountCents: invoice.subtotalCents }],
    discountCents: invoice.discountCents,
    taxCents: invoice.taxCents,
    creditCents: invoice.creditCents,
    depositAppliedCents: invoice.depositAppliedCents,
    amountPaidCents,
  });

  const status = deriveInvoiceStatus(
    invoice.status,
    totals.balanceDueCents,
    totals.totalCents,
    amountPaidCents,
    invoice.dueDate,
  ) as InvoiceStatus;

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaidCents,
      balanceDueCents: totals.balanceDueCents,
      status,
      paidAt: status === "paid" ? invoice.paidAt ?? new Date() : null,
    },
  });
}

export async function markInvoicesOverdue(clientId?: string) {
  const now = new Date();
  const invoices = await prisma.invoice.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      dueDate: { lt: now },
      balanceDueCents: { gt: 0 },
      status: { in: ["sent", "viewed", "partially_paid"] },
    },
  });

  for (const invoice of invoices) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "overdue" },
    });
    await recordBillingAudit({
      clientId: invoice.clientId,
      invoiceId: invoice.id,
      action: "invoice_marked_overdue",
    });
  }

  return invoices.length;
}
