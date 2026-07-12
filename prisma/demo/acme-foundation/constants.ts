/** Stable identifiers for idempotent Acme Foundation demo seeding. */
export const ACME_DEMO = {
  clientId: "a0000001-0000-4000-8000-000000000001",
  clientUserId: "a0000001-0000-4000-8000-000000000002",
  baselineAssessmentId: "a0000001-0000-4000-8000-000000000011",
  currentAssessmentId: "a0000001-0000-4000-8000-000000000012",
  tipId: "a0000001-0000-4000-8000-000000000020",
  projectM365Id: "a0000001-0000-4000-8000-000000000031",
  projectEndpointId: "a0000001-0000-4000-8000-000000000032",
  projectBackupId: "a0000001-0000-4000-8000-000000000033",
  billingContactId: "a0000001-0000-4000-8000-000000000040",
  qbrId: "a0000001-0000-4000-8000-000000000041",
  depositEndpointId: "a0000001-0000-4000-8000-000000000050",
  invoicePaidId: "a0000001-0000-4000-8000-000000000051",
  invoiceSentId: "a0000001-0000-4000-8000-000000000052",
  invoicePartialId: "a0000001-0000-4000-8000-000000000053",
  invoiceOverdueId: "a0000001-0000-4000-8000-000000000054",
  invoiceDraftId: "a0000001-0000-4000-8000-000000000055",
  paymentStripeId: "a0000001-0000-4000-8000-000000000060",
  paymentCheckId: "a0000001-0000-4000-8000-000000000061",
  recurringManagedItId: "a0000001-0000-4000-8000-000000000070",
  recurringM365Id: "a0000001-0000-4000-8000-000000000071",
  recurringBackupId: "a0000001-0000-4000-8000-000000000072",
  documentTipId: "a0000001-0000-4000-8000-000000000080",
  documentQbrId: "a0000001-0000-4000-8000-000000000081",
  documentProjectId: "a0000001-0000-4000-8000-000000000082",
  companyName: "Acme Inc.",
  primaryContactName: "Sarah Mitchell",
  primaryContactTitle: "Executive Director",
  industry: "Community Services / Nonprofit",
  locationCity: "Houston",
  locationState: "Texas",
  notesMarker: "DEMO:ACME_FOUNDATION",
} as const;

export const ACME_DEMO_REC_KEYS = [
  "endpoint-management",
  "backup-recovery",
  "infrastructure-monitoring",
  "admin-account-controls",
  "technology-documentation",
  "patch-management",
  "incident-response",
  "wireless-segmentation",
  "quarterly-reviews",
  "technology-roadmap",
  "vendor-lifecycle",
] as const;

export type AcmeDemoRecKey = (typeof ACME_DEMO_REC_KEYS)[number];

export function acmeDedupeKey(key: AcmeDemoRecKey): string {
  return `demo:acme:${key}`;
}

export function resolveDemoClientEmail(): string {
  const fromEnv = process.env.DEMO_CLIENT_EMAIL?.trim();
  if (fromEnv) return fromEnv.toLowerCase();

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DEMO_CLIENT_EMAIL is required in production. Demo seeding is development-only by default.",
    );
  }

  return "acme.foundation.demo@bobkatit.com";
}

export function resolveDemoClientPassword(): string {
  const fromEnv = process.env.DEMO_CLIENT_PASSWORD?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DEMO_CLIENT_PASSWORD is required in production. Demo seeding is development-only by default.",
    );
  }

  return "AcmeDemo2026!";
}

export function assertDemoSeedAllowed(): void {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      "Acme Foundation demo seed is blocked in production. Set ALLOW_DEMO_SEED=true only for controlled review environments.",
    );
  }
}
