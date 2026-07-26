import type { TechnologySnapshotLeadStatus } from "@/generated/prisma/client";

export const SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE =
  "This lead has already been converted and cannot be deleted from Snapshot Leads. The linked client or assessment must be managed separately.";

export type SnapshotLeadDeletionBlockInput = {
  status: TechnologySnapshotLeadStatus;
  clientId?: string | null;
  prospectClientId?: string | null;
};

/** Pure helper — safe for client and server. */
export function getSnapshotLeadDeletionBlockReason(
  lead: SnapshotLeadDeletionBlockInput,
): string | null {
  if (lead.status === "converted" || lead.clientId) {
    return SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE;
  }
  if (lead.status === "assessment_purchased") {
    return SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE;
  }
  if (lead.prospectClientId) {
    return SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE;
  }
  return null;
}
