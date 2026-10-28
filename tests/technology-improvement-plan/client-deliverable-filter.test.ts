import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { filterClientDeliverableRecommendations } from "@/lib/recommendations/visibility";

/**
 * DEF-002: published TIP / proposal assembly must apply client deliverable filters.
 */
describe("TIP / proposal client deliverable filtering (DEF-002)", () => {
  it("wires assembleTipPlanDetail through filterClientDeliverableRecommendations", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/technology-improvement-plan/service.ts"),
      "utf8",
    );
    expect(source).toContain("filterClientDeliverableRecommendations");
    expect(source).toContain("recommendationTemplate: { select: { code: true } }");
    expect(source).toContain("toRecommendationSeeds(recommendations, role)");
  });

  it("proposal API returns role-scoped assembly (clients cannot bypass via GET)", () => {
    const route = readFileSync(
      join(process.cwd(), "src/app/api/v1/clients/[id]/proposals/[tipId]/route.ts"),
      "utf8",
    );
    expect(route).toContain("getPublishedProposalDetail");
    expect(route).toContain("user.role");
    expect(route).toContain("requireClientWorkspaceAccess");
  });

  it("positive: published B1 rows remain visible to clients", () => {
    const rows = [
      {
        id: "1",
        title: "Centralize workforce identity and authentication",
        recommendationTemplate: { code: "REC-IA-001" },
      },
    ];
    expect(filterClientDeliverableRecommendations(rows, "client")).toHaveLength(1);
    expect(filterClientDeliverableRecommendations(rows, "admin")).toHaveLength(1);
  });

  it("negative: stubs, Improve titles, and missing codes are hidden from clients", () => {
    const rows = [
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
        title: "Custom note without template",
      },
      {
        id: "ok",
        title: "Require multi-factor authentication for privileged and business-critical access",
        recommendationTemplate: { code: "REC-IA-002" },
      },
    ];
    const forClient = filterClientDeliverableRecommendations(rows, "client");
    expect(forClient.map((row) => row.id)).toEqual(["ok"]);
    expect(filterClientDeliverableRecommendations(rows, "technician")).toHaveLength(4);
  });
});
