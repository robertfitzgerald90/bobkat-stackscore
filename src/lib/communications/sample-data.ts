import {
  formatAssessmentWelcomeSummaryItems,
  VCIO_CUSTOMER_EMAIL_COPY,
} from "@/lib/vcio/customer-email-copy";
import { BRAND } from "@/lib/branding";
import type { AccountActivationEmailData } from "@/emails/templates/account-activation";
import type { AssessmentInvitationEmailData } from "@/emails/templates/assessment-invitation";
import {
  getTechnologyMaturityAssessmentBookingUrl,
} from "@/lib/communications/booking-urls";

/** Safe fake activation URL — never a production token. */
export const PREVIEW_ACTIVATION_URL =
  "https://app.stackscore.example/activate-account?token=preview-sample-do-not-use";

/** Safe fake invitation URL — never a production token. */
export const PREVIEW_INVITATION_URL =
  "https://app.stackscore.example/assessment-invitation";

export const PREVIEW_PROTECTED_URL =
  "https://app.stackscore.example/login?callbackUrl=%2Fpreview-sample";

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
    assessmentBookingUrl: getTechnologyMaturityAssessmentBookingUrl(),
    supportEmail: BRAND.email,
    websiteUrl: "https://www.bobkatit.com",
    ...overrides,
  };
}

export const PREVIEW_RESET_PASSWORD_URL =
  "https://app.stackscore.example/reset-password?token=preview-sample";

export function buildPasswordResetSampleData(
  overrides: Partial<{
    heroTitle: string;
    previewText: string;
    paragraphs: string[];
    primaryCta: { label: string; href: string };
    securityNotice: string;
    firstName: string;
  }> = {},
) {
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
      href: PREVIEW_RESET_PASSWORD_URL,
    },
    securityNotice:
      "Your password reset link expires in 60 minutes and can only be used once. Never share this link with anyone.",
    firstName: "Alex",
    ...overrides,
  };
}

export function buildVcioWelcomeSampleData(
  overrides: Partial<{
    clientName: string;
    organizationName: string;
    technologyScore: string;
    roadmapUrl: string;
    dashboardUrl: string;
    onboardingUrl: string;
    strategySessionUrl: string;
    supportEmail: string;
    currentYear: string;
    heroTitle: string;
    heroDescription: string;
    paragraphs: string[];
    summaryTitle: string;
    summaryItems: string[];
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  }> = {},
) {
  const dashboardUrl = PREVIEW_PROTECTED_URL;
  const onboardingUrl = "https://app.stackscore.example/portal/vcio/onboarding";
  const welcome = VCIO_CUSTOMER_EMAIL_COPY.welcome;

  return {
    clientName: "Alex",
    organizationName: "Northwind Professional Services",
    technologyScore: "72",
    roadmapUrl: dashboardUrl,
    dashboardUrl,
    onboardingUrl,
    strategySessionUrl: onboardingUrl,
    supportEmail: BRAND.email,
    currentYear: String(new Date().getFullYear()),
    heroTitle: welcome.heroTitle,
    heroDescription: welcome.heroDescription,
    paragraphs: [...welcome.paragraphs],
    summaryTitle: welcome.summaryTitle,
    summaryItems: [...welcome.summaryItems],
    primaryCta: {
      label: welcome.primaryCta,
      href: onboardingUrl,
    },
    secondaryCta: {
      label: welcome.secondaryCta,
      href: dashboardUrl,
    },
    ...overrides,
  };
}

export function buildVcioManagedServicesWelcomeSampleData(
  overrides: Parameters<typeof buildVcioWelcomeSampleData>[0] = {},
) {
  const copy = VCIO_CUSTOMER_EMAIL_COPY.welcomeManagedServices;
  return buildVcioWelcomeSampleData({
    heroTitle: copy.heroTitle,
    heroDescription: copy.heroDescription,
    paragraphs: [...copy.paragraphs],
    summaryItems: [...copy.summaryItems],
    primaryCta: {
      label: copy.primaryCta,
      href: "https://app.stackscore.example/portal/roadmap",
    },
    secondaryCta: {
      label: copy.secondaryCta,
      href: "https://app.stackscore.example/portal/vcio/onboarding",
    },
    ...overrides,
  });
}

export function buildVcioAssessmentWelcomeSampleData(
  overrides: Parameters<typeof buildVcioWelcomeSampleData>[0] = {},
) {
  const copy = VCIO_CUSTOMER_EMAIL_COPY.welcomeAssessmentCustomer;
  return buildVcioWelcomeSampleData({
    heroTitle: copy.heroTitle,
    heroDescription: copy.heroDescription,
    paragraphs: [...copy.paragraphs],
    summaryItems: formatAssessmentWelcomeSummaryItems("72"),
    primaryCta: {
      label: copy.primaryCta,
      href: "https://app.stackscore.example/portal/vcio/onboarding",
    },
    secondaryCta: {
      label: copy.secondaryCta,
      href: PREVIEW_PROTECTED_URL,
    },
    ...overrides,
  });
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
