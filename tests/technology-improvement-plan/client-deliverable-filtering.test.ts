import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  filterClientDeliverableRecommendations,
  isClientDeliverableRecommendation,
} from "@/lib/recommendations/visibility";

describe("TIP / published proposal client deliverable filtering (DEF-002)", () => {
  const rows = [
    {
      id: "approved",
      title: "Centralize workforce identity and authentication",
      recommendationTemplate: { code: "REC-IA-001" },
      category: { name: "Identity & Access" },
    },
    {
      id: "stub",
      title: "Improve Endpoint Management",
      recommendationTemplate: { code: "REC-EP-001" },
      category: { name: "Endpoint Management" },
    },
    {
      id: "stale",
      title: "Improve Identity Access",
      recommendationTemplate: { code: "REC-IA-001" },
      category: { name: "Identity & Access" },
    },
    {
      id: "missing-code",
      title: "Custom consultant note",
      recommendationTemplate: null,
      category: { name: "Identity & Access" },
    },
  ];

  it("keeps only published, non-placeholder recommendations for clients", () => {
    const forClient = filterClientDeliverableRecommendations(rows, "client");
    expect(forClient.map((row) => row.id)).toEqual(["approved"]);
  });

  it("preserves all rows for consultant and admin audiences", () => {
    expect(filterClientDeliverableRecommendations(rows, "technician")).toHaveLength(4);
    expect(filterClientDeliverableRecommendations(rows, "admin")).toHaveLength(4);
  });

  it("rejects each fail-closed condition individually", () => {
    expect(isClientDeliverableRecommendation(rows[0]!, "client")).toBe(true);
    expect(isClientDeliverableRecommendation(rows[1]!, "client")).toBe(false); // stub
    expect(isClientDeliverableRecommendation(rows[2]!, "client")).toBe(false); // Improve title
    expect(isClientDeliverableRecommendation(rows[3]!, "client")).toBe(false); // missing code
  });

  it("wires TIP assembly through filterClientDeliverableRecommendations with template include", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/technology-improvement-plan/service.ts"),
      "utf8",
    );
    expect(source).toContain("filterClientDeliverableRecommendations");
    expect(source).toContain("recommendationTemplate: { select: { code: true } }");
    expect(source).toContain("toRecommendationSeeds(recommendations, role)");
  });

  it("published proposal API resolves detail through role-aware assembly", () => {
    const proposalRoute = readFileSync(
      join(process.cwd(), "src/app/api/v1/clients/[id]/proposals/[tipId]/route.ts"),
      "utf8",
    );
    const proposalsService = readFileSync(
      join(process.cwd(), "src/lib/proposals/service.ts"),
      "utf8",
    );
    expect(proposalRoute).toContain("getPublishedProposalDetail");
    expect(proposalRoute).toContain("user.role");
    expect(proposalsService).toContain("assembleTipPlanDetail");
  });
});
