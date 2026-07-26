import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { recordAdminAuditEvent, type AdminAuditActor } from "@/lib/admin/audit-log";

export type WebsiteLeadAuditMetadata = Prisma.InputJsonValue;

export async function recordWebsiteLeadAuditEvent(input: {
  action:
    | "website_lead_received"
    | "website_lead_confirmation_sent"
    | "website_lead_viewed"
    | "website_lead_status_changed"
    | "website_lead_converted"
    | "website_lead_deleted";
  entityId: string;
  summary: string;
  source?: string;
  actor?: AdminAuditActor | null;
  metadata?: WebsiteLeadAuditMetadata;
}) {
  if (input.actor) {
    await recordAdminAuditEvent({
      action: input.action,
      entityType: "WebsiteLead",
      entityId: input.entityId,
      actor: input.actor,
      summary: input.summary,
      source: input.source ?? "website-leads",
      metadata: input.metadata,
    });
    return;
  }

  const payload = {
    action: input.action,
    entityType: "WebsiteLead",
    entityId: input.entityId,
    summary: input.summary,
    source: input.source ?? "website-leads",
    metadata: input.metadata ?? null,
  };

  console.info("[admin-audit]", payload);

  try {
    await prisma.adminAuditEvent.create({
      data: {
        action: input.action,
        entityType: "WebsiteLead",
        entityId: input.entityId,
        actorUserId: null,
        summary: input.summary,
        source: input.source ?? "website-leads",
        metadataJson: input.metadata ?? undefined,
      },
    });
  } catch (error) {
    console.warn("[admin-audit] Failed to persist WebsiteLead audit event", {
      action: input.action,
      entityId: input.entityId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
