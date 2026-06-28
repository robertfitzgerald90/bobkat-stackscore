import { describe, expect, it } from "vitest";
import { resolveProfileCapabilities } from "@/lib/technology-profile/overview";
import {
  resolveProfileSectionVisibility,
  trimBusinessSnapshotForClient,
} from "@/lib/technology-profile/visibility";

describe("technology profile visibility", () => {
  it("grants full internal sections to admin", () => {
    const capabilities = resolveProfileCapabilities("admin");
    const sections = resolveProfileSectionVisibility("admin", capabilities);

    expect(sections.showAssessmentForms).toBe(true);
    expect(sections.showAdminActions).toBe(true);
    expect(sections.showInternalQuickActions).toBe(true);
    expect(sections.showOpenOpportunities).toBe(true);
    expect(sections.showRoadmapPreview).toBe(true);
    expect(sections.showNextActionCta).toBe(true);
    expect(sections.showBusinessSnapshotLimited).toBe(false);
  });

  it("hides internal workflow sections from client role", () => {
    const capabilities = resolveProfileCapabilities("client");
    const sections = resolveProfileSectionVisibility("client", capabilities);

    expect(sections.showAssessmentForms).toBe(false);
    expect(sections.showAdminActions).toBe(false);
    expect(sections.showInternalQuickActions).toBe(false);
    expect(sections.showOpenOpportunities).toBe(false);
    expect(sections.showRoadmapPreview).toBe(false);
    expect(sections.showActiveProjects).toBe(false);
    expect(sections.showAssessmentResultsLink).toBe(false);
    expect(sections.showNextActionCta).toBe(false);
    expect(sections.showBusinessSnapshotLimited).toBe(true);
    expect(sections.showRecommendationCounts).toBe(false);
  });

  it("allows technician to view internal sections without pricing", () => {
    const capabilities = resolveProfileCapabilities("technician");
    const sections = resolveProfileSectionVisibility("technician", capabilities);

    expect(capabilities.canViewPricing).toBe(false);
    expect(sections.showOpenOpportunities).toBe(true);
    expect(sections.showInternalQuickActions).toBe(true);
    expect(sections.showAdminActions).toBe(false);
  });

  it("trims business snapshot fields for client audience", () => {
    const trimmed = trimBusinessSnapshotForClient({
      industry: "Legal",
      employeeCount: 12,
      numberOfLocations: 1,
      primaryBusinessGoal: "improve_compliance",
      primaryBusinessGoalLabel: "Improve Compliance",
      technologyVision: "Secure cloud-first operations",
      itSupportModel: "msp",
      itSupportModelLabel: "MSP",
      environmentType: "hybrid",
      environmentTypeLabel: "Hybrid",
      complianceFramework: "hipaa",
      complianceFrameworkLabel: "HIPAA",
      complianceStatus: "HIPAA program active",
      primaryContactName: "Jordan Lee",
      primaryContactTitle: "COO",
      primaryContactEmail: "jordan@example.com",
      primaryContactPhone: "555-0100",
    });

    expect(trimmed.technologyVision).toBeNull();
    expect(trimmed.complianceStatus).toBeNull();
    expect(trimmed.primaryContactEmail).toBe("");
    expect(trimmed.industry).toBe("Legal");
    expect(trimmed.primaryBusinessGoalLabel).toBe("Improve Compliance");
  });
});
