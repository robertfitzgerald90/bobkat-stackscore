import { describe, expect, it } from "vitest";
import {
  doc114CategoryLabelForPillar,
  doc114PlaybookForPillar,
  PILLAR_TO_DOC114_CATEGORY,
} from "@/lib/assessment-library/doc114-taxonomy";
import { V2_PILLAR_CODES } from "@/lib/assessment-library/v2-catalog";

describe("DOC-114 taxonomy mapping", () => {
  it("maps all eight pillars to DOC-114 reporting categories", () => {
    expect(Object.keys(PILLAR_TO_DOC114_CATEGORY)).toHaveLength(8);
    for (const pillarCode of V2_PILLAR_CODES) {
      expect(PILLAR_TO_DOC114_CATEGORY[pillarCode as keyof typeof PILLAR_TO_DOC114_CATEGORY]).toBeTruthy();
    }
  });

  it("resolves executive labels and playbooks for pillars", () => {
    expect(doc114CategoryLabelForPillar("identity_access")).toBe("Security");
    expect(doc114PlaybookForPillar("data_protection_recovery")).toBe("Business Continuity");
    expect(doc114CategoryLabelForPillar("productivity_collaboration")).toBe("Productivity");
  });
});
