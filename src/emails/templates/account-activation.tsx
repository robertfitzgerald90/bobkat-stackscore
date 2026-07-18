import React from "react";
import {
  ContentSection,
  EmailFooter,
  EmailHeader,
  EmailHero,
  EmailLayout,
  NextSteps,
  PrimaryButton,
  SecurityNotice,
} from "@/emails/components";
import { DEFAULT_COMMUNICATION_BRAND } from "@/lib/communications/brand-types";
import type { CommunicationBrandConfig } from "@/lib/communications/brand-types";
import type { TemplateVersionContent } from "@/lib/communications/template-content";
import { BRAND } from "@/lib/branding";

export type AccountActivationEmailData = {
  activationUrl: string;
  firstName?: string;
  organizationName?: string;
  assessmentName?: string;
  expirationDays?: number;
  supportEmail?: string;
  websiteUrl?: string;
};

export type AccountActivationEmailProps = AccountActivationEmailData & {
  brand?: CommunicationBrandConfig;
  content?: TemplateVersionContent | null;
};

function interpolateCopy(
  value: string,
  data: AccountActivationEmailData,
  brand: CommunicationBrandConfig,
): string {
  return value
    .replace(/\{\{expirationDays\}\}/g, String(data.expirationDays ?? 7))
    .replace(/\{\{supportEmail\}\}/g, data.supportEmail ?? brand.supportEmail)
    .replace(/\{\{organizationName\}\}/g, data.organizationName ?? "your organization")
    .replace(/\{\{firstName\}\}/g, data.firstName ?? "there");
}

export function AccountActivationEmail({
  activationUrl,
  firstName,
  organizationName,
  assessmentName,
  expirationDays = 7,
  supportEmail,
  brand = DEFAULT_COMMUNICATION_BRAND,
  content,
}: AccountActivationEmailProps) {
  const resolvedAssessmentName =
    assessmentName ?? `${brand.productName} Technology Maturity Assessment`;
  const greeting =
    content?.heroTitle ??
    (firstName ? `Welcome to ${brand.productName}, ${firstName}` : `Welcome to ${brand.productName}`);

  const defaultOrgLine = organizationName
    ? `Thank you for purchasing your ${resolvedAssessmentName} for ${organizationName}.`
    : `Thank you for purchasing your ${resolvedAssessmentName}.`;

  const paragraphs =
    content?.contentParagraphs && content.contentParagraphs.length > 0
      ? content.contentParagraphs.map((paragraph, index) => {
          if (index === 0 && paragraph.includes("Thank you for purchasing")) {
            return defaultOrgLine;
          }
          return interpolateCopy(paragraph, { activationUrl, firstName, organizationName, expirationDays, supportEmail }, brand);
        })
      : [
          defaultOrgLine,
          "You're about to gain a clear, executive-ready view of your technology environment—strengths, risks, and practical next steps.",
          `${brand.productName} translates technical detail into decisions your leadership team can act on with confidence.`,
        ];

  const nextSteps = content?.nextSteps ?? [
    "Activate your account",
    "Complete your guided assessment",
    "Review your technology health scores and recommendations",
    "Build a prioritized roadmap",
    `Meet with ${brand.companyName} to discuss next steps`,
  ];

  const securityItems = (content?.securityItems ?? [
    `The activation link expires in ${expirationDays} days`,
    "The link may only be used once",
    "If you did not request this message, you may safely ignore it",
  ]).map((item) =>
    interpolateCopy(item, { activationUrl, firstName, organizationName, expirationDays, supportEmail }, brand),
  );

  const closingParagraph =
    content?.closingParagraph ??
    `Questions? Contact us at ${supportEmail ?? brand.supportEmail}. We're here to help you get started.`;

  const previewText =
    content?.previewText ??
    "Activate your account and begin discovering your organization's technology maturity.";

  return (
    <EmailLayout preview={previewText}>
      <EmailHeader brand={brand} />
      <EmailHero
        title={greeting}
        description={
          content?.heroDescription ??
          "You're one step away from a clear picture of your technology environment."
        }
      />
      <ContentSection paragraphs={paragraphs} />
      <PrimaryButton
        href={activationUrl}
        label={content?.ctaLabel ?? "Activate My Assessment"}
        brand={brand}
      />
      <NextSteps steps={nextSteps} />
      <SecurityNotice items={securityItems} />
      <ContentSection
        paragraphs={[interpolateCopy(closingParagraph, { activationUrl, firstName, organizationName, expirationDays, supportEmail }, brand)]}
      />
      <EmailFooter brand={brand} />
    </EmailLayout>
  );
}

export function buildAccountActivationDefaults() {
  return {
    assessmentName: `${BRAND.productName} Technology Maturity Assessment`,
  };
}
