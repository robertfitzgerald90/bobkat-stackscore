import type { BillingDepositType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { recordBillingAudit } from "@/lib/billing/audit";
import { createInvoice } from "@/lib/billing/invoice-service";

export async function listDeposits(clientId: string) {
  return prisma.billingDeposit.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: {
      tip: { select: { id: true, title: true } },
      project: { select: { id: true, title: true } },
    },
  });
}

export async function createDeposit(input: {
  clientId: string;
  depositType: BillingDepositType;
  label: string;
  amountCents?: number;
  percentage?: number;
  tipId?: string;
  projectId?: string;
  userId: string;
}) {
  const deposit = await prisma.billingDeposit.create({
    data: {
      clientId: input.clientId,
      depositType: input.depositType,
      label: input.label,
      amountCents: input.amountCents,
      percentage: input.percentage,
      tipId: input.tipId,
      projectId: input.projectId,
      status: "requested",
      requestedAt: new Date(),
    },
  });

  await recordBillingAudit({
    clientId: input.clientId,
    action: "deposit_requested",
    actorUserId: input.userId,
    metadata: { depositId: deposit.id, label: input.label },
  });

  return deposit;
}

export async function createDepositInvoice(
  depositId: string,
  clientId: string,
  userId: string,
) {
  const deposit = await prisma.billingDeposit.findFirst({
    where: { id: depositId, clientId },
  });
  if (!deposit) throw new Error("Deposit not found");
  if (!deposit.amountCents) throw new Error("Deposit amount is required");

  const invoice = await createInvoice({
    clientId,
    createdByUserId: userId,
    sourceType: "deposit_request",
    depositId,
    tipId: deposit.tipId ?? undefined,
    projectId: deposit.projectId ?? undefined,
    clientNotes: deposit.label,
    lineItems: [
      {
        description: deposit.label,
        unitPriceCents: deposit.amountCents,
        category: "deposit",
      },
    ],
  });

  await prisma.billingDeposit.update({
    where: { id: depositId },
    data: { status: "invoice_sent" },
  });

  return invoice;
}

export async function isProjectDepositSatisfied(projectId: string): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { requiredDeposit: true },
  });
  if (!project?.requiredDepositId || !project.requiredDeposit) return true;
  return ["paid", "applied"].includes(project.requiredDeposit.status);
}

export async function assertProjectDepositGate(projectId: string) {
  const satisfied = await isProjectDepositSatisfied(projectId);
  if (!satisfied) {
    throw new Error("Required deposit must be paid before scheduling this project");
  }
}
