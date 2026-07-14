import { renderEmailTemplate } from "@/emails/render-email";
import { AccountActivationEmail } from "@/emails/templates/account-activation";
import type { AccountActivationEmailData } from "@/emails/templates/account-activation";
import { AssessmentInvitationEmail } from "@/emails/templates/assessment-invitation";
import type { AssessmentInvitationEmailData } from "@/emails/templates/assessment-invitation";
import { DEFAULT_COMMUNICATION_BRAND } from "@/lib/communications/brand-types";
import { renderWorkflowNotificationEmail } from "@/lib/communications/workflows/render-workflow-email";
import type { WorkflowNotificationEmailData } from "@/emails/templates/workflow-notification";
import {
  buildAccountActivationSampleData,
  buildAssessmentInvitationSampleData,
  buildPasswordResetSampleData,
  buildVcioWelcomeSampleData,
  PREVIEW_PROTECTED_URL,
} from "@/lib/communications/sample-data";
import type {
  EmailTemplateCategory,
  EmailTemplateDefinition,
  EmailTemplateStatus,
  RenderContext,
  RenderedEmail,
} from "@/lib/communications/types";

const LAST_UPDATED = "2026-07-11";

async function renderAccountActivation(
  data: Record<string, unknown>,
  context?: RenderContext,
): Promise<RenderedEmail> {
  const brand = context?.brand ?? DEFAULT_COMMUNICATION_BRAND;
  const content = context?.content ?? null;
  const { html, text } = await renderEmailTemplate(
    AccountActivationEmail({
      ...(data as AccountActivationEmailData),
      brand,
      content,
    }),
  );
  return {
    subject: content?.subject ?? "Welcome to StackScore — Activate Your Technology Assessment",
    previewText:
      content?.previewText ??
      "Activate your account and begin discovering your organization's technology maturity.",
    html,
    text,
  };
}

type DraftTemplateMeta = {
  key: string;
  documentId: string;
  name: string;
  description: string;
  category: EmailTemplateCategory;
  status: EmailTemplateStatus;
  subject: string;
  previewText: string;
  lastUpdated: string;
  requiredVariables: readonly string[];
  optionalVariables: readonly string[];
};

type WorkflowTemplateMeta = DraftTemplateMeta & {
  sampleData: Record<string, unknown>;
  defaults: { subject: string; previewText: string };
};

function workflowTemplate(
  meta: WorkflowTemplateMeta,
): EmailTemplateDefinition {
  return {
    ...meta,
    status: "active",
    sampleData: meta.sampleData,
    render: async (data, context) =>
      renderWorkflowNotificationEmail(data as WorkflowNotificationEmailData, context, meta.defaults),
  };
}

const EMAIL_001_SAMPLE = buildAccountActivationSampleData();
const EMAIL_009_SAMPLE = buildAssessmentInvitationSampleData();

const EMAIL_001: EmailTemplateDefinition = {
  key: "EMAIL-001",
  documentId: "EMAIL-001",
  name: "Account Activation",
  description:
    "Welcome email sent after a Technology Maturity Assessment purchase with a secure activation link.",
  category: "onboarding",
  status: "active",
  subject: "Welcome to StackScore — Activate Your Technology Assessment",
  previewText:
    "Activate your account and begin discovering your organization's technology maturity.",
  lastUpdated: LAST_UPDATED,
  requiredVariables: ["activationUrl"],
  optionalVariables: [
    "firstName",
    "organizationName",
    "assessmentName",
    "expirationDays",
    "supportEmail",
    "websiteUrl",
  ],
  sampleData: EMAIL_001_SAMPLE,
  render: renderAccountActivation,
};

async function renderAssessmentInvitation(
  data: Record<string, unknown>,
  context?: RenderContext,
): Promise<RenderedEmail> {
  const brand = context?.brand ?? DEFAULT_COMMUNICATION_BRAND;
  const content = context?.content ?? null;
  const { html, text } = await renderEmailTemplate(
    AssessmentInvitationEmail({
      ...(data as AssessmentInvitationEmailData),
      brand,
      content,
    }),
  );
  return {
    subject:
      content?.subject ??
      "You're Invited to Complete a StackScore Technology Assessment",
    previewText:
      content?.previewText ??
      "Discover your organization's technology maturity and uncover opportunities for improvement.",
    html,
    text,
  };
}

