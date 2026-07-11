export type EmailTemplateStatus = "draft" | "active" | "archived";

export type EmailTemplateCategory =
  | "onboarding"
  | "assessment"
  | "roadmap"
  | "proposal"
  | "security"
  | "project"
  | "review"
  | "invitation";

import type { CommunicationBrandConfig } from "@/lib/communications/brand-types";
import type { TemplateVersionContent } from "@/lib/communications/template-content";

export type RenderContext = {
  brand: CommunicationBrandConfig;
  content: TemplateVersionContent | null;
};

export type RenderedEmail = {
  subject: string;
  previewText: string;
  html: string;
  text: string;
};

export type EmailTemplateDefinition<TData = Record<string, unknown>> = {
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
  sampleData: TData;
  render: (data: TData, context?: RenderContext) => Promise<RenderedEmail>;
};

export type CommunicationDashboardStats = {
  activeTemplates: number;
  draftTemplates: number;
  archivedTemplates: number;
  previewableTemplates: number;
  publishedVersions: number;
  draftVersions: number;
  templatesNeedingReview: number;
  testEmailsSent: number;
  lastTestEmail: {
    templateKey: string;
    recipientEmail: string;
    status: string;
    createdAt: string;
  } | null;
  providerConfigured: boolean;
  providerLabel: string;
};

export type CommunicationTestSendRecord = {
  id: string;
  templateKey: string;
  templateName: string;
  recipientEmail: string;
  status: string;
  errorMessage: string | null;
  sentByName: string;
  createdAt: string;
};

export type TemplateActivityItem = {
  id: string;
  templateKey: string;
  templateName: string;
  versionNumber: number;
  status: string;
  changeNotes: string | null;
  actorName: string | null;
  occurredAt: string;
};

export type CommunicationHealthItem = {
  id: string;
  label: string;
  status: "healthy" | "attention";
  detail: string;
};

export type TemplateVersionSummary = {
  publishedCount: number;
  draftCount: number;
  templatesNeedingReview: number;
};

export type TemplateVersionView = {
  id: string;
  templateKey: string;
  versionNumber: number;
  status: "draft" | "published" | "archived";
  subject: string;
  previewText: string;
  content: Record<string, unknown>;
  sharedComponents: string[];
  changeNotes: string | null;
  publishedAt: string | null;
  publishedByName: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VariableCategory =
  | "Customer"
  | "Assessment"
  | "Organization"
  | "Roadmap"
  | "Proposal"
  | "Projects"
  | "Technology"
  | "Communications"
  | "Authentication"
  | "Future";

export type VariableDefinition = {
  name: string;
  description: string;
  example: string;
  category: VariableCategory;
  required: boolean;
  source: string;
};

export type TemplateValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};
