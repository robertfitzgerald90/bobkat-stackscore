import { renderCommunicationTemplate } from "@/lib/communications/render-template";
import { PREVIEW_ACTIVATION_URL } from "@/lib/communications/sample-data";
import { getAppUrl } from "@/lib/stripe/app-url";
import { BRAND } from "@/lib/branding";

export async function buildActivationEmail(input: {
  activationUrl: string;
  firstName?: string;
  organizationName?: string;
}): Promise<{ subject: string; html: string; text: string }> {
  const rendered = await renderCommunicationTemplate("EMAIL-001", {
    activationUrl: input.activationUrl,
    firstName: input.firstName,
    organizationName: input.organizationName,
  });

  return {
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  };
}

export async function buildAssessmentReadyEmail(input: {
  loginUrl: string;
  startUrl: string;
  firstName?: string;
  organizationName?: string;
}): Promise<{ subject: string; html: string; text: string }> {
  const greeting = input.firstName ? `${input.firstName}, your assessment is ready` : "Your assessment is ready";

  const rendered = await renderCommunicationTemplate("LEGACY-ASSESSMENT-READY", {
    heroTitle: "Your Assessment Workspace Is Ready",
    heroDescription: `${BRAND.productName} is prepared for ${input.organizationName ?? "your organization"}.`,
    previewText: "Sign in to begin your Technology Maturity Assessment.",
    paragraphs: [
      greeting,
      `Your ${BRAND.reportTitle} workspace is ready. When you sign in, you can pick up where you left off or start from your dashboard.`,
      "Your responses, scores, and recommendations will stay organized in one executive-ready workspace.",
    ],
    summaryTitle: "What you can do next",
    summaryItems: [
      "Complete the guided Technology Maturity Assessment",
      "Review pillar scores and executive reporting",
      "Build a practical improvement roadmap with Bobkat IT",
    ],
    primaryCta: { label: "Start My Assessment", href: input.startUrl },
    secondaryCta: { label: "Sign In to StackScore", href: input.loginUrl },
    closingParagraph: `Questions before you begin? Reply to this email or contact ${BRAND.email}.`,
  });

  return {
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  };
}

export function buildActivationUrls(rawToken: string) {
  const appUrl = getAppUrl();
  return {
    activationUrl: `${appUrl}/activate-account?token=${encodeURIComponent(rawToken)}`,
    loginUrl: `${appUrl}/login`,
    startUrl: `${appUrl}/assessment/start`,
  };
}

/** Sample activation URL for previews and local testing. */
export function buildSampleActivationUrl(): string {
  return PREVIEW_ACTIVATION_URL;
}
