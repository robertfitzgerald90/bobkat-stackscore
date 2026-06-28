import { describe, expect, it } from "vitest";
import {
  buildJourneyTimelineEvents,
  classifyReportDocument,
  filterJourneyTimelineEvents,
} from "@/lib/technology-profile/timeline";

const baseInput = {
  clientId: "client-1",
  businessSnapshot: {
    industry: "Manufacturing",
    employeeCount: 45,
    numberOfLocations: 2,
    primaryBusinessGoal: "improve_cybersecurity" as const,
    primaryBusinessGoalLabel: "Improve Cybersecurity",
    technologyVision: null,
    itSupportModel: null,
    itSupportModelLabel: "—",
    environmentType: null,
    environmentTypeLabel: "—",
    complianceFramework: null,
    complianceFrameworkLabel: "—",
    complianceStatus: null,
    primaryContactName: "Alex",
    primaryContactTitle: null,
    primaryContactEmail: "alex@example.com",
    primaryContactPhone: null,
  },
  profileCreatedAt: new Date("2026-01-10T12:00:00.000Z"),
  profileCreatedScore: 58,
  assessments: [
    {
      id: "a1",
      assessmentName: "Initial Assessment",
      assessmentType: "initial",
      completedAt: new Date("2026-02-01T12:00:00.000Z"),
      overallScore: 58,
    },
    {
      id: "a2",
      assessmentName: "Follow-up Assessment",
      assessmentType: "followup",
      completedAt: new Date("2026-03-01T12:00:00.000Z"),
      overallScore: 69,
    },
  ],
  projects: [
    {
      id: "p1",
      title: "MFA Rollout",
      status: "completed",
      createdAt: new Date("2026-02-05T12:00:00.000Z"),
      startDate: new Date("2026-02-10T12:00:00.000Z"),
      completedAt: new Date("2026-02-20T12:00:00.000Z"),
      actualImpactPoints: 8,
      estimatedImpactPoints: 8,
    },
  ],
  tips: [
    {
      id: "tip-1",
      title: "2026 Improvement Plan",
      status: "generated",
      generatedAt: new Date("2026-02-15T12:00:00.000Z"),
      createdAt: new Date("2026-02-12T12:00:00.000Z"),
    },
  ],
  documents: [
    {
      id: "doc-1",
      title: "Q1 Quarterly Business Review",
      documentType: "report" as const,
      createdAt: new Date("2026-03-05T12:00:00.000Z"),
      assessmentId: null,
      tipId: null,
    },
  ],
  snapshots: [],
};

describe("technology journey timeline", () => {
  it("classifies report documents by title", () => {
    expect(classifyReportDocument("Technology Completion Report", "report")).toBe(
      "completion_report",
    );
    expect(classifyReportDocument("Technology Progress Report", "report")).toBe(
      "progress_report",
    );
    expect(classifyReportDocument("Q1 Quarterly Business Review", "report")).toBe(
      "quarterly_review",
    );
    expect(classifyReportDocument("Improvement Plan", "technology_improvement_plan")).toBe(
      null,
    );
    expect(
      classifyReportDocument("Q2 Quarterly Business Review", "quarterly_business_review"),
    ).toBe("quarterly_review");
  });

  it("builds chronological events with profile impact and links", () => {
    const events = buildJourneyTimelineEvents(baseInput);

    expect(events.some((event) => event.eventType === "business_profile")).toBe(true);
    expect(events.some((event) => event.eventType === "assessment")).toBe(true);
    expect(events.some((event) => event.eventType === "project_completed")).toBe(true);
    expect(events.some((event) => event.eventType === "tip")).toBe(true);
    expect(events.some((event) => event.eventType === "quarterly_review")).toBe(true);

    const followUp = events.find((event) => event.id === "assessment-a2");
    expect(followUp?.profileImpact).toContain("+11");
    expect(followUp?.href).toBe("/assessments/a2/results");
  });

  it("filters events by category", () => {
    const events = buildJourneyTimelineEvents(baseInput);

    expect(filterJourneyTimelineEvents(events, "assessments")).toHaveLength(2);
    expect(
      filterJourneyTimelineEvents(events, "projects").every((event) =>
        ["project_approved", "project_completed"].includes(event.eventType),
      ),
    ).toBe(true);
    expect(filterJourneyTimelineEvents(events, "reviews")).toHaveLength(1);
  });

  it("sorts newest events first", () => {
    const events = buildJourneyTimelineEvents(baseInput);
    expect(new Date(events[0]!.occurredAt).getTime()).toBeGreaterThanOrEqual(
      new Date(events[1]!.occurredAt).getTime(),
    );
  });
});
