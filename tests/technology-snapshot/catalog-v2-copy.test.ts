import { describe, expect, it } from "vitest";
import { SNAPSHOT_QUESTIONS_V2 } from "@/lib/technology-snapshot/catalog-v2";
import {
  formatItManagementLabel,
  IT_MANAGEMENT_LABELS,
} from "@/lib/technology-snapshot/display";
import { IT_MANAGEMENT_OPTIONS } from "@/lib/technology-snapshot/questions";
import type { SnapshotItManagementModel } from "@/lib/technology-snapshot/types";

describe("SS-SNAP-005 catalog copy and IT management labels", () => {
  it("keeps fourteen questions and stable IDs", () => {
    expect(SNAPSHOT_QUESTIONS_V2).toHaveLength(14);
    expect(SNAPSHOT_QUESTIONS_V2.map((q) => q.id)).toEqual([
      "A1",
      "A2",
      "A3",
      "A4",
      "B1",
      "B2",
      "B3",
      "B4",
      "C1",
      "C2",
      "C3",
      "D1",
      "D2",
      "D3",
    ]);
  });

  it("uses refined A1 MFA wording with help text", () => {
    const a1 = SNAPSHOT_QUESTIONS_V2.find((q) => q.id === "A1");
    expect(a1?.question).toContain("multifactor authentication (MFA)");
    expect(a1?.helpText).toMatch(/additional verification method/i);
  });

  it("uses refined A3 security monitoring wording", () => {
    const a3 = SNAPSHOT_QUESTIONS_V2.find((q) => q.id === "A3");
    expect(a3?.question).toContain("regularly monitor security alerts and anomalies");
  });

  it("uses refined D3 change management wording with help text", () => {
    const d3 = SNAPSHOT_QUESTIONS_V2.find((q) => q.id === "D3");
    expect(d3?.question).toContain("business change management process");
    expect(d3?.helpText).toMatch(/expanding operations/i);
  });

  it("maps every IT management enum to a human-readable label", () => {
    const enums: SnapshotItManagementModel[] = [
      "in_house",
      "outsourced",
      "part_time_internal",
      "none",
      "unsure",
    ];

    for (const value of enums) {
      const label = formatItManagementLabel(value);
      expect(label).toBe(IT_MANAGEMENT_LABELS[value]);
      expect(label).not.toBe(value);
      expect(label).not.toMatch(/_/);
    }

    expect(IT_MANAGEMENT_OPTIONS.map((o) => o.value)).toEqual(enums);
    expect(IT_MANAGEMENT_LABELS.in_house).toBe("In-House IT Team");
    expect(IT_MANAGEMENT_LABELS.part_time_internal).toBe("Internal Employee Handling IT");
  });
});
