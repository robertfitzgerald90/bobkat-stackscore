import { describe, expect, it } from "vitest";
import {
  buildClientWorkspaceSnapshot,
  conciseFocusTitle,
  formatFocusMetadataLine,
} from "@/lib/client-workspace";
import type { ImmediateFocusItem } from "@/lib/client-workspace";

describe("conciseFocusTitle", () => {
  it("prefers the assessment question over the pillar-style prefix", () => {
    expect(
      conciseFocusTitle(
        "Improve Security Operations: Are vulnerabilities assessed regularly?",
      ),
    ).toBe("Are vulnerabilities assessed regularly?");
  });

  it("prefers the specific finding when the catalog omits a question mark", () => {
    expect(
      conciseFocusTitle(
        "Improve Identity & Access: Is Multi-Factor Authentication required for privileged accounts and business-critical systems",
      ),
    ).toBe(
      "Is Multi-Factor Authentication required for privileged accounts and business-critical systems",
    );
  });

  it("keeps titles without pillar prefixes", () => {
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
      title: "Are vulnerabilities assessed regularly?",
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

describe("buildClientWorkspaceSnapshot titles", () => {
  it("shows distinct recommendation findings, not only the pillar", () => {
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
        {
          id: "r2",
          title:
            "Improve Security Operations: Are security events monitored and reviewed",
          description: "Details",
          priority: "high",
          status: "open",
          estimatedImpactPoints: 8,
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
          templateCode: "REC-2",
          project: null,
        },
      ],
      activeProjects: [],
    });

    const titles = snapshot.items.map((item) => item.title);
    expect(titles).toContain("Are vulnerabilities assessed regularly?");
    expect(titles).toContain("Are security events monitored and reviewed");
    expect(titles.every((title) => title !== "Improve Security Operations")).toBe(true);

    const withProject = snapshot.items.find((item) => item.id === "r1");
    expect(withProject?.href).toBe("/projects?client=client-1&selected=p1");
    expect(withProject?.pillarName).toBe("Security Operations");
    expect(withProject?.sourceLabel).toBe("From recommendation");
  });

  it("prefers linked recommendation title for project focus items", () => {
    const snapshot = buildClientWorkspaceSnapshot({
      clientId: "client-1",
      stackScore: 70,
      projectedScore: 80,
      openRecommendations: [
        {
          id: "r1",
          title: "Improve Endpoint Management: Are portable devices encrypted",
          description: "Details",
          priority: "critical",
          status: "accepted",
          estimatedImpactPoints: 12,
          businessImpact: "Impact",
          suggestedService: null,
          categoryName: "Endpoint Management",
          categoryCode: "endpoint_management",
          categoryId: "cat-3",
          assessmentId: "a1",
          latestAssessmentId: "a1",
          latestAssessmentName: "Baseline",
          latestTriggerReason: null,
          triggeredInLatestAssessment: true,
          isRecurrence: false,
          recurrenceCount: 0,
          createdAt: "2026-01-01T00:00:00.000Z",
          lastTriggeredAt: "2026-01-01T00:00:00.000Z",
          templateCode: "REC-3",
          project: { id: "p1", title: "Improve Endpoint Management", status: "in_progress" },
        },
      ],
      activeProjects: [
        {
          id: "p1",
          title: "Improve Endpoint Management",
          status: "in_progress",
          priority: "critical",
          estimatedImpactPoints: 12,
          actualImpactPoints: null,
          estimatedCost: null,
          completedAt: null,
          recommendationTitle: "Improve Endpoint Management: Are portable devices encrypted",
        },
      ],
    });

    const projectItem = snapshot.items.find((item) => item.kind === "project");
    expect(projectItem?.title).toBe("Are portable devices encrypted");
    expect(projectItem?.pillarName).toBe("Endpoint Management");
    expect(projectItem?.href).toBe("/projects?client=client-1&selected=p1");
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
    expect(item.title).toBe("Enable MFA");
    expect(item.href).toBe("/clients/client-1/recommendations?selected=r2");
    expect(item.sourceLabel).toBe("Recommendation");
  });
});
