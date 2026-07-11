import { buildProtectedAppUrl, buildPublicAppUrl } from "@/lib/communications/links/build-protected-url";
import { getCommunicationWorkflowSettings } from "@/lib/communications/settings/workflow-settings";
import { BRAND } from "@/lib/branding";

export async function buildAssessmentCompleteEmailData(input: {
  assessmentId: string;
  assessmentName: string;
  organizationName: string;
  completedAt: string;
  overallScore?: number | null;
  strengths?: string[];
  priorities?: string[];
  executiveSummary?: string | null;
  firstName?: string;
}) {
  const settings = await getCommunicationWorkflowSettings();
  const resultsPath = `/assessments/${input.assessmentId}/results`;
  const reportPath = `/assessments/${input.assessmentId}/report`;

  return {
    heroTitle: "Your Technology Assessment is Complete",
    heroDescription: `${input.organizationName} has completed the ${input.assessmentName}.`,
    previewText: "Your technology maturity report is now available.",
    paragraphs: [
      input.firstName ? `Congratulations, ${input.firstName}.` : "Congratulations.",
      input.executiveSummary ??
        `${BRAND.productName} has analyzed your responses and generated a detailed view of your technology environment.`,
      "Sign in to review your results, recommendations, and executive-ready reporting.",
    ],
    summaryTitle: "Assessment Summary",
    summaryItems: [
      `Organization: ${input.organizationName}`,
      `Assessment: ${input.assessmentName}`,
      `Completed: ${input.completedAt}`,
      input.overallScore != null ? `Overall Technology Health Score: ${input.overallScore}` : "",
      ...(input.strengths?.length ? [`Top Strengths: ${input.strengths.join(" · ")}`] : []),
      ...(input.priorities?.length ? [`Priority Improvements: ${input.priorities.join(" · ")}`] : []),
    ].filter(Boolean),
    primaryCta: {
      label: "View Assessment Results",
      href: buildProtectedAppUrl(resultsPath),
    },
    secondaryCta: {
      label: "Download Executive Report",
      href: buildProtectedAppUrl(reportPath),
    },
    firstName: input.firstName,
    settings,
  };
}

export async function buildRoadmapReadyEmailData(input: {
  clientId: string;
  tipId: string;
  roadmapName: string;
  organizationName: string;
  executiveSummary?: string | null;
  phaseCount: number;
  projectCount: number;
  estimatedTimeline?: string;
  nextAction?: string;
  firstName?: string;
}) {
  return {
    heroTitle: "Your Technology Roadmap is Ready",
    heroDescription: "Your prioritized technology improvement plan is available for review.",
    previewText: "Explore your prioritized technology improvement plan.",
    paragraphs: [
      `${input.organizationName}'s Technology Roadmap has been published.`,
      input.executiveSummary ?? "Review phased initiatives, expected outcomes, and recommended sequencing.",
    ],
    summaryTitle: "Roadmap Overview",
    summaryItems: [
      `Roadmap: ${input.roadmapName}`,
      `Phases: ${input.phaseCount}`,
      `Projects: ${input.projectCount}`,
      input.estimatedTimeline ? `Estimated Timeline: ${input.estimatedTimeline}` : "",
      input.nextAction ? `Next Recommended Action: ${input.nextAction}` : "",
    ].filter(Boolean),
    primaryCta: {
      label: "View Technology Roadmap",
      href: buildProtectedAppUrl(`/clients/${input.clientId}/roadmap`),
    },
    secondaryCta: {
      label: "Book Technology Review",
      href: buildProtectedAppUrl(`/clients/${input.clientId}/quarterly-review`),
    },
    firstName: input.firstName,
  };
}

export async function buildProposalReadyEmailData(input: {
  clientId: string;
  tipId: string;
  proposalName: string;
  organizationName: string;
  purpose?: string;
  executiveSummary?: string | null;
  deliverables?: string[];
  estimatedTimeline?: string;
  oneTimeInvestment?: string;
  monthlyRecurring?: string;
  totalInvestment?: string;
  firstName?: string;
}) {
  return {
    heroTitle: "Your Proposal is Ready",
    heroDescription:
      "Bobkat IT has prepared a customized proposal based on your assessment and roadmap.",
    previewText: "Review your recommended technology improvements.",
    paragraphs: [
      input.purpose ??
        "Each recommendation is designed to improve reliability, security, and operational efficiency.",
      "Review the proposal, attached summary PDF, and next steps at your convenience.",
    ],
    summaryTitle: "Proposal Summary",
    summaryItems: [
      `Proposal: ${input.proposalName}`,
      `Organization: ${input.organizationName}`,
      input.executiveSummary ? `Executive Summary: ${input.executiveSummary}` : "",
      ...(input.deliverables?.length ? [`Deliverables: ${input.deliverables.join(" · ")}`] : []),
      input.estimatedTimeline ? `Estimated Timeline: ${input.estimatedTimeline}` : "",
      input.oneTimeInvestment ? `One-Time Investment: ${input.oneTimeInvestment}` : "",
      input.monthlyRecurring ? `Monthly Recurring Services: ${input.monthlyRecurring}` : "",
      input.totalInvestment ? `Total Investment: ${input.totalInvestment}` : "",
    ].filter(Boolean),
    primaryCta: {
      label: "Review Proposal",
      href: buildProtectedAppUrl(`/clients/${input.clientId}/proposals/${input.tipId}`),
    },
    secondaryCta: {
      label: "Approve Proposal",
      href: buildProtectedAppUrl(`/clients/${input.clientId}/proposals/${input.tipId}?action=approve`),
    },
    firstName: input.firstName,
  };
}

