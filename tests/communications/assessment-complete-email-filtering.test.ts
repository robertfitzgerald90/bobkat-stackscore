import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { filterClientDeliverableRecommendations } from "@/lib/recommendations/visibility";

describe("assessment-complete email recommendation filtering (DEF-003)", () => {
  const rows = [
    {
      id: "approved-high",
      title: "Require multi-factor authentication for privileged and business-critical access",
      priority: "critical",
      recommendationTemplate: { code: "REC-IA-002" },
    },
    {
      id: "stub",
      title: "Improve Endpoint Management",
      priority: "high",
      recommendationTemplate: { code: "REC-EP-001" },
    },
    {
      id: "stale-improve",
      title: "Improve Identity Access",
      priority: "critical",
      recommendationTemplate: { code: "REC-IA-001" },
    },
    {
      id: "missing-code",
      title: "Orphan recommendation without template",
      priority: "high",
      recommendationTemplate: null,
    },
    {
      id: "approved-medium",
      title: "Review user permissions on a recurring schedule",
      priority: "low",
      recommendationTemplate: { code: "REC-IA-009" },
    },
  ];

  it("rejects stubs, Improve titles, and missing template codes", () => {
    const safe = filterClientDeliverableRecommendations(rows, "client");
    expect(safe.map((row) => row.id).sort()).toEqual(["approved-high", "approved-medium"]);
  });

  it("preserves approved published recommendations for email snippets", () => {
    const safe = filterClientDeliverableRecommendations(rows, "client");
    const priorities = safe
      .filter((row) => row.priority === "critical" || row.priority === "high")
      .map((row) => row.title);
    const strengths = safe
      .filter((row) => row.priority === "low" || row.priority === "medium")
      .map((row) => row.title);

    expect(priorities).toEqual([
      "Require multi-factor authentication for privileged and business-critical access",
    ]);
    expect(strengths).toEqual(["Review user permissions on a recurring schedule"]);
  });

  it("wires assessment-complete workflow through filterClientDeliverableRecommendations", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/communications/workflows/triggers.ts"),
      "utf8",
    );
    expect(source).toContain("filterClientDeliverableRecommendations");
    expect(source).toContain('"client"');
    expect(source).not.toContain("!isStubRecommendationTemplate(rec.recommendationTemplate?.code)");
  });
});
