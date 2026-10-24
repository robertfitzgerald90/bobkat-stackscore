import { describe, expect, it } from "vitest";
import catalog from "../../data/RecommendationCatalogV2.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("SS-OPT-003B catalog template sync contract", () => {
  it("documents that AssessmentRecommendation content is not auto-overwritten on retrigger", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/recommendations/sync.ts"),
      "utf8",
    );
    expect(source).toContain("Preserve existing content + priority");
    expect(source).toContain("consultant edits");
    // Active-path update must not spread generated content fields.
    const activeBlock = source.slice(
      source.indexOf("if (active)"),
      source.indexOf("const declined"),
    );
    expect(activeBlock).not.toContain("...content");
    expect(activeBlock).toContain("latestTriggerReason");
  });

  it("keeps approved vs stub partition aligned with Batch B1 publication", () => {
    const approved = catalog.templates.filter((template) => !template.isStub);
    const stubs = catalog.templates.filter((template) => template.isStub);
    expect(approved).toHaveLength(20);
    expect(stubs).toHaveLength(60);
    expect(approved.every((template) => template.id.startsWith("REC-IA-") || template.id.startsWith("REC-SO-"))).toBe(
      true,
    );
  });
});
