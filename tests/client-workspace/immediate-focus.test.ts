import { describe, expect, it } from "vitest";
import { buildClientWorkspaceSnapshot } from "@/lib/client-workspace/immediate-focus";
import type { ProfileProjectSummary, ProfileRecommendationSummary } from "@/lib/technology-profile/types";

function recommendation(
  overrides: Partial<ProfileRecommendationSummary> & Pick<ProfileRecommendationSummary, "id" | "title">,
): ProfileRecommendationSummary {
  return {
    description: "Details",
    priority: "high",
    status: "open",
    estimatedImpactPoints: 6,
    businessImpact: "Impact",
    suggestedService: null,
    categoryName: "Identity & Access",
    categoryCode: "identity_access",
    categoryId: "cat-1",
    assessmentId: "a1",
    latestAssessmentId: "a1",
    latestAssessmentName: "Baseline",
    latestTriggerReason: null,
    triggeredInLatestAssessment: true,
    isRecurrence: false,
    recurrenceCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    lastTriggeredAt: "2026-01-01T00:00:00.000Z",
    templateCode: "REC-1",
    project: null,
    ...overrides,
  };
}

function project(
  overrides: Partial<ProfileProjectSummary> & Pick<ProfileProjectSummary, "id" | "title">,
): ProfileProjectSummary {
  return {
    status: "in_progress",
    priority: "high",
    estimatedImpactPoints: 8,
    actualImpactPoints: null,
    estimatedCost: null,
    completedAt: null,
    recommendationTitle: "Backup hardening",
    ...overrides,
  };
}

describe("buildClientWorkspaceSnapshot", () => {
  it("builds KPIs and ranks top focus items", () => {
    const snapshot = buildClientWorkspaceSnapshot({
      clientId: "client-1",
      stackScore: 62,
      projectedScore: 78,
      openRecommendations: [
        recommendation({ id: "r1", title: "Enable MFA", priority: "critical" }),
        recommendation({
          id: "r2",
          title: "Document network",
          priority: "medium",
          status: "accepted",
        }),
      ],
      activeProjects: [
        project({ id: "p1", title: "Firewall rollout", priority: "high" }),
      ],
    });

    expect(snapshot.kpis).toMatchObject({
      stackScore: 62,
      projectedScore: 78,
      openProjectsCount: 1,
      criticalRecommendationsCount: 1,
    });
    expect(snapshot.items.length).toBeGreaterThan(0);
    expect(snapshot.items.length).toBeLessThanOrEqual(5);
    expect(snapshot.items[0]?.title).toBeTruthy();
    expect(snapshot.items[0]?.pillarName).toBeTruthy();
  });

  it("prefers active projects over duplicate recommendations", () => {
    const snapshot = buildClientWorkspaceSnapshot({
      clientId: "client-1",
      stackScore: 70,
      projectedScore: 80,
      openRecommendations: [
        recommendation({
          id: "r1",
          title: "Firewall rollout",
          project: { id: "p1", title: "Firewall rollout", status: "in_progress" },
        }),
      ],
      activeProjects: [project({ id: "p1", title: "Firewall rollout" })],
    });

    expect(snapshot.items.filter((item) => item.kind === "project")).toHaveLength(1);
    expect(snapshot.items.filter((item) => item.kind === "recommendation")).toHaveLength(0);
  });
});
