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

export type AccountActivationEmailProps = AccountActivationEmailData;

export function AccountActivationEmail({
  activationUrl,
  firstName,
  organizationName,
  assessmentName = `${BRAND.productName} Technology Maturity Assessment`,
  expirationDays = 7,
  supportEmail = BRAND.email,
}: AccountActivationEmailProps) {
  const greeting = firstName ? `Welcome to ${BRAND.productName}, ${firstName}` : `Welcome to ${BRAND.productName}`;
  const orgLine = organizationName
    ? `Thank you for purchasing your ${assessmentName} for ${organizationName}.`
    : `Thank you for purchasing your ${assessmentName}.`;

  return (
    <EmailLayout preview="Activate your account and begin discovering your organization's technology maturity.">
      <EmailHeader />
      <EmailHero
        title={greeting}
        description="You're one step away from a clear picture of your technology environment."
      />
      <ContentSection
        paragraphs={[
          orgLine,
          "You are about to gain a clear understanding of your technology environment, uncover hidden risks, and identify practical opportunities to strengthen your business through technology.",
          `${BRAND.productName} transforms technical information into clear, measurable insights so you can make technology decisions with confidence.`,
        ]}
      />
      <PrimaryButton href={activationUrl} label="Activate My Assessment" />
      <NextSteps
        steps={[
          "Activate your account",
          "Complete your guided assessment",
          "Review your technology health scores and recommendations",
          "Build a prioritized roadmap",
          "Meet with Bobkat IT to discuss next steps",
        ]}
      />
      <SecurityNotice
        items={[
          `The activation link expires in ${expirationDays} days`,
          "The link may only be used once",
          "If you did not request this message, you may safely ignore it",
        ]}
      />
      <ContentSection
        paragraphs={[
          `Questions? Contact us at ${supportEmail}. We're here to help you get started.`,
        ]}
      />
      <EmailFooter />
    </EmailLayout>
  );
}
