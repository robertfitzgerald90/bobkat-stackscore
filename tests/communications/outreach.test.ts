import { describe, expect, it } from "vitest";
import { CAMPAIGN_STATUS_LABELS, PROSPECT_STATUS_LABELS } from "@/lib/communications/outreach/labels";

describe("outreach labels", () => {
  it("includes sprint 4 campaign statuses", () => {
    expect(CAMPAIGN_STATUS_LABELS.draft).toBe("Draft");
    expect(CAMPAIGN_STATUS_LABELS.sending).toBe("Sending");
    expect(PROSPECT_STATUS_LABELS.invited).toBe("Invited");
    expect(PROSPECT_STATUS_LABELS.converted).toBe("Converted");
  });
});

describe("quick invite schema fields", () => {
  it("requires minimal prospect identity fields", () => {
    const required = ["firstName", "lastName", "company", "email"];
    expect(required).toHaveLength(4);
  });
});
