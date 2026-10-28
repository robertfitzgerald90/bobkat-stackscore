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
        templateCode: "REC-TEST-STUB-001",
      },
      {
        id: "stale-b1",
        title: "Improve Identity Access",
        templateCode: "REC-IA-001",
      },
    ];

    expect(isStubRecommendationTemplate("REC-IA-001")).toBe(false);
    expect(isStubRecommendationTemplate("REC-TEST-STUB-001")).toBe(true);
    expect(filterClientDeliverableRecommendations(rows, "client")).toEqual([rows[0]]);
    expect(filterClientDeliverableRecommendations(rows, "admin")).toEqual(rows);
  });

  it("marks client roles as client-facing and staff as internal PDF audience", () => {
    expect(isClientFacingRecommendationAudience("client")).toBe(true);
    expect(isClientFacingRecommendationAudience("admin")).toBe(false);
    expect(isClientFacingRecommendationAudience("technician")).toBe(false);
  });

  it("wires assessment PDF export through the deliverable filter with internal filename suffix", () => {
    const routeSource = readFileSync(
      join(process.cwd(), "src/app/api/v1/assessments/[id]/export/pdf/route.ts"),
      "utf8",
    );
    const audienceSource = readFileSync(
      join(process.cwd(), "src/lib/assessments/customer-facing-report.ts"),
      "utf8",
    );
    // SS-REL-013: PDF export uses audience presentation helper, which applies the
    // same fail-closed client-deliverable filter used by other customer surfaces.
    expect(routeSource).toContain("buildAudienceAssessmentReportData");
    expect(routeSource).toContain("isClientFacingRecommendationAudience");
    expect(routeSource).toContain("-internal");
    expect(audienceSource).toContain("filterClientDeliverableRecommendations");
    expect(audienceSource).toContain("selectRecommendationsForAudience");
  });

  it("filters stubs from automated email recommendation workflows", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/communications/workflows/triggers.ts"),
      "utf8",
    );
    expect(source).toContain("filterClientDeliverableRecommendations");
  });
});
