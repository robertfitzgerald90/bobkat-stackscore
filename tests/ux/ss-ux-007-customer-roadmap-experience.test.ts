import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCustomerRoadmapExperience,
  buildCustomerRoadmapProjectSummary,
} from "@/lib/customer-portal/roadmap-dto";
import type { ClientRoadmapDashboard } from "@/lib/client-roadmap/types";
import { customerRoadmapProgressFootnote } from "@/lib/assessments/customer-reporting";
import { CLIENT_EQUAL_CARD_GRID } from "@/lib/client-ui/tokens";

function baseDashboard(
  overrides: Partial<ClientRoadmapDashboard> = {},
): ClientRoadmapDashboard {
  return {
    id: "rm-1",
    clientId: "client-1",
    assessmentId: "a-1",
    tipId: null,
    status: "active",
    title: "ABC Technology Roadmap",
    assessmentName: "Baseline",
    clientName: "ABC LLC",
    scoreJourney: {
      baselineScore: 39,
      completedImprovement: 0,
      effectiveScore: 39,
      remainingOpportunity: 20,
      projectedFinalScore: 59,
    },
    metrics: {
      completionPercent: 0,
      initiativesCompleted: 0,
      initiativesRemaining: 13,
      initiativesTotal: 13,
      riskReductionPercent: 0,
      currentPhaseName: "Stabilize Foundations",
      currentPhaseStatus: "planned",
      currentPhaseProposalStatusLabel: null,
      currentPhaseImplementationStatusLabel: null,
      remainingOneTimeInvestment: 0,
      remainingMonthlyRecurring: 0,
      currentMonthlyServices: 0,
      projectedMonthlyServicesAfterCompletion: 0,
      domainImprovements: {
        securityImprovement: 0,
        infrastructureImprovement: 0,
        businessContinuityImprovement: 0,
        operationalMaturityImprovement: 0,
      },
    },
    phases: [
      {
        id: "phase-1",
        phaseKey: "critical",
        subtitle: "Phase 1",
        name: "Stabilize Foundations",
        timeline: "Near term",
        sortOrder: 1,
        executiveSummary: "Address critical identity and access gaps.",
        status: "planned",
        statusLabel: "Planned",
        oneTimeInvestment: 0,
        monthlyRecurringInvestment: 0,
        annualRecurringInvestment: 0,
        expectedScoreImprovement: 10,
        projectedScoreAfterPhase: 49,
        approvedAt: null,
        approvedByName: null,
        completionDate: null,
        actualCompletionDate: null,
        proposalGeneratedAt: null,
        proposalAcceptedAt: null,
        projectStartedAt: null,
        projectCompletedAt: null,
        latestProposal: null,
        journeyMilestones: [],
        initiatives: [
          {
            id: "init-1",
            recommendationId: "rec-1",
            title: "Centralize workforce identity",
            description: "Finding: …",
            businessImpact: "Access changes stay consistent.",
            categoryName: "Identity & Access",
            categoryCode: "identity_access",
            priority: "critical",
            estimatedImpactPoints: 10,
            status: "open",
            statusLabel: "Planned",
            sortOrder: 0,
            businessOutcomeTitle: null,
            businessOutcomeDescription: "Document ownership before cutover.",
            completedAt: null,
          },
        ],
        businessOutcomes: [],
        canClientApprove: false,
      },
    ],
    viewerRole: "client",
    isConsultant: false,
    ...overrides,
  };
}

describe("SS-UX-007 customer roadmap experience", () => {
  it("builds executive summary from approved dashboard metrics", () => {
    const dto = buildCustomerRoadmapExperience({
      dashboard: baseDashboard(),
      projects: [],
      bookingHref: "/assessment-offer",
    });

    expect(dto.summary.officialStackScore).toBe(39);
    expect(dto.summary.progressPercent).toBe(0);
    expect(dto.summary.initiativesTotal).toBe(13);
    expect(dto.summary.initiativesCompleted).toBe(0);
    expect(dto.summary.initiativesRemaining).toBe(13);
    expect(dto.summary.currentPhaseName).toBe("Stabilize Foundations");
    expect(dto.summary.footnote).toBe(customerRoadmapProgressFootnote());
    expect(dto.isDraft).toBe(false);
  });

  it("presents phases and initiatives without inventing projections", () => {
    const dto = buildCustomerRoadmapExperience({
      dashboard: baseDashboard(),
      projects: [
        buildCustomerRoadmapProjectSummary("client-1", {
          id: "p1",
          title: "Identity rollout",
          statusLabel: "In Progress",
          priorityLabel: "Critical",
          recommendationTitle: "Centralize workforce identity",
        }),
      ],
      bookingHref: null,
    });

    expect(dto.phases).toHaveLength(1);
    expect(dto.phases[0]?.isCurrent).toBe(true);
    expect(dto.phases[0]?.href).toContain("/roadmap/phases/phase-1");
    expect(dto.initiatives[0]?.recommendationHref).toContain("selected=rec-1");
    expect(dto.initiatives[0]?.pillarHref).toContain("pillar=identity_access");
    expect(dto.initiatives[0]?.implementationNotes).toContain("Document ownership");
    expect(dto.projects).toHaveLength(1);
    expect(dto.nextActions.some((a) => a.id === "review-phase")).toBe(true);
    expect(dto.nextActions.some((a) => a.id === "support")).toBe(true);
    expect(JSON.stringify(dto)).not.toContain("projectedFinalScore");
  });

  it("marks draft roadmaps without fabricating completion", () => {
    const dto = buildCustomerRoadmapExperience({
      dashboard: baseDashboard({
        status: "draft",
        metrics: {
          ...baseDashboard().metrics,
          completionPercent: 0,
          initiativesCompleted: 0,
        },
      }),
      projects: [],
      bookingHref: null,
    });
    expect(dto.isDraft).toBe(true);
    expect(dto.summary.progressPercent).toBe(0);
  });

  it("wires customer roadmap page to the experience assembly", () => {
    const root = process.cwd();
    const page = readFileSync(
      join(root, "src/app/(dashboard)/clients/[id]/roadmap/page.tsx"),
      "utf8",
    );
    const experience = readFileSync(
      join(root, "src/components/customer-portal/roadmap/customer-roadmap-experience.tsx"),
      "utf8",
    );
    const phaseWorkspace = readFileSync(
      join(root, "src/components/client-roadmap/phase-workspace.tsx"),
      "utf8",
    );
    const summary = readFileSync(
      join(root, "src/components/customer-portal/roadmap/roadmap-executive-summary.tsx"),
      "utf8",
    );

    expect(page).toContain("getCustomerRoadmapExperience");
    expect(page).toContain("CustomerRoadmapExperience");
    expect(page).toContain("RoadmapDashboard");
    expect(experience).toContain("RoadmapExecutiveSummary");
    expect(experience).toContain("RoadmapPhaseGrid");
    expect(experience).toContain("RoadmapInitiatives");
    expect(experience).toContain("RoadmapProjectsPanel");
    expect(experience).toContain("RoadmapNextActions");
    expect(summary).not.toContain("projected");
    expect(phaseWorkspace).toContain("View linked opportunity");
    expect(phaseWorkspace).toContain("clientRecommendationDetailPath");
    expect(CLIENT_EQUAL_CARD_GRID).toContain("auto-rows-fr");
  });

  it("does not couple to roadmap materialize/promote engines", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/customer-portal/roadmap-experience.ts"),
      "utf8",
    );
    expect(source).toContain("getClientRoadmapDashboard");
    expect(source).not.toContain("materializeDraftRoadmap");
    expect(source).not.toContain("promoteRoadmapFromTip");
  });
});
