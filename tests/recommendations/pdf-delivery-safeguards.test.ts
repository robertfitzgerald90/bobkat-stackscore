import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  filterClientDeliverableRecommendations,
  isClientFacingRecommendationAudience,
} from "@/lib/recommendations/visibility";
import { isStubRecommendationTemplate } from "@/lib/recommendations/stubs";

describe("SS-OPT-003B PDF and client delivery safeguards", () => {
  it("fail-closes client PDF audiences for stub recommendations", () => {
    const rows = [
      {
        id: "approved",
        title: "Centralize workforce identity and authentication",
        templateCode: "REC-IA-001",
      },
      {
        id: "stub",
        title: "Improve Endpoint Protection",
        templateCode: "REC-EP-001",
      },
      {
        id: "stale-b1",
        title: "Improve Identity Access",
        templateCode: "REC-IA-001",
      },
    ];

    expect(isStubRecommendationTemplate("REC-IA-001")).toBe(false);
    expect(isStubRecommendationTemplate("REC-EP-001")).toBe(true);
    expect(filterClientDeliverableRecommendations(rows, "client")).toEqual([rows[0]]);
    expect(filterClientDeliverableRecommendations(rows, "admin")).toEqual(rows);
  });

  it("marks client roles as client-facing and staff as internal PDF audience", () => {
    expect(isClientFacingRecommendationAudience("client")).toBe(true);
    expect(isClientFacingRecommendationAudience("admin")).toBe(false);
    expect(isClientFacingRecommendationAudience("technician")).toBe(false);
  });

  it("wires assessment PDF export through the deliverable filter with internal filename suffix", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/v1/assessments/[id]/export/pdf/route.ts"),
      "utf8",
    );
    expect(source).toContain("filterClientDeliverableRecommendations");
    expect(source).toContain("isClientFacingRecommendationAudience");
    expect(source).toContain("-internal");
    expect(source).toContain("Fail-closed");
  });

  it("filters stubs from automated email recommendation workflows", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/communications/workflows/triggers.ts"),
      "utf8",
    );
    expect(source).toContain("isStubRecommendationTemplate");
  });
});
