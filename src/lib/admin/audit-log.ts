import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export type AdminAuditActor = {
  id: string;
  name: string;
  email: string;
};

export type RecordAdminAuditEventInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  actor: AdminAuditActor;
  summary: string;
  source?: string;
  metadata?: Prisma.InputJsonValue;
};

/**
 * Persist a lightweight admin audit event and mirror it to structured logs.
 */
export async function recordAdminAuditEvent(input: RecordAdminAuditEventInput) {
  const payload = {
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    actorUserId: input.actor.id,
    actorEmail: input.actor.email,
    actorName: input.actor.name,
    summary: input.summary,
    source: input.source ?? null,
    metadata: input.metadata ?? null,
  };

  console.info("[admin-audit]", payload);

  try {
    return await prisma.adminAuditEvent.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        actorUserId: input.actor.id,
        summary: input.summary,
        source: input.source ?? null,
        metadataJson: {
          actorEmail: input.actor.email,
          actorName: input.actor.name,
          ...(input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata)
            ? (input.metadata as Record<string, unknown>)
            : { details: input.metadata }),
        },
      },
    });
  } catch (error) {
    // Never fail the primary admin action because audit persistence failed.
    console.warn("[admin-audit] Failed to persist AdminAuditEvent", {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
