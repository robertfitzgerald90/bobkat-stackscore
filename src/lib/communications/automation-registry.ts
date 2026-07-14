import { EMAIL_TEMPLATE_REGISTRY, getEmailTemplate } from "@/lib/communications/registry";

export type CommunicationAutomationStatus =
  | "connected"
  | "missing_trigger"
  | "disabled"
  | "manual_only"
  | "scheduled"
  | "not_implemented"
  | "error";

export type CommunicationAutomationDefinition = {
  event: string;
  description: string;
  templateKey: string;
  triggerSource: string;
  handler: string;
  recipient: string;
  conditions: readonly string[];
  enabled: boolean;
  status: CommunicationAutomationStatus;
  idempotencyKey: string;
  retryBehavior: string;
  logBehavior: string;
  manualResend: boolean;
  verified: boolean;
};

export const COMMUNICATION_AUTOMATION_REGISTRY: CommunicationAutomationDefinition[] = [
  {
    event: "ACCOUNT_ACTIVATION_CREATED",
    description: "Assessment purchase creates or prepares a customer account.",
    templateKey: "EMAIL-001",
    triggerSource: "Stripe checkout fulfillment",
    handler: "src/lib/email/purchase-fulfillment.ts",
    recipient: "Purchaser email / organization primary contact",
    conditions: ["Assessment checkout fulfilled", "Account activation token exists"],
    enabled: true,
    status: "connected",
    idempotencyKey: "account-activation:{userId}:{assessmentPurchaseId}",
    retryBehavior: "Provider send failure is recorded; webhook retry is guarded by checkout fulfillment state.",
    logBehavior: "CommunicationMessage and OrganizationActivityEvent",
    manualResend: true,
    verified: true,
  },
  {
    event: "ASSESSMENT_READY",
    description: "Assessment purchase is fulfilled for an existing active user.",
    templateKey: "LEGACY-ASSESSMENT-READY",
    triggerSource: "Stripe checkout fulfillment",
    handler: "src/lib/email/purchase-fulfillment.ts",
    recipient: "Purchaser email",
    conditions: ["Assessment checkout fulfilled", "User does not require activation"],
    enabled: true,
    status: "connected",
    idempotencyKey: "assessment-ready:{assessmentId}",
    retryBehavior: "Provider send failure is recorded; checkout fulfillment prevents duplicate business state.",
    logBehavior: "CommunicationMessage and OrganizationActivityEvent",
    manualResend: true,
    verified: true,
  },
  {
    event: "ASSESSMENT_COMPLETE",
    description: "Technology assessment transitions to completed.",
    templateKey: "EMAIL-002",
    triggerSource: "Assessment completion workflow",
    handler: "src/lib/communications/workflows/triggers.ts#triggerAssessmentCompleteWorkflow",
    recipient: "Assessment client recipients",
    conditions: ["assessment.completedAt exists"],
    enabled: true,
    status: "connected",
    idempotencyKey: "assessment-complete:{assessmentId}",
    retryBehavior: "Queued for review; send attempts are tracked.",
    logBehavior: "CommunicationQueueItem and CommunicationMessage",
    manualResend: true,
    verified: false,
  },
  {
    event: "ROADMAP_READY",
    description: "Technology roadmap is generated and published.",
    templateKey: "EMAIL-003",
    triggerSource: "Roadmap publish workflow",
    handler: "src/lib/communications/workflows/triggers.ts#triggerRoadmapPublishedWorkflow",
    recipient: "Roadmap client recipients",
    conditions: ["TIP generatedAt exists"],
    enabled: true,
    status: "connected",
    idempotencyKey: "roadmap-ready:{roadmapId}:{version}",
    retryBehavior: "Queued for review; send attempts are tracked.",
    logBehavior: "CommunicationQueueItem and CommunicationMessage",
    manualResend: true,
    verified: true,
  },
  {
    event: "PROPOSAL_READY",
    description: "Technology proposal becomes available to the client.",
    templateKey: "EMAIL-004",
    triggerSource: "Proposal publish/send action",
    handler: "src/lib/communications/workflows/registry.ts#proposal_published",
    recipient: "Proposal client recipients",
    conditions: ["Proposal is client-visible"],
    enabled: true,
    status: "manual_only",
    idempotencyKey: "proposal-ready:{proposalId}:{publishedVersion}",
    retryBehavior: "Queued/manual send.",
    logBehavior: "CommunicationQueueItem and CommunicationMessage",
    manualResend: true,
    verified: false,
  },
  {
    event: "PASSWORD_RESET_REQUESTED",
    description: "Valid password reset requested.",
    templateKey: "EMAIL-005",
    triggerSource: "Authentication service",
    handler: "src/lib/auth/password-reset.ts#requestPasswordReset",
    recipient: "Requesting user",
    conditions: ["Valid reset request", "Reset token generated"],
    enabled: true,
    status: "connected",
    idempotencyKey: "password-reset:{userId}:{tokenId}",
    retryBehavior: "Security-sensitive; no blind automatic retries.",
    logBehavior: "CommunicationMessage",
    manualResend: false,
    verified: false,
  },
  {
    event: "QUARTERLY_REVIEW_REMINDER",
    description: "Quarterly technology review should be scheduled.",
    templateKey: "EMAIL-006",
    triggerSource: "Quarterly review reminder workflow",
    handler: "src/lib/communications/quarterly-review/reminders.ts",
    recipient: "Organization primary contact",
    conditions: ["Reminder is due", "Review not completed"],
    enabled: true,
    status: "scheduled",
    idempotencyKey: "quarterly-review-reminder:{clientId}:{dueAt}",
    retryBehavior: "Reminder state tracks failures.",
    logBehavior: "QuarterlyReviewReminder and CommunicationMessage",
    manualResend: true,
    verified: true,
  },
  {
    event: "PROJECTS_SHARED",
    description: "Client-visible implementation projects are shared.",
    templateKey: "EMAIL-007",
    triggerSource: "Project share action",
    handler: "src/lib/communications/workflows/triggers.ts#triggerProjectBatchNotification",
    recipient: "Project client recipients",
    conditions: ["Projects explicitly shared", "Not internal draft creation"],
    enabled: false,
    status: "missing_trigger",
    idempotencyKey: "project-created:{projectId}:{publishedAt}",
    retryBehavior: "Queued for review; send attempts are tracked.",
    logBehavior: "CommunicationQueueItem and CommunicationMessage",
    manualResend: true,
    verified: false,
  },
  {
    event: "PROJECT_COMPLETED",
    description: "Client-visible project transitions to completed.",
    templateKey: "EMAIL-008",
    triggerSource: "Project completion action",
    handler: "src/lib/communications/workflows/triggers.ts#triggerProjectCompletedWorkflow",
    recipient: "Project client recipients",
    conditions: ["project.completedAt exists", "Project belongs to client"],
    enabled: true,
    status: "connected",
    idempotencyKey: "project-completed:{projectId}:{completedAt}",
    retryBehavior: "Automatic or manual depending on communication settings.",
    logBehavior: "CommunicationQueueItem and CommunicationMessage",
    manualResend: true,
    verified: true,
  },
  {
    event: "ASSESSMENT_INVITATION_SENT",
    description: "Administrator sends an assessment invitation.",
    templateKey: "EMAIL-009",
    triggerSource: "Assessment invitation action",
    handler: "src/lib/communications/outreach/send-invitation.ts",
    recipient: "Invitation recipient",
    conditions: ["Recipient email is valid", "Invitation URL generated"],
    enabled: true,
    status: "connected",
    idempotencyKey: "assessment-invitation:{prospectId}:{campaignId}",
    retryBehavior: "Manual resend creates a new tracked message.",
    logBehavior: "CommunicationMessage and campaign/prospect activity",
    manualResend: true,
    verified: true,
  },
  {
    event: "VCIO_SUBSCRIPTION_ACTIVATED",
    description: "Organization's vCIO subscription first reaches active/trialing.",
    templateKey: "EMAIL-010",
    triggerSource: "Stripe subscription synchronization service",
    handler: "src/lib/vcio/initialization.ts",
    recipient: "Organization primary contact or explicit safe test recipient",
    conditions: ["Subscription status is active or trialing", "Not previously sent for activation"],
    enabled: true,
    status: "connected",
    idempotencyKey: "vcio-welcome:{organizationId}:{subscriptionId}:{activationSequence}",
    retryBehavior: "Webhook retries are deduped by CommunicationMessage.idempotencyKey.",
    logBehavior: "CommunicationMessage, VcioOnboarding, BillingAuditEvent, OrganizationActivityEvent",
    manualResend: true,
    verified: true,
  },
  {
    event: "VCIO_PAYMENT_FAILED",
    description: "vCIO subscription invoice payment fails.",
    templateKey: "VCIO-PAYMENT-FAILED",
    triggerSource: "Stripe invoice.payment_failed",
    handler: "src/lib/vcio/invoices.ts#markVcioInvoicePaymentFailed",
    recipient: "Organization primary contact",
    conditions: ["Invoice belongs to vCIO subscription", "Failure details are safe to show"],
    enabled: true,
    status: "missing_trigger",
    idempotencyKey: "payment-failed:{invoiceId}:{attemptCount}",
    retryBehavior: "One email per failed attempt when wired through dispatcher.",
    logBehavior: "SubscriptionPaymentAttempt and CommunicationMessage",
    manualResend: true,
    verified: false,
  },
  {
    event: "VCIO_CANCELLATION_SCHEDULED",
    description: "cancel_at_period_end changes from false to true.",
    templateKey: "VCIO-CANCELLATION-SCHEDULED",
    triggerSource: "Stripe customer.subscription.updated",
    handler: "src/lib/vcio/subscriptions.ts",
    recipient: "Organization primary contact",
    conditions: ["cancelAtPeriodEnd transition false -> true"],
    enabled: true,
    status: "missing_trigger",
    idempotencyKey: "cancellation-scheduled:{subscriptionId}:{currentPeriodEnd}",
    retryBehavior: "One email per state transition when wired through dispatcher.",
    logBehavior: "CommunicationMessage",
    manualResend: true,
    verified: false,
  },
  {
    event: "VCIO_SUBSCRIPTION_ENDED",
    description: "Subscription reaches canceled/ended state.",
    templateKey: "VCIO-SUBSCRIPTION-ENDED",
    triggerSource: "Stripe subscription deleted or synchronized end-state transition",
    handler: "src/lib/vcio/subscriptions.ts",
    recipient: "Organization primary contact",
    conditions: ["Subscription status transitions to canceled"],
    enabled: true,
    status: "missing_trigger",
    idempotencyKey: "subscription-ended:{subscriptionId}:{endedAt}",
    retryBehavior: "One email per ended transition when wired through dispatcher.",
    logBehavior: "CommunicationMessage",
    manualResend: true,
    verified: false,
  },
];

