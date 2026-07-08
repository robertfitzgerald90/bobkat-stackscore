import { describe, expect, it } from "vitest";
import {
  buildV2QuestionMetadataPatch,
  getV2QuestionDoc114Metadata,
} from "@/lib/assessment-library/backfill-v2-metadata";
import { V2_CATALOG_BY_ID } from "@/lib/assessment-library/v2-catalog";

describe("getV2QuestionDoc114Metadata", () => {
  it("derives DOC-114 fields from catalog and recommendation sources", () => {
    const catalogEntry = V2_CATALOG_BY_ID.get("IA-001");
    expect(catalogEntry).toBeDefined();
    if (!catalogEntry) return;

    const metadata = getV2QuestionDoc114Metadata(catalogEntry);

    expect(metadata.purpose).toBe(catalogEntry.whyItMatters);
    expect(metadata.helpText).toBe(catalogEntry.whyItMatters);
    expect(metadata.capability).toBe("IA-001");
    expect(metadata.evidenceRequired).toContain("Interview");
    expect(metadata.relatedService).toBe("Technology Improvement Services");
    expect(metadata.relatedPlaybook).toBe("Cybersecurity");
    expect(metadata.adminNotes).toContain("Security");
  });
});

describe("buildV2QuestionMetadataPatch", () => {
  it("fills only missing fields and preserves admin edits", () => {
    const catalogEntry = V2_CATALOG_BY_ID.get("IA-002");
    expect(catalogEntry).toBeDefined();
    if (!catalogEntry) return;

    const patch = buildV2QuestionMetadataPatch(
      {
        purpose: catalogEntry.whyItMatters,
        helpText: null,
        capability: catalogEntry.capability,
        evidenceRequired: null,
        relatedService: "Custom Service",
        relatedPlaybook: null,
        adminNotes: null,
      },
      catalogEntry,
    );

    expect(patch.purpose).toBeUndefined();
    expect(patch.helpText).toBe(catalogEntry.whyItMatters);
    expect(patch.relatedService).toBeUndefined();
    expect(patch.evidenceRequired).toBeTruthy();
    expect(patch.relatedPlaybook).toBe("Cybersecurity");
    expect(patch.adminNotes).toContain("Security");
  });
});
