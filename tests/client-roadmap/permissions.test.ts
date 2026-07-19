import { describe, expect, it } from "vitest";
import {
  canUpdateInitiativeStatus,
  canUpdatePhaseStatus,
} from "@/lib/client-roadmap/permissions";

describe("roadmap permissions", () => {
  it("allows consultants to change any phase status", () => {
    expect(canUpdatePhaseStatus("admin", "planned", "in_progress")).toBe(true);
    expect(canUpdatePhaseStatus("technician", "awaiting_approval", "cancelled")).toBe(true);
  });

  it("only allows clients to approve awaiting phases", () => {
    expect(canUpdatePhaseStatus("client", "awaiting_approval", "approved")).toBe(true);
    expect(canUpdatePhaseStatus("client", "planned", "approved")).toBe(false);
    expect(canUpdatePhaseStatus("client", "approved", "in_progress")).toBe(false);
  });

  it("restricts initiative status updates to consultants", () => {
    expect(canUpdateInitiativeStatus("admin")).toBe(true);
    expect(canUpdateInitiativeStatus("technician")).toBe(true);
    expect(canUpdateInitiativeStatus("client")).toBe(false);
  });
});
