import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCustomerOpportunitiesDto,
  matchesCustomerOpportunityStatusFilter,
  normalizeCustomerOpportunityStatusFilter,
  CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES,
} from "@/lib/customer-portal/opportunities-dto";
import { parseRecommendationDescription } from "@/lib/customer-portal/recommendation-content";
import {
  clientRecommendationDetailPath,
  clientRoadmapPhasePath,
} from "@/lib/clients/paths";

const SAMPLE_DESCRIPTION = [
  "Finding: Assessment responses indicate MFA is inconsistent.",
  "",
  "Recommended action: Enforce MFA for privileged accounts first.",
  "",
  "Expected outcome: Credential theft is less likely to grant access.",
  "",
  "Implementation considerations: Start with remote-access paths.",
].join("\n");

describe("SS-UX-006 customer improvement opportunities", () => {
  it("parses approved Finding / action / outcome / considerations sections", () => {
    const sections = parseRecommendationDescription(SAMPLE_DESCRIPTION);
    expect(sections.hasStructuredSections).toBe(true);
    expect(sections.finding).toContain("MFA is inconsistent");
    expect(sections.recommendedAction).toContain("Enforce MFA");
    expect(sections.expectedOutcome).toContain("Credential theft");
    expect(sections.implementationConsiderations).toContain("remote-access");
  });

  it("does not invent sections when description is unstructured", () => {
    const sections = parseRecommendationDescription("Plain paragraph without labels.");
    expect(sections.hasStructuredSections).toBe(false);
    expect(sections.finding).toBeNull();
    expect(sections.recommendedAction).toBeNull();
  });

  it("normalizes status filters and active semantics", () => {
    expect(normalizeCustomerOpportunityStatusFilter("active")).toBe("active");
    expect(normalizeCustomerOpportunityStatusFilter("completed")).toBe("completed");
    expect(normalizeCustomerOpportunityStatusFilter("nope")).toBeUndefined();
    expect(matchesCustomerOpportunityStatusFilter("open", "active")).toBe(true);
    expect(matchesCustomerOpportunityStatusFilter("deferred", "active")).toBe(false);
    expect(matchesCustomerOpportunityStatusFilter("deferred", "all")).toBe(true);
    expect(CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES).toContain("declined");
    expect(CUSTOMER_VISIBLE_OPPORTUNITY_STATUSES).not.toContain("archived");
  });

  it("builds compact list DTO with summary, filters, and selected deep-link behavior", () => {
    const dto = buildCustomerOpportunitiesDto({
      clientId: "client-1",
      filters: { status: "active", pillarCode: "identity_access" },
      selectedId: "rec-deferred",
      rows: [
        {
          id: "rec-1",
          title: "Centralize identity",
          description: SAMPLE_DESCRIPTION,
          businessImpact: "Access changes stay consistent.",
          suggestedService: "MFA Deployment",
          priority: "critical",
          status: "open",
          estimatedImpactPoints: 10,
          categoryCode: "identity_access",
          categoryName: "Identity & Access",
          roadmapInitiatives: [
            {
              id: "init-1",
              title: "Identity phase initiative",
              phaseId: "phase-1",
              phaseName: "Stabilize",
            },
          ],
        },
        {
          id: "rec-deferred",
          title: "Deferred item",
          description: SAMPLE_DESCRIPTION,
          businessImpact: "Later.",
          suggestedService: null,
          priority: "medium",
          status: "deferred",
          estimatedImpactPoints: 4,
          categoryCode: "identity_access",
          categoryName: "Identity & Access",
          roadmapInitiatives: [],
        },
        {
          id: "rec-other-pillar",
          title: "Other pillar",
          description: SAMPLE_DESCRIPTION,
          businessImpact: "x",
          suggestedService: null,
          priority: "high",
          status: "open",
          estimatedImpactPoints: 5,
          categoryCode: "endpoint_device",
          categoryName: "Endpoint",
          roadmapInitiatives: [],
        },
      ],
    });

    expect(dto.summary.activeOpportunities).toBe(2);
    expect(dto.summary.deferred).toBe(1);
    expect(dto.summary.matching).toBe(1);
    expect(dto.selectedFound).toBe(true);
    expect(dto.selectedOutsideFilter).toBe(true);
    expect(dto.opportunities[0]?.id).toBe("rec-deferred");
    expect(dto.opportunities.some((o) => o.id === "rec-1")).toBe(true);

    const active = dto.opportunities.find((o) => o.id === "rec-1");
    expect(active?.sections.finding).toBeTruthy();
    expect(active?.roadmap?.href).toBe(clientRoadmapPhasePath("client-1", "phase-1"));
    expect(active?.complexity.displayLabel).toBe("Moderate");
    expect(dto.opportunities.every((o) => o.pillarCode !== "endpoint_device")).toBe(true);
  });

  it("fails safely for missing selected ids", () => {
    const dto = buildCustomerOpportunitiesDto({
      clientId: "client-1",
      filters: { status: "active" },
      selectedId: "missing",
      rows: [],
    });
    expect(dto.selectedFound).toBe(false);
    expect(dto.selectedId).toBeNull();
    expect(dto.opportunities).toEqual([]);
  });

  it("preserves Explore deep-link helpers with optional pillar", () => {
    expect(clientRecommendationDetailPath("c1", "r1")).toBe(
      "/clients/c1/recommendations?selected=r1",
    );
    expect(clientRecommendationDetailPath("c1", "r1", { pillarCode: "identity_access" })).toBe(
      "/clients/c1/recommendations?selected=r1&pillar=identity_access",
    );
    expect(clientRoadmapPhasePath("c1", "p1")).toBe("/clients/c1/roadmap/phases/p1");
  });

  it("wires customer opportunities experience without inventing impact guarantees", () => {
    const root = process.cwd();
    const view = readFileSync(
      join(root, "src/components/customer-portal/customer-recommendations-view.tsx"),
      "utf8",
    );
    const page = readFileSync(
      join(root, "src/app/(dashboard)/clients/[id]/recommendations/page.tsx"),
      "utf8",
    );
    const detail = readFileSync(
      join(root, "src/components/customer-portal/opportunities/opportunity-detail.tsx"),
      "utf8",
    );

    expect(page).toContain("getCustomerOpportunities");
    expect(page).toContain("CustomerRecommendationsView");
    expect(page).toContain("isCustomerMode");
    expect(view).toContain("selected");
    expect(view).toContain("OpportunityFilters");
    expect(view).toContain("OpportunityRow");
    expect(view).toContain("buildQuery");
    expect(detail).toContain("Finding");
    expect(detail).toContain("Recommended action");
    expect(detail).toContain("Expected outcome");
    expect(detail).toContain("Implementation considerations");
    expect(detail).toContain("Roadmap relationship");
    expect(detail).not.toContain("guaranteed");
    expect(detail).not.toMatch(/Estimated StackScore improvement/);
  });

  it("does not change recommendation generation or catalog modules", () => {
    const opportunities = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/opportunities.ts"),
      "utf8",
    );
    expect(opportunities).toContain("presentRecommendationsForRole");
    expect(opportunities).not.toContain("syncClientRecommendations");
    expect(opportunities).not.toContain("evaluateTriggers");
  });
});
