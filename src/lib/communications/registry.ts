import { renderEmailTemplate } from "@/emails/render-email";
import { AccountActivationEmail } from "@/emails/templates/account-activation";
import type { AccountActivationEmailData } from "@/emails/templates/account-activation";
import { AssessmentInvitationEmail } from "@/emails/templates/assessment-invitation";
import type { AssessmentInvitationEmailData } from "@/emails/templates/assessment-invitation";
import { DEFAULT_COMMUNICATION_BRAND } from "@/lib/communications/brand-types";
import {
  buildAccountActivationSampleData,
  buildAssessmentInvitationSampleData,
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

function draftTemplate(meta: DraftTemplateMeta): EmailTemplateDefinition {
  return {
    ...meta,
    sampleData: {},
    render: async () => {
      throw new Error(`Template ${meta.key} is not implemented yet.`);
    },
  };
}

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
  sampleData: buildAccountActivationSampleData(),
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
  sampleData: buildAssessmentInvitationSampleData(),
  render: renderAssessmentInvitation,
};

export const EMAIL_TEMPLATE_REGISTRY: EmailTemplateDefinition[] = [
  EMAIL_001,
  draftTemplate({
    key: "EMAIL-002",
    documentId: "EMAIL-002",
    name: "Assessment Complete",
    description: "Notifies the customer that their assessment results are ready for review.",
    category: "assessment",
    status: "draft",
    subject: "Your StackScore Assessment is Complete",
    previewText: "Your technology maturity report is now available.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["resultsUrl"],
    optionalVariables: ["firstName", "organizationName"],
  }),
  draftTemplate({
    key: "EMAIL-003",
    documentId: "EMAIL-003",
    name: "Roadmap Ready",
    description: "Informs the customer that their Technology Roadmap has been generated.",
    category: "roadmap",
    status: "draft",
    subject: "Your Technology Roadmap is Ready",
    previewText: "Explore your prioritized technology improvement plan.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["roadmapUrl"],
    optionalVariables: ["firstName", "organizationName"],
  }),
  draftTemplate({
    key: "EMAIL-004",
    documentId: "EMAIL-004",
    name: "Proposal Ready",
    description: "Notifies the customer that a technology proposal is available for review.",
    category: "proposal",
    status: "draft",
    subject: "Your Technology Proposal is Ready",
    previewText: "Review your recommended technology improvements.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["proposalUrl"],
    optionalVariables: ["firstName", "organizationName"],
  }),
  draftTemplate({
    key: "EMAIL-005",
    documentId: "EMAIL-005",
    name: "Password Reset",
    description: "Allows a customer to securely reset their StackScore password.",
    category: "security",
    status: "draft",
    subject: "Reset Your StackScore Password",
    previewText: "A request was received to reset your StackScore password.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["resetUrl"],
    optionalVariables: ["firstName"],
  }),
  draftTemplate({
    key: "EMAIL-006",
    documentId: "EMAIL-006",
    name: "Quarterly Technology Review",
    description: "Invites customers to schedule a quarterly technology review.",
    category: "review",
    status: "draft",
    subject: "It's Time for Your Quarterly Technology Review",
    previewText: "Let's review what's changed in your technology environment.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["reviewUrl"],
    optionalVariables: ["firstName", "organizationName"],
  }),
  draftTemplate({
    key: "EMAIL-007",
    documentId: "EMAIL-007",
    name: "Project Created",
    description: "Notifies a customer that a new implementation project has been created.",
    category: "project",
    status: "draft",
    subject: "A New Project Has Been Created",
    previewText: "Your next technology improvement project is ready.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["projectUrl"],
    optionalVariables: ["firstName", "organizationName", "projectName"],
  }),
  draftTemplate({
    key: "EMAIL-008",
    documentId: "EMAIL-008",
    name: "Project Completed",
    description: "Notifies the customer that an implementation project has been completed.",
    category: "project",
    status: "draft",
    subject: "Your Project Has Been Successfully Completed",
    previewText: "Review the completed work and your updated technology environment.",
    lastUpdated: LAST_UPDATED,
    requiredVariables: ["projectUrl"],
    optionalVariables: ["firstName", "organizationName", "projectName"],
  }),
  EMAIL_009,
];

export function getEmailTemplate(key: string): EmailTemplateDefinition | undefined {
  return EMAIL_TEMPLATE_REGISTRY.find((template) => template.key === key);
}

export function listEmailTemplates(): EmailTemplateDefinition[] {
  return [...EMAIL_TEMPLATE_REGISTRY];
}

export function isTemplatePreviewable(template: EmailTemplateDefinition): boolean {
  return template.status === "active";
}

export const CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  onboarding: "Onboarding",
  assessment: "Assessment",
  roadmap: "Roadmap",
  proposal: "Proposal",
  security: "Security",
  project: "Project",
  review: "Review",
  invitation: "Invitation",
};

export const STATUS_LABELS: Record<EmailTemplateStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};