const EMAIL_009: EmailTemplateDefinition = {
  key: "EMAIL-009",
  documentId: "EMAIL-009",
  name: "Assessment Invitation",
  description: "Invites a customer to complete a StackScore Technology Maturity Assessment.",
  category: "invitation",
  status: "active",
  subject: "You're Invited to Complete a StackScore Technology Assessment",
  previewText:
    "Discover your organization's technology maturity and uncover opportunities for improvement.",
  lastUpdated: LAST_UPDATED,
  requiredVariables: ["invitationUrl"],
  optionalVariables: [
    "firstName",
    "organizationName",
    "assessmentName",
    "supportEmail",
    "websiteUrl",
  ],
  sampleData: EMAIL_009_SAMPLE,
  render: renderAssessmentInvitation,
};

export const EMAIL_TEMPLATE_REGISTRY: EmailTemplateDefinition[] = [
  EMAIL_001,
  workflowTemplate({
    key: "EMAIL-002",
    documentId: "EMAIL-002",
    name: "Assessment Complete",
    description: "Notifies the customer that their assessment results are ready for review.",
    category: "assessment",
    status: "active",
    subject: "Your StackScore Assessment is Complete",
    previewText: "Your technology maturity report is now available.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["primaryCta"],
    optionalVariables: ["firstName", "organizationName", "heroTitle"],
    defaults: {
      subject: "Your StackScore Assessment is Complete",
      previewText: "Your technology maturity report is now available.",
    },
    sampleData: {
      heroTitle: "Your Technology Assessment is Complete",
      heroDescription: "Northwind Professional Services has completed the Technology Maturity Assessment.",
      previewText: "Your technology maturity report is now available.",
      paragraphs: [
        "Congratulations, Alex.",
        "StackScore has analyzed your responses and generated a detailed view of your technology environment.",
      ],
      summaryTitle: "Assessment Summary",
      summaryItems: ["Overall Technology Health Score: 72"],
      primaryCta: {
        label: "View Assessment Results",
        href: PREVIEW_PROTECTED_URL,
      },
      secondaryCta: {
        label: "Download Executive Report",
        href: PREVIEW_PROTECTED_URL,
      },
    },
  }),
  workflowTemplate({
    key: "EMAIL-003",
    documentId: "EMAIL-003",
    name: "Roadmap Ready",
    description: "Informs the customer that their Technology Roadmap has been generated.",
    category: "roadmap",
    status: "active",
    subject: "Your Technology Roadmap is Ready",
    previewText: "Explore your prioritized technology improvement plan.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["primaryCta"],
    optionalVariables: ["firstName", "organizationName"],
    defaults: {
      subject: "Your Technology Roadmap is Ready",
      previewText: "Explore your prioritized technology improvement plan.",
    },
    sampleData: {
      heroTitle: "Your Technology Roadmap is Ready",
      primaryCta: {
        label: "View Technology Roadmap",
        href: PREVIEW_PROTECTED_URL,
      },
      secondaryCta: {
        label: "Book Technology Review",
        href: PREVIEW_PROTECTED_URL,
      },
      summaryItems: ["Phases: 3", "Projects: 8"],
    },
  }),
  workflowTemplate({
    key: "EMAIL-004",
    documentId: "EMAIL-004",
    name: "Proposal Ready",
    description: "Notifies the customer that a technology proposal is available for review.",
    category: "proposal",
    status: "active",
    subject: "Your Technology Proposal is Ready",
    previewText: "Review your recommended technology improvements.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["primaryCta"],
    optionalVariables: ["firstName", "organizationName"],
    defaults: {
      subject: "Your Technology Proposal is Ready",
      previewText: "Review your recommended technology improvements.",
    },
    sampleData: {
      heroTitle: "Your Proposal is Ready",
      primaryCta: {
        label: "Review Proposal",
        href: PREVIEW_PROTECTED_URL,
      },
      secondaryCta: {
        label: "Approve Proposal",
        href: PREVIEW_PROTECTED_URL,
      },
      summaryItems: ["Total Investment: $24,500"],
    },
  }),
  workflowTemplate({
    key: "EMAIL-005",
    documentId: "EMAIL-005",
    name: "Password Reset",
    description: "Allows a customer to securely reset their StackScore password.",
    category: "security",
    status: "active",
    subject: "Reset Your StackScore Password",
    previewText: "A request was received to reset your StackScore password.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["primaryCta"],
    optionalVariables: ["firstName"],
    defaults: {
      subject: "Reset Your StackScore Password",
      previewText: "A request was received to reset your StackScore password.",
    },
    sampleData: buildPasswordResetSampleData(),
  }),
  workflowTemplate({
    key: "EMAIL-006",
    documentId: "EMAIL-006",
    name: "Quarterly Technology Review",
    description: "Invites customers to schedule a quarterly technology review.",
    category: "review",
    status: "active",
    subject: "It's Time for Your Quarterly Technology Review",
    previewText: "Let's review what's changed in your technology environment.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["primaryCta"],
    optionalVariables: ["firstName", "organizationName"],
    defaults: {
      subject: "It's Time for Your Quarterly Technology Review",
      previewText: "Let's review what's changed in your technology environment.",
    },
    sampleData: {
      heroTitle: "Technology Never Stands Still",
      primaryCta: {
        label: "Schedule My Review",
        href: PREVIEW_PROTECTED_URL,
      },
      summaryItems: ["Review completed improvements", "Update your technology roadmap"],
    },
  }),
  workflowTemplate({
    key: "EMAIL-007",
    documentId: "EMAIL-007",
    name: "Project Created",
    description: "Notifies a customer that new implementation projects have been shared.",
    category: "project",
    status: "active",
    subject: "New Projects Have Been Shared With You",
    previewText: "Your next technology improvement projects are ready.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["primaryCta"],
    optionalVariables: ["firstName", "organizationName"],
    defaults: {
      subject: "New Projects Have Been Shared With You",
      previewText: "Your next technology improvement projects are ready.",
    },
    sampleData: {
      heroTitle: "Your Next Projects Are Ready",
      primaryCta: {
        label: "View Project Portfolio",
        href: PREVIEW_PROTECTED_URL,
      },
      summaryItems: ["Endpoint Security Upgrade", "Estimated Cost: $8,500"],
    },
  }),
  workflowTemplate({
    key: "EMAIL-008",
    documentId: "EMAIL-008",
    name: "Project Completed",
    description: "Notifies the customer that an implementation project has been completed.",
    category: "project",
    status: "active",
    subject: "Your Project Has Been Successfully Completed",
    previewText: "Review the completed work and your updated technology environment.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["primaryCta"],
    optionalVariables: ["firstName", "organizationName", "projectName"],
    defaults: {
      subject: "Your Project Has Been Successfully Completed",
      previewText: "Review the completed work and your updated technology environment.",
    },
    sampleData: {
      heroTitle: "Project Successfully Completed",
      primaryCta: {
        label: "View Completed Project",
        href: PREVIEW_PROTECTED_URL,
      },
      secondaryCta: {
        label: "View Updated Technology Roadmap",
        href: PREVIEW_PROTECTED_URL,
      },
    },
  }),
  EMAIL_009,
  workflowTemplate({
    key: "EMAIL-010",
    documentId: "EMAIL-010",
    name: "StackScore vCIO Welcome",
    description:
      "Client lifecycle email sent when a StackScore vCIO subscription becomes active.",
    category: "lifecycle",
    status: "active",
    subject: "Welcome to StackScore vCIO",
    previewText: "Your vCIO service is active. Complete onboarding and schedule your strategy session.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["primaryCta"],
    optionalVariables: [
      "clientName",
      "organizationName",
      "technologyScore",
      "roadmapUrl",
      "dashboardUrl",
      "onboardingUrl",
      "strategySessionUrl",
      "supportEmail",
      "currentYear",
    ],
    defaults: {
      subject: "Welcome to StackScore vCIO",
      previewText:
        "Your vCIO service is active. Complete onboarding and schedule your strategy session.",
    },
    sampleData: buildVcioWelcomeSampleData(),
  }),
];

export function getEmailTemplate(key: string): EmailTemplateDefinition | undefined {
  return EMAIL_TEMPLATE_REGISTRY.find((template) => template.key === key);
}

export function listEmailTemplates(): EmailTemplateDefinition[] {
  return [...EMAIL_TEMPLATE_REGISTRY];
}

export function isTemplatePreviewable(template: EmailTemplateDefinition): boolean {
  return template.status !== "archived";
}

export const CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  onboarding: "Onboarding",
  assessment: "Assessment",
  roadmap: "Roadmap",
  proposal: "Proposal",
  security: "Security",
  project: "Project",
  review: "Review",
  lifecycle: "Client Lifecycle",
  invitation: "Invitation",
};

export const STATUS_LABELS: Record<EmailTemplateStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};
