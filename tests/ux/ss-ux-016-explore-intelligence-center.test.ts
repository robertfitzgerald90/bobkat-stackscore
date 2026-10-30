import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  classifyCustomerAssessmentResult,
  classifyPillarResponses,
  selectExploreAttentionItems,
  selectExploreStrengths,
} from "@/lib/customer-portal/explore-intelligence";
import {
  buildCustomerPillarDetail,
  buildCustomerPillarTiles,
  isTechnologyPillarCode,
  type PillarResponseEvidence,
} from "@/lib/customer-portal/pillar-detail-dto";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import { computeProjectProgress } from "@/lib/projects/progress";

function response(
  overrides: Partial<PillarResponseEvidence> &
    Pick<PillarResponseEvidence, "questionCode" | "answerText" | "scoreEarned">,
): PillarResponseEvidence {
  return {
    questionText: overrides.questionText ?? `Question ${overrides.questionCode}`,
    maxScore: overrides.maxScore ?? 4,
    isCritical: overrides.isCritical ?? false,
    ...overrides,
  };
}

const insight = {
  pillarCode: "identity_access" as const,
  pillarName: "Identity & Access",
  businessQuestion: "q",
  percentScore: 62,
  maturityTier: null,
  trendDelta: null,
  openRecommendationCount: 0,
  status: "complete" as const,
  questionsAnswered: 4,
  questionsTotal: 4,
};

