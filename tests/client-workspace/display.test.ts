import { describe, expect, it } from "vitest";
import {
  buildClientWorkspaceSnapshot,
  conciseFocusTitle,
  formatFocusMetadataLine,
} from "@/lib/client-workspace";
import type { ImmediateFocusItem } from "@/lib/client-workspace";

describe("conciseFocusTitle", () => {
  it("removes assessment question suffix after a colon", () => {
    expect(
      conciseFocusTitle(
        "Improve Security Operations: Are vulnerabilities assessed regularly?",
      ),
    ).toBe("Improve Security Operations");
  });

  it("keeps titles without question suffixes", () => {
    expect(conciseFocusTitle("Enable MFA")).toBe("Enable MFA");
    expect(conciseFocusTitle("Improve Security Operations")).toBe(
      "Improve Security Operations",
    );
  });
});

describe("formatFocusMetadataLine", () => {
  it("joins pillar, impact, status, readiness, and source", () => {
    const item: ImmediateFocusItem = {
      id: "1",
      kind: "project",
      title: "Improve Security Operations",
      pillarName: "Security Operations",
      priority: "high",
      estimatedImpactPoints: 10,
      statusLabel: "Approved",
      readinessLabel: "Ready",
      sourceLabel: "From recommendation",
      href: "/projects",
    };

    expect(formatFocusMetadataLine(item)).toBe(
      "Security Operations · +10 pts · Approved · Ready · From recommendation",
    );
  });
});

describe("buildClientWorkspaceSnapshot links", () => {
  it("links recommendations with projects to the project register", () => {
    const snapshot = buildClientWorkspaceSnapshot({
      clientId: "client-1",
      stackScore: 70,
      projectedScore: 80,
      openRecommendations: [
        {
          id: "r1",
          title: "Improve Security Operations: Are vulnerabilities assessed regularly?",
          description: "Details",
          priority: "high",
          status: "open",
          estimatedImpactPoints: 10,
          businessImpact: "Impact",
          suggestedService: null,
          categoryName: "Security Operations",
          categoryCode: "security_operations",
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
          project: { id: "p1", title: "Security project", status: "proposed" },
        },
      ],
      activeProjects: [],
    });

    const recommendationItem = snapshot.items.find((item) => item.kind === "recommendation");
    expect(recommendationItem?.title).toBe("Improve Security Operations");
    expect(recommendationItem?.href).toBe("/projects?client=client-1&selected=p1");
    expect(recommendationItem?.sourceLabel).toBe("From recommendation");
  });

  it("links recommendation-only items to the recommendations list", () => {
    const snapshot = buildClientWorkspaceSnapshot({
      clientId: "client-1",
      stackScore: 70,
      projectedScore: 80,
      openRecommendations: [
        {
          id: "r2",
          title: "Enable MFA",
          description: "Details",
          priority: "critical",
          status: "open",
          estimatedImpactPoints: 5,
          businessImpact: "Impact",
          suggestedService: null,
          categoryName: "Identity & Access",
          categoryCode: "identity_access",
          categoryId: "cat-2",
          assessmentId: "a1",
          latestAssessmentId: "a1",
          latestAssessmentName: "Baseline",
          latestTriggerReason: null,
          triggeredInLatestAssessment: true,
          isRecurrence: false,
          recurrenceCount: 0,
          createdAt: "2026-01-01T00:00:00.000Z",
          lastTriggeredAt: "2026-01-01T00:00:00.000Z",
          templateCode: "REC-2",
          project: null,
        },
      ],
      activeProjects: [],
    });

    const item = snapshot.items[0];
    expect(item.kind).toBe("recommendation");
    expect(item.href).toBe("/clients/client-1/recommendations?selected=r2");
    expect(item.sourceLabel).toBe("Recommendation");
  });
});
