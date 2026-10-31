/**
 * SS-SEC-007 — Explicit API route classification registry.
 *
 * Middleware does NOT protect /api/*. Every route must appear here so CI can
 * reject unclassified (accidentally public) handlers. Runtime auth still uses
 * existing helpers (getSessionUser, requireAdmin, workspace access, secrets).
 *
 * Paths are relative to src/app/api/ and must match filesystem route.ts files.
 */

export type ApiRouteClass =
  | "public"
  | "authenticated"
  | "staff"
  | "admin"
  | "client_scoped"
  | "internal"
  | "mixed";

export type ApiRouteRegistration = {
  /** Path relative to src/app/api/, including route.ts suffix. */
  path: string;
  classification: ApiRouteClass;
  /** Short note: helpers used / method split for mixed. */
  notes: string;
};

/**
 * Complete inventory — keep sorted by path. When adding a route under
 * src/app/api (any nested route.ts), add an entry here in the same PR.
 */
export const API_ROUTE_REGISTRY: readonly ApiRouteRegistration[] = [
  { path: "auth/[...nextauth]/route.ts", classification: "public", notes: "Auth.js handlers" },
  { path: "checkout/create-session/route.ts", classification: "public", notes: "Assessment Stripe Checkout; IP rate limited" },
  { path: "checkout/vcio/route.ts", classification: "mixed", notes: "Optional session; anon Checkout allowed; IP rate limited" },
  { path: "cron/communications/route.ts", classification: "internal", notes: "CRON_SECRET bearer" },
  { path: "integrations/website-leads/route.ts", classification: "internal", notes: "WEBSITE_LEADS_API_SECRET + durable IP rate limit" },
  { path: "product-overview/pdf/route.ts", classification: "public", notes: "SS-WEB-003-R2: retired (HTTP 410); no PDF generation" },
  { path: "v1/admin/assessment-library/categories/[id]/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/admin/assessment-library/questions/[id]/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/admin/assessment-library/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/admin/campaigns/[id]/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/campaigns/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/communications/brand/route.ts", classification: "mixed", notes: "GET staff; PUT admin (communications admin)" },
  { path: "v1/admin/communications/preview/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/communications/queue/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/communications/quick-invite/check/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/communications/quick-invite/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/communications/sample-profiles/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/communications/templates/[templateKey]/validate/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/communications/templates/[templateKey]/versions/route.ts", classification: "mixed", notes: "Publish/delete admin; other staff" },
  { path: "v1/admin/communications/test-send/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/prospects/[id]/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/prospects/import/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/prospects/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/admin/vcio/onboarding-test/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/assessments/[id]/archive/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/assessments/[id]/complete/route.ts", classification: "client_scoped", notes: "requireAssessmentAccess" },
  { path: "v1/assessments/[id]/deletion-preview/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/assessments/[id]/export/pdf/route.ts", classification: "client_scoped", notes: "requireAssessmentAccess" },
  { path: "v1/assessments/[id]/improvement/route.ts", classification: "client_scoped", notes: "requireAssessmentAccess" },
  { path: "v1/assessments/[id]/questions/route.ts", classification: "client_scoped", notes: "requireAssessmentAccess" },
  { path: "v1/assessments/[id]/recommendations/route.ts", classification: "client_scoped", notes: "requireAssessmentAccess" },
  { path: "v1/assessments/[id]/responses/[questionId]/route.ts", classification: "client_scoped", notes: "requireAssessmentAccess" },
  { path: "v1/assessments/[id]/route.ts", classification: "mixed", notes: "GET assessment access; PATCH staff; DELETE admin" },
  { path: "v1/auth/me/route.ts", classification: "authenticated", notes: "getSessionUser" },
  { path: "v1/clients/[id]/360/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/archive/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/clients/[id]/assessments/compare/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/assessments/history/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/assessments/route.ts", classification: "mixed", notes: "GET workspace; POST staff" },
  { path: "v1/clients/[id]/billing/deposits/route.ts", classification: "client_scoped", notes: "billing client/management" },
  { path: "v1/clients/[id]/billing/invoices/[invoiceId]/pdf/route.ts", classification: "client_scoped", notes: "requireBillingClientAccess" },
  { path: "v1/clients/[id]/billing/invoices/[invoiceId]/route.ts", classification: "client_scoped", notes: "billing client/management" },
  { path: "v1/clients/[id]/billing/invoices/route.ts", classification: "client_scoped", notes: "billing client/management" },
  { path: "v1/clients/[id]/billing/overview/route.ts", classification: "client_scoped", notes: "requireBillingClientAccess" },
  { path: "v1/clients/[id]/billing/payments/route.ts", classification: "client_scoped", notes: "billing client/management" },
  { path: "v1/clients/[id]/billing/portal/route.ts", classification: "client_scoped", notes: "workspace + portal gate" },
  { path: "v1/clients/[id]/billing/recurring-services/route.ts", classification: "client_scoped", notes: "billing client/management" },
  { path: "v1/clients/[id]/business-profile/route.ts", classification: "mixed", notes: "GET workspace; PATCH staff" },
  { path: "v1/clients/[id]/contacts/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/deletion-preview/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/clients/[id]/lifecycle/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/phase-proposals/[proposalId]/pdf/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/phase-proposals/[proposalId]/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/phase-proposals/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/projects/route.ts", classification: "mixed", notes: "GET workspace; POST staff" },
  { path: "v1/clients/[id]/proposals/[tipId]/publish/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/proposals/[tipId]/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/qbr/[qbrId]/generate/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/qbr/[qbrId]/pdf/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/qbr/[qbrId]/route.ts", classification: "mixed", notes: "GET workspace; PATCH staff" },
  { path: "v1/clients/[id]/qbr/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/restore/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/clients/[id]/roadmap/initiatives/[initiativeId]/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/roadmap/phases/[phaseId]/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/roadmap/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/route.ts", classification: "mixed", notes: "GET workspace; PATCH staff; DELETE admin" },
  { path: "v1/clients/[id]/technologies/[deploymentId]/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/technologies/route.ts", classification: "mixed", notes: "GET workspace; POST staff" },
  { path: "v1/clients/[id]/technology-profile/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/tip/[tipId]/generate/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/tip/[tipId]/pdf/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/tip/[tipId]/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/tip/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/vcio/onboarding/reset/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/vcio/onboarding/route.ts", classification: "client_scoped", notes: "requireClientWorkspaceAccess" },
  { path: "v1/clients/[id]/vcio/planning-notes/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/[id]/vcio/welcome-email/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/clients/route.ts", classification: "mixed", notes: "GET session (portal-scoped); POST staff" },
  { path: "v1/consulting-workspace/route.ts", classification: "staff", notes: "consultant role gate" },
  { path: "v1/dashboard/summary/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/health/route.ts", classification: "public", notes: "Minimal status only; no config disclosure" },
  { path: "v1/insights/route.ts", classification: "staff", notes: "consultant role gate" },
  { path: "v1/notifications/[id]/route.ts", classification: "authenticated", notes: "getSessionUserWithClient" },
  { path: "v1/notifications/route.ts", classification: "authenticated", notes: "getSessionUserWithClient" },
  { path: "v1/onboarding/route.ts", classification: "authenticated", notes: "getSessionUser" },
  { path: "v1/portfolio/summary/route.ts", classification: "admin", notes: "admin-only role gate" },
  { path: "v1/projects/[id]/cancel/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/projects/[id]/customer-updates/[updateId]/preview/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/customer-updates/[updateId]/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/customer-updates/[updateId]/send/route.ts", classification: "staff", notes: "requireConsultantOrAdmin; manual send only" },
  { path: "v1/projects/[id]/customer-updates/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/deletion-preview/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/projects/[id]/delivery/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/milestones/[milestoneId]/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/milestones/reorder/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/milestones/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/recommendations/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/route.ts", classification: "mixed", notes: "GET workspace; PATCH staff; DELETE admin" },
  { path: "v1/projects/[id]/tasks/[taskId]/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/tasks/reorder/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/[id]/tasks/route.ts", classification: "staff", notes: "requireConsultantOrAdmin" },
  { path: "v1/projects/route.ts", classification: "authenticated", notes: "getSessionUserWithClient; portal scoped" },
  { path: "v1/public/activate-account/route.ts", classification: "public", notes: "Token activation; SEC-004 rate limited" },
  { path: "v1/public/password-reset/route.ts", classification: "public", notes: "Reset request/confirm; SEC-004 rate limited" },
  { path: "v1/public/technology-snapshot/[leadId]/continue-assessment/route.ts", classification: "public", notes: "SEC-002 generic response; SEC-004 rate limited" },
  { path: "v1/public/technology-snapshot/route.ts", classification: "public", notes: "Lead create; SEC-004 rate limited" },
  { path: "v1/recommendations/[id]/archive/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/recommendations/[id]/deletion-preview/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/recommendations/[id]/route.ts", classification: "mixed", notes: "PATCH staff; DELETE admin" },
  { path: "v1/search/route.ts", classification: "authenticated", notes: "getSessionUser; portal vs firm" },
  { path: "v1/snapshot-leads/[id]/convert-preview/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/snapshot-leads/[id]/convert/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/snapshot-leads/[id]/notes/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/snapshot-leads/[id]/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/snapshot-leads/[id]/send-invitation/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/snapshot-leads/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/users/[id]/deletion-preview/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/users/[id]/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/users/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/website-leads/[id]/convert/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/website-leads/[id]/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "v1/website-leads/route.ts", classification: "admin", notes: "requireAdmin" },
  { path: "webhooks/resend/route.ts", classification: "internal", notes: "Svix signature" },
  { path: "webhooks/stripe/route.ts", classification: "internal", notes: "Stripe signature" },
] as const;

export const API_ROUTE_REGISTRY_BY_PATH: ReadonlyMap<string, ApiRouteRegistration> = new Map(
  API_ROUTE_REGISTRY.map((entry) => [entry.path, entry]),
);

export function listPublicApiRoutes(): ApiRouteRegistration[] {
  return API_ROUTE_REGISTRY.filter((r) => r.classification === "public");
}

export function getApiRouteRegistration(pathRelativeToApiRoot: string): ApiRouteRegistration | undefined {
  const normalized = pathRelativeToApiRoot.replace(/\\/g, "/");
  return API_ROUTE_REGISTRY_BY_PATH.get(normalized);
}
