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

export function buildAssessmentReadyEmail(input: {
  loginUrl: string;
  startUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Your ${BRAND.reportTitle} is ready`;

  const text = [
    `Your new ${BRAND.reportTitle} is ready.`,
    "",
    `Sign in to continue: ${input.loginUrl}`,
    `Or go directly to your assessment: ${input.startUrl}`,
    "",
    `— ${BRAND.companyName}`,
  ].join("\n");

  const html = `
    <p>Your new <strong>${BRAND.reportTitle}</strong> is ready.</p>
    <p><a href="${input.loginUrl}">Sign in to StackScore</a></p>
    <p><a href="${input.startUrl}">Start your assessment</a></p>
    <p>— ${BRAND.companyName}</p>
  `.trim();

  return { subject, html, text };
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
