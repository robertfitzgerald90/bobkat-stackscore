import type { CommunicationBrandConfig } from "@/lib/communications/brand-types";
import { getEmailTemplate } from "@/lib/communications/registry";
import type { TemplateContentBlock } from "@/lib/communications/template-content";
import type { TemplateValidationIssue } from "@/lib/communications/types";

const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function isValidUrl(value: string): boolean {
  try {
    const url = value.startsWith("http") ? value : `https://${value}`;
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function pushIssue(
  issues: TemplateValidationIssue[],
  severity: TemplateValidationIssue["severity"],
  code: string,
  message: string,
) {
  issues.push({ severity, code, message });
}

export function validateTemplateForPublish(input: {
  templateKey: string;
  subject: string;
  previewText: string;
  content: TemplateContentBlock;
  brand: CommunicationBrandConfig;
  allSubjects?: string[];
}): TemplateValidationIssue[] {
  const issues: TemplateValidationIssue[] = [];
  const template = getEmailTemplate(input.templateKey);

  if (!template) {
    pushIssue(issues, "error", "unknown_template", "Template is not registered.");
    return issues;
  }

  if (!input.subject.trim()) {
    pushIssue(issues, "error", "missing_subject", "Subject line is required.");
  }

  if (!input.previewText.trim()) {
    pushIssue(issues, "error", "missing_preview_text", "Preview text is required.");
  }

  if (input.allSubjects) {
    const duplicates = input.allSubjects.filter(
      (subject) => subject.trim().toLowerCase() === input.subject.trim().toLowerCase(),
    );
    if (duplicates.length > 1) {
      pushIssue(issues, "warning", "duplicate_subject", "Another template uses the same subject.");
    }
  }

  for (const variable of template.requiredVariables) {
    if (input.templateKey === "EMAIL-001" && variable === "activationUrl") {
      if (!input.content.ctaHrefVariable || input.content.ctaHrefVariable !== "activationUrl") {
        pushIssue(
          issues,
          "error",
          "missing_button_target",
          "Primary button must reference the activationUrl variable.",
        );
      }
      continue;
    }
    pushIssue(
      issues,
      "error",
      "missing_variable",
      `Required variable ${variable} must be available at send time.`,
    );
  }

  if (!input.content.ctaLabel?.trim()) {
    pushIssue(issues, "warning", "missing_button", "Primary call-to-action label is empty.");
  }

  if (!input.brand.companyName.trim() || !input.brand.productName.trim()) {
    pushIssue(issues, "error", "missing_branding", "Company and product names are required.");
  }

  if (!input.brand.supportEmail.trim()) {
    pushIssue(issues, "warning", "missing_support_email", "Support email is not configured.");
  }

  if (!input.brand.primaryLogoUrl.trim()) {
    pushIssue(issues, "warning", "missing_logo", "Primary logo is not configured.");
  }

  for (const color of [
    input.brand.primaryColor,
    input.brand.secondaryColor,
    input.brand.accentColor,
    input.brand.buttonPrimaryBg,
    input.brand.buttonPrimaryText,
  ]) {
    if (!HEX_COLOR.test(color)) {
      pushIssue(issues, "error", "invalid_color", `Invalid brand color: ${color}`);
    }
  }

  if (input.brand.websiteUrl && !isValidUrl(input.brand.websiteUrl)) {
    pushIssue(issues, "warning", "broken_link", "Website URL appears invalid.");
  }

  for (const link of input.brand.socialLinks) {
    if (!isValidUrl(link.url)) {
      pushIssue(issues, "warning", "broken_link", `Social link for ${link.platform} appears invalid.`);
    }
  }

  if (!input.brand.footerTagline.trim() && !input.brand.copyrightText.trim()) {
    pushIssue(issues, "warning", "missing_footer", "Footer content is minimal.");
  }

  return issues;
}

export function canPublishTemplate(issues: TemplateValidationIssue[]): boolean {
  return !issues.some((issue) => issue.severity === "error");
}