export function buildPasswordResetEmailData(input: {
  resetUrl: string;
  firstName?: string;
}) {
  return {
    heroTitle: "Reset Your Password",
    previewText: "A request was received to reset your StackScore password.",
    paragraphs: [
      "We received a request to reset the password for your StackScore account.",
      "If you requested this change, use the button below to create a new password.",
      "If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.",
    ],
    primaryCta: {
      label: "Reset My Password",
      href: input.resetUrl,
    },
    securityNotice:
      "Your password reset link expires in 60 minutes and can only be used once. Never share this link with anyone.",
    firstName: input.firstName,
  };
}

export async function buildProjectCreatedEmailData(input: {
  clientId: string;
  organizationName: string;
  projects: Array<{
    name: string;
    purpose?: string | null;
    businessOutcome?: string | null;
    estimatedCost?: string | null;
  }>;
  firstName?: string;
}) {
  return {
    heroTitle: "Your Next Projects Are Ready",
    heroDescription: "Bobkat IT has shared new implementation projects for your review.",
    previewText: "Your next technology improvement projects are ready.",
    paragraphs: [
      `${input.projects.length} project${input.projects.length === 1 ? "" : "s"} ${input.projects.length === 1 ? "has" : "have"} been prepared based on your Technology Roadmap.`,
      "Review objectives, expected outcomes, and estimated investment in your project portfolio.",
    ],
    summaryTitle: "Projects Shared",
    summaryItems: input.projects.flatMap((project) => [
      project.name,
      project.purpose ? `Purpose: ${project.purpose}` : "",
      project.businessOutcome ? `Desired Outcome: ${project.businessOutcome}` : "",
      project.estimatedCost ? `Estimated Cost: ${project.estimatedCost}` : "",
    ].filter(Boolean)),
    primaryCta: {
      label: "View Project Portfolio",
      href: buildProtectedAppUrl(`/clients/${input.clientId}/projects`),
    },
    firstName: input.firstName,
  };
}

export async function buildProjectCompletedEmailData(input: {
  clientId: string;
  projectId: string;
  projectName: string;
  organizationName: string;
  startDate?: string | null;
  completionDate?: string | null;
  description?: string | null;
  businessOutcome?: string | null;
  relatedRecommendation?: string | null;
  relatedRoadmapPhase?: string | null;
  firstName?: string;
}) {
  return {
    heroTitle: "Project Successfully Completed",
    heroDescription: "Thank you for trusting Bobkat IT to strengthen your technology environment.",
    previewText: "Review the completed work and your updated technology environment.",
    paragraphs: [
      input.firstName ? `Congratulations, ${input.firstName}.` : "Congratulations.",
      `${input.projectName} has been completed for ${input.organizationName}.`,
      "We appreciate the opportunity to help your organization move forward with practical technology improvements.",
    ],
    summaryTitle: "Project Summary",
    summaryItems: [
      `Project: ${input.projectName}`,
      input.startDate ? `Start Date: ${input.startDate}` : "",
      input.completionDate ? `Completion Date: ${input.completionDate}` : "",
      input.description ? `Description: ${input.description}` : "",
      input.businessOutcome ? `Business Outcome: ${input.businessOutcome}` : "",
      input.relatedRecommendation ? `Related Recommendation: ${input.relatedRecommendation}` : "",
      input.relatedRoadmapPhase ? `Related Roadmap Phase: ${input.relatedRoadmapPhase}` : "",
    ].filter(Boolean),
    primaryCta: {
      label: "View Completed Project",
      href: buildProtectedAppUrl(`/clients/${input.clientId}/projects/${input.projectId}`),
    },
    secondaryCta: {
      label: "View Updated Technology Roadmap",
      href: buildProtectedAppUrl(`/clients/${input.clientId}/roadmap`),
    },
    firstName: input.firstName,
  };
}

export async function buildQuarterlyReviewEmailData(input: {
  clientId: string;
  organizationName: string;
  firstName?: string;
}) {
  return {
    heroTitle: "Technology Never Stands Still",
    heroDescription: "It's time for your Quarterly Technology Review.",
    previewText: "Let's review what's changed in your technology environment.",
    paragraphs: [
      `${input.organizationName}'s technology environment continues to evolve.`,
      "A Quarterly Technology Review helps ensure your technology strategy still supports your business goals.",
    ],
    summaryTitle: "During Your Review We'll",
    summaryItems: [
      "Review completed improvements",
      "Discuss new business goals",
      "Evaluate new risks",
      "Update your technology roadmap",
      "Prioritize future projects",
    ],
    primaryCta: {
      label: "Schedule My Review",
      href: buildProtectedAppUrl(`/clients/${input.clientId}/quarterly-review`),
    },
    firstName: input.firstName,
  };
}

export async function buildAssessmentInvitationEmailData(input: {
  invitationUrl: string;
  firstName?: string;
  organizationName?: string;
}) {
  const settings = await getCommunicationWorkflowSettings();
  const primaryPath =
    settings.ctaDestinations["EMAIL-009"]?.primary ?? "/assessment-invitation";
  const invitationUrl =
    input.invitationUrl || buildPublicAppUrl(primaryPath);

  return {
    invitationUrl,
    firstName: input.firstName,
    organizationName: input.organizationName,
  };
}