export function listCommunicationAutomations() {
  return [...COMMUNICATION_AUTOMATION_REGISTRY];
}

export function getAutomationsForTemplate(templateKey: string) {
  return COMMUNICATION_AUTOMATION_REGISTRY.filter((automation) => automation.templateKey === templateKey);
}

export function getCommunicationAutomation(event: string) {
  return COMMUNICATION_AUTOMATION_REGISTRY.find((automation) => automation.event === event);
}

export function getTemplateAutomationStatus(templateKey: string): CommunicationAutomationStatus {
  const automations = getAutomationsForTemplate(templateKey);
  if (automations.length === 0) return "missing_trigger";
  if (automations.some((automation) => automation.status === "connected")) return "connected";
  if (automations.some((automation) => automation.status === "scheduled")) return "scheduled";
  if (automations.some((automation) => automation.status === "manual_only")) return "manual_only";
  if (automations.some((automation) => automation.status === "error")) return "error";
  if (automations.every((automation) => automation.status === "disabled")) return "disabled";
  if (automations.every((automation) => automation.status === "not_implemented")) return "not_implemented";
  return "missing_trigger";
}

export function listTemplateAutomationRows() {
  return EMAIL_TEMPLATE_REGISTRY.map((template) => ({
    template,
    automations: getAutomationsForTemplate(template.key),
    automationStatus: getTemplateAutomationStatus(template.key),
    templateExists: Boolean(getEmailTemplate(template.key)),
  }));
}
