import type { BillingAuditAction, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export async function recordBillingAudit(input: {
  clientId?: string;
  invoiceId?: string;
  paymentId?: string;
  action: BillingAuditAction;
  actorUserId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.billingAuditEvent.create({
    data: {
      clientId: input.clientId,
      invoiceId: input.invoiceId,
      paymentId: input.paymentId,
      action: input.action,
      actorUserId: input.actorUserId,
      metadataJson: input.metadata
        ? (input.metadata as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
