import { getAppUrl } from "@/lib/stripe/app-url";
import { BRAND } from "@/lib/branding";

export function buildActivationEmail(input: {
  activationUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Activate your ${BRAND.reportTitle} account`;

  const text = [
    `Thank you for purchasing the ${BRAND.reportTitle}.`,
    "",
    "Activate your account to begin your assessment:",
    input.activationUrl,
    "",
    "This link expires in 7 days and can only be used once.",
    "",
    `— ${BRAND.companyName}`,
  ].join("\n");

  const html = `
    <p>Thank you for purchasing the <strong>${BRAND.reportTitle}</strong>.</p>
    <p>Activate your account to begin your assessment:</p>
    <p><a href="${input.activationUrl}">${input.activationUrl}</a></p>
    <p>This link expires in 7 days and can only be used once.</p>
    <p>— ${BRAND.companyName}</p>
  `.trim();

  return { subject, html, text };
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
