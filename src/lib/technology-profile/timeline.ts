import type { DocumentType, ProfileSnapshotTrigger } from "@/generated/prisma/client";
import type { ProfileBusinessSnapshot } from "@/lib/technology-profile/types";
import { isBusinessSnapshotSparse } from "@/lib/technology-profile/display";

export type JourneyTimelineFilter =
  | "all"
  | "assessments"
  | "projects"
  | "reports"
  | "reviews"
  | "profile";

export type JourneyTimelineEventType =
  | "business_profile"
  | "assessment"
  | "tip"
  | "project_approved"
  | "project_completed"
  | "completion_report"
  | "progress_report"
  | "quarterly_review"
  | "profile_milestone";

export type JourneyTimelineEvent = {
  id: string;
  occurredAt: string;
  dateLabel: string;
  eventType: JourneyTimelineEventType;
  filterCategory: Exclude<JourneyTimelineFilter, "all">;
  title: string;
  description: string;
  profileImpact: string | null;
  href: string | null;
  score: number | null;
};

export const JOURNEY_TIMELINE_FILTER_LABELS: Record<JourneyTimelineFilter, string> = {
  all: "All",
  assessments: "Assessments",
  projects: "Projects",
  reports: "Reports",
  reviews: "Reviews",
  profile: "Technology Maturity Profile",
};

export const JOURNEY_TIMELINE_EVENT_LABELS: Record<JourneyTimelineEventType, string> = {
  business_profile: "Business Profile",
  assessment: "Assessment",
  tip: "Improvement Plan",
  project_approved: "Project Approved",
  project_completed: "Project Completed",
  completion_report: "Completion Report",
  progress_report: "Progress Report",
  quarterly_review: "Business Review",
  profile_milestone: "Profile Milestone",
};

export function classifyReportDocument(
  title: string,
  documentType: DocumentType,
): JourneyTimelineEventType | null {
  if (documentType === "technology_improvement_plan") {
    return null;
  }
  if (documentType === "quarterly_business_review") {
    return "quarterly_review";
  }

  const normalized = title.toLowerCase();

  if (
    normalized.includes("completion") ||
    normalized.includes("technology completion")
  ) {
    return "completion_report";
  }
  if (normalized.includes("progress")) {
    return "progress_report";
  }
  if (
    normalized.includes("qbr") ||
    normalized.includes("quarterly") ||
    normalized.includes("business review")
  ) {
    return "quarterly_review";
  }
  if (documentType === "report") {
    return "progress_report";
  }

  return null;
}

export function filterJourneyTimelineEvents(
  events: JourneyTimelineEvent[],
  filter: JourneyTimelineFilter,
): JourneyTimelineEvent[] {
  if (filter === "all") {
    return events;
  }
  return events.filter((event) => event.filterCategory === filter);
}

export function sortJourneyTimelineEvents(
  events: JourneyTimelineEvent[],
): JourneyTimelineEvent[] {
  return [...events].sort(
    (left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}

type BuildTimelineInput = {
  clientId: string;
  businessSnapshot: ProfileBusinessSnapshot;
  profileCreatedAt: Date;
  profileCreatedScore: number | null;
  assessments: Array<{
    id: string;
    assessmentName: string;
    assessmentType: string;
    completedAt: Date;
    overallScore: unknown;
  }>;
  projects: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    startDate: Date | null;
    completedAt: Date | null;
    actualImpactPoints: number | null;
    estimatedImpactPoints: number | null;
  }>;
  tips: Array<{
    id: string;
    title: string;
    status: string;
    generatedAt: Date | null;
    createdAt: Date;
  }>;
  documents: Array<{
    id: string;
    title: string;
    documentType: DocumentType;
    createdAt: Date;
    assessmentId: string | null;
    tipId: string | null;
  }>;
  snapshots: Array<{
    id: string;
    triggerType: ProfileSnapshotTrigger;
    snapshotAt: Date;
    overallStackScore: unknown;
    maturityTier: string;
    triggerAssessmentId: string | null;
    metadata: unknown;
  }>;
};

function roundScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value));
}