describe("SS-UX-016 — Explore Intelligence Center", () => {
  it("exposes eight pillars from canonical definitions", () => {
    expect(TECHNOLOGY_PILLARS).toHaveLength(8);
    const tiles = buildCustomerPillarTiles("client-1", []);
    expect(tiles).toHaveLength(8);
    expect(tiles.every((tile) => isTechnologyPillarCode(tile.code))).toBe(true);
    expect(tiles.every((tile) => tile.score === null)).toBe(true);
  });

  it("retrieves official pillar score and maturity without inventing values", () => {
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight,
      responses: [],
      recommendations: [],
      hasCompletedAssessment: true,
    });
    expect(detail.score).toBe(62);
    expect(detail.maturityLabel).toBe("Developing");
    expect(detail.controlsAssessed).toBe(0);
    expect(detail.opportunityCount).toBe(0);
  });

  it("classifies Yes / Partially / No / N/A per approved meanings", () => {
    expect(classifyCustomerAssessmentResult("Yes", 4, 4)).toBe("satisfied");
    expect(classifyCustomerAssessmentResult("Partially", 2, 4)).toBe("partial");
    expect(classifyCustomerAssessmentResult("No", 0, 4)).toBe("unsatisfied");
    expect(classifyCustomerAssessmentResult("Not Applicable", 0, 4)).toBe("excluded");
  });

  it("selects strengths from positive answers only", () => {
    const classified = classifyPillarResponses([
      response({ questionCode: "a", answerText: "Yes", scoreEarned: 4 }),
      response({ questionCode: "b", answerText: "No", scoreEarned: 0 }),
      response({ questionCode: "c", answerText: "Partially", scoreEarned: 2 }),
      response({ questionCode: "d", answerText: "Not Applicable", scoreEarned: 0 }),
    ]);
    const strengths = selectExploreStrengths(classified);
    expect(strengths.map((item) => item.questionCode)).toEqual(["a"]);
  });

  it("selects attention items from partial and negative answers", () => {
    const classified = classifyPillarResponses([
      response({ questionCode: "a", answerText: "Yes", scoreEarned: 4 }),
      response({ questionCode: "b", answerText: "Partially", scoreEarned: 2 }),
      response({
        questionCode: "c",
        answerText: "No",
        scoreEarned: 0,
        isCritical: true,
      }),
      response({ questionCode: "d", answerText: "Not Applicable", scoreEarned: 0 }),
    ]);
    const attention = selectExploreAttentionItems(classified);
    expect(attention.map((item) => item.questionCode)).toEqual(["c", "b"]);
    expect(attention.every((item) => item.resultKind !== "excluded")).toBe(true);
  });

  it("excludes N/A from strengths and attention", () => {
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight,
      responses: [
        response({
          questionCode: "na1",
          answerText: "Not Applicable",
          scoreEarned: 0,
          questionText: "Cloud-only control",
        }),
      ],
      recommendations: [],
      hasCompletedAssessment: true,
    });
    expect(detail.strengths).toEqual([]);
    expect(detail.attentionItems).toEqual([]);
    expect(detail.findings).toHaveLength(1);
    expect(detail.findings[0]?.resultKind).toBe("excluded");
    expect(detail.controlsScorable).toBe(0);
  });

  it("handles all-positive assessment without inventing weaknesses", () => {
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight: { ...insight, percentScore: 92 },
      responses: [
        response({ questionCode: "a", answerText: "Yes", scoreEarned: 4 }),
        response({ questionCode: "b", answerText: "Yes", scoreEarned: 4 }),
      ],
      recommendations: [],
      hasCompletedAssessment: true,
    });
    expect(detail.strengths).toHaveLength(2);
    expect(detail.attentionItems).toEqual([]);
    expect(detail.maturityLabel).toBeTruthy();
  });

  it("handles all-negative assessment without inventing strengths", () => {
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight: { ...insight, percentScore: 20 },
      responses: [
        response({ questionCode: "a", answerText: "No", scoreEarned: 0 }),
        response({ questionCode: "b", answerText: "No", scoreEarned: 0 }),
      ],
      recommendations: [],
      hasCompletedAssessment: true,
    });
    expect(detail.strengths).toEqual([]);
    expect(detail.attentionItems).toHaveLength(2);
  });

  it("handles all-N/A assessment", () => {
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight: { ...insight, percentScore: null, status: "incomplete" },
      responses: [
        response({ questionCode: "a", answerText: "Not Applicable", scoreEarned: 0 }),
        response({ questionCode: "b", answerText: "Not Applicable", scoreEarned: 0 }),
      ],
      recommendations: [],
      hasCompletedAssessment: true,
    });
    expect(detail.score).toBeNull();
    expect(detail.strengths).toEqual([]);
    expect(detail.attentionItems).toEqual([]);
    expect(detail.findings.every((item) => item.resultKind === "excluded")).toBe(true);
  });

  it("handles missing assessment responses with empty findings", () => {
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight: null,
      responses: [],
      recommendations: [],
      hasCompletedAssessment: false,
    });
    expect(detail.score).toBeNull();
    expect(detail.findings).toEqual([]);
    expect(detail.strengths).toEqual([]);
    expect(detail.attentionItems).toEqual([]);
    expect(detail.relatedProjects).toEqual([]);
    expect(detail.roadmapInitiatives).toEqual([]);
  });

  it("filters opportunities from input recommendations and preserves approved sections", () => {
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight,
      responses: [],
      recommendations: [
        {
          id: "rec-1",
          title: "Deploy MFA",
          priority: "critical",
          status: "open",
          estimatedImpactPoints: 10,
          suggestedService: "MFA Deployment",
          description:
            "Finding: MFA gaps remain.\nRecommended action: Enforce MFA.\nExpected outcome: Reduced account takeover risk.",
          businessImpact: "Reduce account takeover risk.",
        },
        {
          id: "rec-stub",
          title: "Hidden completed",
          priority: "low",
          status: "completed",
          estimatedImpactPoints: 1,
          suggestedService: null,
          description: null,
          businessImpact: null,
        },
      ],
      hasCompletedAssessment: true,
    });
    expect(detail.opportunities[0]?.finding).toContain("MFA gaps");
    expect(detail.opportunities[0]?.recommendedAction).toContain("Enforce MFA");
    expect(detail.opportunities[0]?.expectedOutcome).toContain("Reduced");
    expect(detail.opportunityCount).toBeGreaterThan(0);
  });

  it("dedupes multi-link projects and reuses task progress", () => {
    const progress = computeProjectProgress([
      { status: "completed" },
      { status: "in_progress" },
    ]);
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight,
      responses: [],
      recommendations: [],
      relatedProjects: [
        {
          id: "p1",
          title: "Admin controls",
          status: "in_progress",
          progressPercent: progress.progressPercent,
          nextMilestoneTitle: "MFA live",
        },
        {
          id: "p1",
          title: "Admin controls duplicate",
          status: "in_progress",
          progressPercent: progress.progressPercent,
          nextMilestoneTitle: "MFA live",
        },
      ],
      roadmapInitiatives: [
        {
          id: "i1",
          title: "Stabilize identity",
          statusLabel: "In Progress",
          phaseId: "phase-1",
          phaseName: "Critical Stabilization",
          targetDate: "2026-12-01T00:00:00.000Z",
        },
      ],
      hasCompletedAssessment: true,
    });
    expect(detail.relatedProjects).toHaveLength(1);
    expect(detail.relatedProjects[0]?.progressPercent).toBe(50);
    expect(detail.relatedProjects[0]?.href).toContain("/projects/p1");
    expect(detail.roadmapInitiatives[0]?.href).toContain("/roadmap/phases/phase-1");
    expect(detail.projectsHref).toContain("/projects");
  });

  it("does not fabricate progress when a project has no tasks", () => {
    const progress = computeProjectProgress([]);
    expect(progress.progressPercent).toBeNull();
    const detail = buildCustomerPillarDetail({
      clientId: "client-1",
      pillarCode: "identity_access",
      insight,
      responses: [],
      recommendations: [],
      relatedProjects: [
        {
          id: "p2",
          title: "Empty checklist",
          status: "proposed",
          progressPercent: progress.progressPercent,
          nextMilestoneTitle: null,
        },
      ],
      hasCompletedAssessment: true,
    });
    expect(detail.relatedProjects[0]?.progressPercent).toBeNull();
  });

  it("does not load or render internalNotes in Explore modules", () => {
    const dto = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/pillar-detail-dto.ts"),
      "utf8",
    );
    const explore = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/pillar-explore.ts"),
      "utf8",
    );
    const panel = readFileSync(
      join(process.cwd(), "src/components/customer-portal/explore/pillar-detail-panel.tsx"),
      "utf8",
    );
    expect(dto).not.toMatch(/internalNotes/);
    expect(explore).not.toMatch(/internalNotes/);
    expect(panel).not.toMatch(/internalNotes/);
    expect(panel).toMatch(/What's Working/);
    expect(panel).toMatch(/What Needs Attention/);
    expect(panel).toMatch(/Improvement activity/);
  });

  it("keeps Explore read-only (no mutation APIs in explore service)", () => {
    const explore = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/pillar-explore.ts"),
      "utf8",
    );
    expect(explore).not.toMatch(/\.create\(|\.update\(|\.delete\(/);
    expect(explore).toMatch(/presentRecommendationsForRole/);
    expect(explore).toMatch(/computeProjectProgress/);
  });
});
