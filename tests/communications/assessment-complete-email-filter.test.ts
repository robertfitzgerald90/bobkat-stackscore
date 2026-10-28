import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { filterClientDeliverableRecommendations } from "@/lib/recommendations/visibility";

/**
 * DEF-003: assessment-complete email must use the shared client deliverable policy.
 */
describe("assessment-complete email recommendation filter (DEF-003)", () => {
  it("uses filterClientDeliverableRecommendations for client email payloads", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/communications/workflows/triggers.ts"),
      "utf8",
    );
    expect(source).toContain("filterClientDeliverableRecommendations");
    expect(source).toContain('"client"');
    expect(source).not.toContain("!isStubRecommendationTemplate(rec.recommendationTemplate?.code)");
  });

  it("rejects stubs, Improve titles, and missing template codes; keeps published rows", () => {
    const rows = [
      {
        id: "published",
        title: "Centralize workforce identity and authentication",
        priority: "critical",
        recommendationTemplate: { code: "REC-IA-001" },
      },
      {
        id: "stub",
        title: "Improve Endpoint Management",
        priority: "high",
        recommendationTemplate: { code: "REC-TEST-STUB-001" },
      },
      {
        id: "stale",
        title: "Improve Identity Access",
        priority: "critical",
        recommendationTemplate: { code: "REC-IA-001" },
      },
      {
        id: "missing-code",
        title: "Orphan custom recommendation",
        priority: "high",
        recommendationTemplate: null,
      },
    ];

    const safe = filterClientDeliverableRecommendations(rows, "client");
    expect(safe.map((row) => row.id)).toEqual(["published"]);
  });
});
