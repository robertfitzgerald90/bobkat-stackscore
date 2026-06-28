import { describe, expect, it } from "vitest";
import {
  hasAnyCategoryScore,
  isBusinessSnapshotSparse,
} from "@/lib/technology-profile/display";

describe("technology profile display helpers", () => {
  it("detects sparse business snapshots", () => {
    expect(
      isBusinessSnapshotSparse({
        industry: null,
        employeeCount: null,
        numberOfLocations: null,
        primaryBusinessGoal: null,
        primaryBusinessGoalLabel: "—",
        technologyVision: null,
        itSupportModel: null,
        itSupportModelLabel: "—",
        environmentType: null,
        environmentTypeLabel: "—",
        complianceFramework: null,
        complianceFrameworkLabel: "—",
        complianceStatus: null,
        primaryContactName: "Alex",
        primaryContactTitle: null,
        primaryContactEmail: "alex@example.com",
        primaryContactPhone: null,
      }),
    ).toBe(true);
  });

  it("detects populated business snapshots", () => {
    expect(
      isBusinessSnapshotSparse({
        industry: "Legal",
        employeeCount: null,
        numberOfLocations: null,
        primaryBusinessGoal: null,
        primaryBusinessGoalLabel: "—",
        technologyVision: null,
        itSupportModel: null,
        itSupportModelLabel: "—",
        environmentType: null,
        environmentTypeLabel: "—",
        complianceFramework: null,
        complianceFrameworkLabel: "—",
        complianceStatus: null,
        primaryContactName: "Alex",
        primaryContactTitle: null,
        primaryContactEmail: "alex@example.com",
        primaryContactPhone: null,
      }),
    ).toBe(false);
  });

  it("detects when any category has a score", () => {
    expect(
      hasAnyCategoryScore([
        { percentScore: null },
        { percentScore: 72 },
      ]),
    ).toBe(true);

    expect(
      hasAnyCategoryScore([
        { percentScore: null },
        { percentScore: null },
      ]),
    ).toBe(false);
  });
});
