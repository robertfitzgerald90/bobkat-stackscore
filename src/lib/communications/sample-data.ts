import { BRAND } from "@/lib/branding";
import type { AccountActivationEmailData } from "@/emails/templates/account-activation";
import type { AssessmentInvitationEmailData } from "@/emails/templates/assessment-invitation";

/** Safe fake activation URL — never a production token. */
export const PREVIEW_ACTIVATION_URL =
  "https://app.stackscore.example/activate-account?token=preview-sample-do-not-use";

/** Safe fake invitation URL — never a production token. */
export const PREVIEW_INVITATION_URL =
  "https://app.stackscore.example/assessment-invitation";

export function buildAccountActivationSampleData(
  overrides: Partial<AccountActivationEmailData> = {},
): AccountActivationEmailData {
  return {
    firstName: "Alex",
    organizationName: "Northwind Professional Services",
    assessmentName: `${BRAND.productName} Technology Maturity Assessment`,
    activationUrl: PREVIEW_ACTIVATION_URL,
    expirationDays: 7,
    supportEmail: BRAND.email,
    websiteUrl: "https://www.bobkatit.com",
    ...overrides,
  };
}

export function buildAssessmentInvitationSampleData(
  overrides: Partial<AssessmentInvitationEmailData> = {},
): AssessmentInvitationEmailData {
  return {
    firstName: "Alex",
    organizationName: "Northwind Professional Services",
    assessmentName: `${BRAND.productName} Technology Maturity Assessment`,
    invitationUrl: PREVIEW_INVITATION_URL,
    supportEmail: BRAND.email,
    websiteUrl: "https://www.bobkatit.com",
    ...overrides,
  };
}

export function mergeTemplateData<T extends Record<string, unknown>>(
  defaults: T,
  overrides: Partial<T> = {},
): T {
  const merged = { ...defaults, ...overrides };
  for (const key of Object.keys(overrides)) {
    const value = overrides[key as keyof T];
    if (value === undefined || value === null || value === "") {
      delete merged[key as keyof T];
    }
  }
  return merged;
}
