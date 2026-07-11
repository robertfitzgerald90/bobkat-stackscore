export {
  CATEGORY_LABELS,
  EMAIL_TEMPLATE_REGISTRY,
  getEmailTemplate,
  isTemplatePreviewable,
  listEmailTemplates,
  STATUS_LABELS,
} from "./registry";
export { getCommunicationDashboardStats, getRecentTestSends } from "./dashboard";
export { renderCommunicationTemplate } from "./render-template";
export { sendCommunicationTestEmail } from "./send-test-email";
export {
  buildAccountActivationSampleData,
  mergeTemplateData,
  PREVIEW_ACTIVATION_URL,
} from "./sample-data";
export type {
  CommunicationDashboardStats,
  CommunicationTestSendRecord,
  EmailTemplateCategory,
  EmailTemplateDefinition,
  EmailTemplateStatus,
  RenderedEmail,
} from "./types";
