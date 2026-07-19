import { describe, expect, it } from "vitest";
import { buildPhaseProposalSnapshot } from "@/lib/phase-proposals/snapshot";
import { isValidPhaseProposalStatus } from "@/lib/phase-proposals/types";

describe("phase proposal snapshot", () => {
  it("captures only the selected phase investment and initiatives", () => {
    const snapshot = buildPhaseProposalSnapshot({
      clientName: "Acme Manufacturing",
      assessmentName: "Q2 Technology Assessment",
      assessmentDate: "2025-06-01T00:00:00.000Z",
      preparedByName: "Alex Consultant",
      phase: {
        id: "phase-1",
        phaseKey: "critical_stabilization",
        name: "Critical Stabilization",
        subtitle: "Phase 1",
        timeline: "30–45 days",
        executiveSummary: "Stabilize identity and endpoint controls.",
        expectedScoreImprovement: 12,
        oneTimeInvestment: 8500,
        monthlyRecurringInvestment: 450,
        annualRecurringInvestment: 0,
        initiatives: [
          {
            recommendationId: "rec-1",
            title: "Deploy centralized endpoint management",
            estimatedImpactPoints: 7,
            businessOutcomeTitle: "Centralized endpoint management",
            businessOutcomeDescription: "Consistent device policy and visibility",
            recommendation: {
              description: "Roll out managed endpoint controls across workstations.",
              businessImpact: "Lower technology risk and faster support response.",
              priority: "critical",
              category: { name: "Security" },
            },
          },
          {
            recommendationId: "rec-2",
            title: "Harden backup recovery validation",
            estimatedImpactPoints: 5,
            businessOutcomeTitle: "Reliable backup and recovery",
            businessOutcomeDescription: "Verified restore capability",
            recommendation: {
              description: "Establish tested backup recovery procedures.",
              businessImpact: "Improved business continuity readiness.",
              priority: "high",
              category: { name: "Business Continuity" },
            },
          },
        ],
      },
    });

    expect(snapshot.initiatives).toHaveLength(2);
    expect(snapshot.oneTimeInvestment).toBe(8500);
    expect(snapshot.monthlyRecurringInvestment).toBe(450);
    expect(snapshot.annualRecurringInvestment).toBe(0);
    expect(snapshot.scopeOfWork.includedInitiatives).toEqual([
      "Deploy centralized endpoint management",
      "Harden backup recovery validation",
    ]);
    expect(snapshot.scopeOfWork.outOfScope).toContain(
      "Initiatives assigned to other roadmap phases",
    );
    expect(snapshot.executiveSummary).toContain("Phase 1 only");
    expect(snapshot.assumptions.length).toBeGreaterThan(0);
  });
});

describe("phase proposal status validation", () => {
  it("accepts supported lifecycle statuses", () => {
    expect(isValidPhaseProposalStatus("draft")).toBe(true);
    expect(isValidPhaseProposalStatus("sent")).toBe(true);
    expect(isValidPhaseProposalStatus("approved")).toBe(true);
    expect(isValidPhaseProposalStatus("superseded")).toBe(true);
    expect(isValidPhaseProposalStatus("unknown")).toBe(false);
  });
});
