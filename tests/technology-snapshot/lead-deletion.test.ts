import { describe, expect, it } from "vitest";
import {
  getSnapshotLeadDeletionBlockReason,
  SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE,
} from "@/lib/technology-snapshot/lead-deletion";

describe("getSnapshotLeadDeletionBlockReason", () => {
  it("allows deletion for unconverted leads", () => {
    expect(
      getSnapshotLeadDeletionBlockReason({
        status: "new",
        clientId: null,
        prospectClientId: null,
      }),
    ).toBeNull();

    expect(
      getSnapshotLeadDeletionBlockReason({
        status: "contacted",
        clientId: null,
      }),
    ).toBeNull();

    expect(
      getSnapshotLeadDeletionBlockReason({
        status: "assessment_invited",
        clientId: null,
        prospectClientId: null,
      }),
    ).toBeNull();
  });

  it("blocks converted leads with the product message", () => {
    expect(
      getSnapshotLeadDeletionBlockReason({
        status: "converted",
        clientId: null,
      }),
    ).toBe(SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE);

    expect(
      getSnapshotLeadDeletionBlockReason({
        status: "new",
        clientId: "client-1",
      }),
    ).toBe(SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE);

    expect(
      getSnapshotLeadDeletionBlockReason({
        status: "assessment_purchased",
        clientId: null,
      }),
    ).toBe(SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE);

    expect(
      getSnapshotLeadDeletionBlockReason({
        status: "assessment_interested",
        clientId: null,
        prospectClientId: "client-2",
      }),
    ).toBe(SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE);
  });
});
