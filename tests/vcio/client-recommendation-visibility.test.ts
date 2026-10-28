import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { filterClientDeliverableRecommendations } from "@/lib/recommendations/visibility";

describe("vCIO client recommendation visibility", () => {
  const rows = [
    {
      id: "approved",
      title: "Centralize workforce identity and authentication",
      recommendationTemplate: { code: "REC-IA-001" },
    },
    {
      id: "stub",
      title: "Improve Endpoint Management",
      recommendationTemplate: { code: "REC-TEST-STUB-001" },
    },
    {
      id: "stale",
      title: "Improve Identity Access",
      recommendationTemplate: { code: "REC-IA-001" },
    },
    {
      id: "missing",
      title: "Custom note",
      recommendationTemplate: null,
    },
  ];

  it("hides unpublished and placeholder titles from clients while keeping them for staff", () => {
    expect(filterClientDeliverableRecommendations(rows, "client").map((r) => r.id)).toEqual([
      "approved",
    ]);
    expect(filterClientDeliverableRecommendations(rows, "admin")).toHaveLength(4);
    expect(filterClientDeliverableRecommendations(rows, "technician")).toHaveLength(4);
  });

  it("wires vCIO dashboard through filterClientDeliverableRecommendations", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/vcio/page.tsx"),
      "utf8",
    );
    expect(source).toContain("filterClientDeliverableRecommendations");
    expect(source).toContain("visibleOpenRecommendations");
    expect(source).toContain("visibleCompletedRecommendations");
    expect(source).toContain("recommendationTemplate: { select: { code: true } }");
  });

  it("wires vCIO onboarding knownData recommendations through the same filter", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/vcio/onboarding/page.tsx"),
      "utf8",
    );
    expect(source).toContain("filterClientDeliverableRecommendations");
    expect(source).toContain("recommendationTemplate: { select: { code: true } }");
  });
});