function formatAssessmentType(type: string): string {
  const labels: Record<string, string> = {
    initial: "Initial",
    quarterly: "Business Review",
    annual: "Annual Review",
    followup: "Follow-up",
  };
  return labels[type] ?? type.replace(/_/g, " ");
}

function snapshotTitle(triggerType: ProfileSnapshotTrigger): string {
  switch (triggerType) {
    case "assessment_completed":
      return "Assessment snapshot recorded";
    case "project_completed":
      return "Project milestone captured";
    case "scheduled_review":
      return "Scheduled technology review";
    case "manual":
      return "Technology Maturity Profile snapshot";
    default:
      return "Technology Maturity Profile snapshot";
  }
}

function snapshotFilterCategory(
  triggerType: ProfileSnapshotTrigger,
): Exclude<JourneyTimelineFilter, "all"> {
  return triggerType === "scheduled_review" ? "reviews" : "profile";
}

export function buildJourneyTimelineEvents(input: BuildTimelineInput): JourneyTimelineEvent[] {
  const events: JourneyTimelineEvent[] = [];
  const assessmentsByDate = [...input.assessments].sort(
    (left, right) => left.completedAt.getTime() - right.completedAt.getTime(),
  );

  if (!isBusinessSnapshotSparse(input.businessSnapshot)) {
    events.push({
      id: `business-profile-${input.clientId}`,
      occurredAt: input.profileCreatedAt.toISOString(),
      dateLabel: input.profileCreatedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      eventType: "business_profile",
      filterCategory: "profile",
      title: "Business profile established",
      description: "Core business context documented for technology planning.",
      profileImpact: input.businessSnapshot.primaryBusinessGoalLabel
        ? `Primary goal: ${input.businessSnapshot.primaryBusinessGoalLabel}`
        : "Business context available for recommendations and reporting.",
      href: `/clients/${input.clientId}/business-profile`,
      score: null,
    });
  }

  events.push({
    id: `profile-created-${input.clientId}`,
    occurredAt: input.profileCreatedAt.toISOString(),
    dateLabel: input.profileCreatedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    eventType: "profile_milestone",
    filterCategory: "profile",
    title: "Technology Maturity Profile created",
    description: "Client Technology Maturity Profile initialized in StackScore.",
    profileImpact:
      input.profileCreatedScore !== null
        ? `Baseline StackScore ${input.profileCreatedScore}`
        : "Profile tracking started.",
    href: `/clients/${input.clientId}/technology-profile`,
    score: input.profileCreatedScore,
  });

  for (let index = 0; index < assessmentsByDate.length; index += 1) {
    const assessment = assessmentsByDate[index]!;
    const score = roundScore(assessment.overallScore);
    const previous = index > 0 ? roundScore(assessmentsByDate[index - 1]!.overallScore) : null;
    const delta = score !== null && previous !== null ? score - previous : null;

    events.push({
      id: `assessment-${assessment.id}`,
      occurredAt: assessment.completedAt.toISOString(),
      dateLabel: assessment.completedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      eventType: "assessment",
      filterCategory: "assessments",
      title: assessment.assessmentName,
      description: `${formatAssessmentType(assessment.assessmentType)} assessment completed.`,
      profileImpact:
        score !== null
          ? delta !== null && delta !== 0
            ? `StackScore ${score} (${delta > 0 ? "+" : ""}${delta} since previous assessment)`
            : `StackScore updated to ${score}`
          : "Assessment results recorded on the Technology Maturity Profile.",
      href: `/assessments/${assessment.id}/results`,
      score,
    });
  }

  for (const tip of input.tips) {
    const occurredAt = tip.generatedAt ?? tip.createdAt;
    events.push({
      id: `tip-${tip.id}`,
      occurredAt: occurredAt.toISOString(),
      dateLabel: occurredAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      eventType: "tip",
      filterCategory: "reports",
      title: tip.title,
      description:
        tip.status === "generated"
          ? "Technology Improvement Plan generated."
          : "Technology Improvement Plan activity recorded.",
      profileImpact: "Improvement roadmap and projected score captured.",
      href: `/clients/${input.clientId}/improvement-plan/${tip.id}`,
      score: null,
    });
  }

  for (const project of input.projects) {
    if (project.status !== "proposed" && project.status !== "cancelled") {
      const approvedAt = project.startDate ?? project.createdAt;
      events.push({
        id: `project-approved-${project.id}`,
        occurredAt: approvedAt.toISOString(),
        dateLabel: approvedAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        eventType: "project_approved",
        filterCategory: "projects",
        title: project.title,
        description: "Project approved for delivery.",
        profileImpact:
          project.estimatedImpactPoints !== null
            ? `Estimated Technology Maturity Profile impact: +${project.estimatedImpactPoints} pts`
            : "Approved improvement initiative added to the delivery plan.",
        href: `/projects?selected=${project.id}`,
        score: null,
      });
    }

    if (project.status === "completed" && project.completedAt) {
      events.push({
        id: `project-completed-${project.id}`,
        occurredAt: project.completedAt.toISOString(),
        dateLabel: project.completedAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        eventType: "project_completed",
        filterCategory: "projects",
        title: project.title,
        description: "Project completed and outcomes recorded.",
        profileImpact:
          project.actualImpactPoints !== null
            ? `Realized impact: +${project.actualImpactPoints} pts`
            : project.estimatedImpactPoints !== null
              ? `Estimated impact delivered: +${project.estimatedImpactPoints} pts`
              : "Completed work contributes to Technology Maturity Profile maturity.",
        href: `/projects?selected=${project.id}`,
        score: null,
      });
    }
  }

  for (const document of input.documents) {
    if (document.documentType === "technology_improvement_plan" && document.tipId) {
      continue;
    }

    const reportType = classifyReportDocument(document.title, document.documentType);
    if (!reportType) continue;

    const filterCategory: Exclude<JourneyTimelineFilter, "all"> =
      reportType === "quarterly_review" ? "reviews" : "reports";

    events.push({
      id: `document-${document.id}`,
      occurredAt: document.createdAt.toISOString(),
      dateLabel: document.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      eventType: reportType,
      filterCategory,
      title: document.title,
      description: JOURNEY_TIMELINE_EVENT_LABELS[reportType],
      profileImpact: "Report archived on the Technology Maturity Profile.",
      href: document.assessmentId
        ? `/api/v1/assessments/${document.assessmentId}/export/pdf`
        : document.tipId
          ? `/api/v1/clients/${input.clientId}/tip/${document.tipId}/pdf`
          : null,
      score: null,
    });
  }

  for (const snapshot of input.snapshots) {
    if (snapshot.triggerType === "assessment_completed") {
      continue;
    }

    const score = roundScore(snapshot.overallStackScore);
    events.push({
      id: `snapshot-${snapshot.id}`,
      occurredAt: snapshot.snapshotAt.toISOString(),
      dateLabel: snapshot.snapshotAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      eventType: "profile_milestone",
      filterCategory: snapshotFilterCategory(snapshot.triggerType),
      title: snapshotTitle(snapshot.triggerType),
      description: "Technology Maturity Profile milestone captured for historical reference.",
      profileImpact:
        score !== null
          ? `StackScore snapshot: ${score} (${snapshot.maturityTier})`
          : "Profile state preserved.",
      href: snapshot.triggerAssessmentId
        ? `/assessments/${snapshot.triggerAssessmentId}/results`
        : `/clients/${input.clientId}/technology-profile`,
      score,
    });
  }

  return sortJourneyTimelineEvents(events);
}
