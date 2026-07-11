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
  render: (data: TData) => Promise<RenderedEmail>;
};

export type CommunicationDashboardStats = {
  activeTemplates: number;
  draftTemplates: number;
  previewableTemplates: number;
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
