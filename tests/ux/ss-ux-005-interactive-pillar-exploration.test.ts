import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  resolveCustomerOpportunityComplexity,
  resolveMappedPlaybookIdForService,
} from "@/lib/customer-portal/complexity";
import {
  buildCustomerPillarDetail,
  buildCustomerPillarTiles,
  isTechnologyPillarCode,
  PILLAR_NEXT_ACTION_LIMIT,
} from "@/lib/customer-portal/pillar-detail-dto";
import { MEANINGFUL_STRENGTH_MIN_PERCENT } from "@/lib/assessments/customer-trust";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import { CLIENT_EQUAL_CARD_GRID, CLIENT_INTERACTIVE_TILE } from "@/lib/client-ui/tokens";

describe("SS-UX-005 interactive pillar exploration", () => {
  it("validates canonical pillar codes for deep links", () => {
    expect(isTechnologyPillarCode("identity_access")).toBe(true);
    expect(isTechnologyPillarCode("not_a_pillar")).toBe(false);
    expect(buildCustomerPillarTiles("c1", []).map((p) => p.code)).toEqual(
      TECHNOLOGY_PILLARS.map((p) => p.code),
    );
  });

  it("maps playbook effort only with explicit service mappings", () => {
    expect(resolveMappedPlaybookIdForService(null)).toBeNull();
    expect(resolveMappedPlaybookIdForService("Unknown Service XYZ")).toBeNull();
    expect(resolveMappedPlaybookIdForService("MFA Deployment")).toBe("cybersecurity");

    const classified = resolveCustomerOpportunityComplexity("MFA Deployment");
    expect(classified.displayLabel).toBe("Moderate");
    expect(classified.effortLevel).toBe("medium");

    const missing = resolveCustomerOpportunityComplexity(null);
    expect(missing.displayLabel).toBe("Not classified");
    expect(missing.label).toBeNull();
  });

  it("does not infer complexity from urgency or impact fields", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/complexity.ts"),
      "utf8",
    );
    expect(source).not.toContain("estimatedImpactPoints");
    expect(source).toContain("resolveMappedPlaybookIdForService");
    expect(source).toContain("effortLevel");
  });

  it("builds pillar detail with evidence-based strength rules", () => {
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight: {
        pillarCode: "identity_access",
        pillarName: "Identity & Access",
        businessQuestion: "q",
        percentScore: 62,
        maturityTier: null,
        trendDelta: null,
        openRecommendationCount: 0,
        status: "complete",
        questionsAnswered: 4,
        questionsTotal: 4,
      },
      responses: [
        {
          questionText: "Is MFA enforced?",
          answerText: "Yes, organization-wide",
          scoreEarned: 4,
          maxScore: 4,
          isCritical: false,
          questionCode: "q1",
        },
        {
          questionText: "Are privileged accounts reviewed?",
          answerText: "No formal process",
          scoreEarned: 0,
          maxScore: 4,
          isCritical: true,
          questionCode: "q2",
        },
      ],
      recommendations: [
        {
          id: "rec-1",
          title: "Deploy MFA",
          priority: "critical",
          status: "open",
          estimatedImpactPoints: 10,
          suggestedService: "MFA Deployment",
        },
        {
          id: "rec-2",
          title: "Review admins",
          priority: "high",
          status: "open",
          estimatedImpactPoints: 5,
          suggestedService: null,
        },
      ],
      hasCompletedAssessment: true,
    });

    expect(detail.score).toBe(62);
    expect(detail.maturityLabel).toBe("Developing");
    expect(detail.maturitySummary).toContain("Developing");
    expect(detail.strength.kind).toBe("demonstrated");
    expect(detail.strength.summary).toContain("MFA");
    expect(detail.weakness.evidence?.isCritical).toBe(true);
    expect(detail.opportunities[0]?.priority).toBe("critical");
    expect(detail.opportunities[0]?.complexity.displayLabel).toBe("Moderate");
    expect(detail.opportunities[1]?.complexity.displayLabel).toBe("Not classified");
    expect(detail.nextActions.length).toBeLessThanOrEqual(PILLAR_NEXT_ACTION_LIMIT);
    expect(MEANINGFUL_STRENGTH_MIN_PERCENT).toBe(55);
  });

  it("reports no demonstrated strength below Developing threshold", () => {
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "endpoint_management",
      insight: {
        pillarCode: "endpoint_management",
        pillarName: "Endpoint Management",
        businessQuestion: "q",
        percentScore: 39,
        maturityTier: null,
        trendDelta: null,
        openRecommendationCount: 0,
        status: "complete",
        questionsAnswered: 2,
        questionsTotal: 2,
      },
      responses: [
        {
          questionText: "Are devices managed?",
          answerText: "Partially",
          scoreEarned: 2,
          maxScore: 4,
          isCritical: false,
          questionCode: "q1",
        },
      ],
      recommendations: [],
      hasCompletedAssessment: true,
    });

    expect(detail.maturityLabel).toBe("Initial");
    expect(detail.strength.kind).not.toBe("demonstrated");
    expect(detail.strength.summary.toLowerCase()).toMatch(/no demonstrated strength|relative/);
  });

  it("wires Explore interactive experience and equal-height grids", () => {
    const page = readFileSync(
      join(process.cwd(), "src/app/(dashboard)/clients/[id]/explore/page.tsx"),
      "utf8",
    );
    const experience = readFileSync(
      join(process.cwd(), "src/components/customer-portal/explore/customer-explore-experience.tsx"),
      "utf8",
    );
    const overview = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/overview.ts"),
      "utf8",
    );

    expect(page).toContain("getCustomerExplore");
    expect(page).toContain("CustomerExploreExperience");
    expect(experience).toContain("router.push");
    expect(experience).toContain("searchParams");
    expect(experience).toContain("PillarSelector");
    expect(experience).toContain("PillarOverview");
    expect(CLIENT_INTERACTIVE_TILE).toContain("h-full");
    expect(CLIENT_EQUAL_CARD_GRID).toContain("auto-rows-fr");
    expect(overview).toContain("initiativesTotal");
  });
});
