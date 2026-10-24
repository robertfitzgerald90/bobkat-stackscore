import { describe, expect, it } from "vitest";
import {
  presentRecommendationForRole,
  presentRecommendationsForRole,
} from "@/lib/recommendations/visibility";

const staffRow = {
  id: "rec-1",
  title: "Backup Validation",
  description: "Validate restores monthly",
  businessImpact: "Recover faster",
  suggestedService: "Managed Backup",
  latestTriggerReason: "BKP-01: Never tested",
  templateCode: "backup_restore_test",
  dedupeKey: "backup|restore",
  consolidationGroupId: "group-1",
  createdByUserId: "user-1",
  priority: "high",
  status: "open",
  estimatedImpactPoints: 8,
};

describe("recommendation visibility", () => {
  it("keeps consulting fields for staff", () => {
    expect(presentRecommendationForRole(staffRow, "technician")).toEqual(staffRow);
    expect(presentRecommendationForRole(staffRow, "admin").latestTriggerReason).toBe(
      "BKP-01: Never tested",
    );
  });

  it("removes engine and playbook fields for clients while keeping service names", () => {
    const presented = presentRecommendationForRole(staffRow, "client");
    expect(presented.title).toBe("Backup Validation");
    expect(presented.suggestedService).toBe("Managed Backup");
    expect(presented.businessImpact).toBe("Recover faster");
    expect(presented.latestTriggerReason).toBeUndefined();
    expect(presented.templateCode).toBeUndefined();
    expect(presented.dedupeKey).toBeUndefined();
    expect(presented.consolidationGroupId).toBeUndefined();
    expect(presented.createdByUserId).toBeUndefined();
  });

  it("maps arrays for the caller role", () => {
    const [clientFacing] = presentRecommendationsForRole([staffRow], "client");
    expect(clientFacing?.latestTriggerReason).toBeUndefined();
    expect(presentRecommendationsForRole([staffRow], "admin")[0]?.templateCode).toBe(
      "backup_restore_test",
    );
  });

  it("withholds stub catalog recommendations from client delivery", () => {
    const stubRow = {
      ...staffRow,
      id: "stub-1",
      templateCode: "REC-EP-001",
      title: "Stub Endpoint Recommendation",
    };
    expect(presentRecommendationsForRole([stubRow, staffRow], "client")).toHaveLength(1);
    expect(presentRecommendationsForRole([stubRow, staffRow], "client")[0]?.id).toBe("rec-1");
    expect(presentRecommendationsForRole([stubRow], "admin")).toHaveLength(1);
  });

  it("allows published Batch B1 recommendations through client delivery filters", () => {
    const approvedRow = {
      ...staffRow,
      id: "b1-1",
      templateCode: "REC-IA-001",
      title: "Centralize workforce identity and authentication",
    };
    expect(presentRecommendationsForRole([approvedRow], "client")).toHaveLength(1);
    expect(presentRecommendationsForRole([approvedRow], "client")[0]?.title).toBe(
      "Centralize workforce identity and authentication",
    );
  });
});
