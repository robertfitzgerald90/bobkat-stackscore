import React from "react";
import {
  EmailLayout,
  Footer,
  Header,
  Hero,
  InformationCard,
  PrimaryButton,
  SecurityNotice,
} from "@/emails/components";
import { BRAND } from "@/lib/branding";

export type AccountActivationEmailProps = {
  activationUrl: string;
};

export function AccountActivationEmail({ activationUrl }: AccountActivationEmailProps) {
  return (
    <EmailLayout
      preview={`Welcome to ${BRAND.productName}. Activate your account to begin your ${BRAND.reportTitle}.`}
    >
      <Header />
      <Hero
        title={`Welcome to ${BRAND.productName}`}
        description={`Thank you for purchasing the ${BRAND.reportTitle}. Activate your account to begin evaluating your technology environment and building a clear improvement plan.`}
      />
      <PrimaryButton href={activationUrl} label="Activate My Account" />
      <InformationCard
        title="Assessment Overview"
        items={[
          "Evaluate technology maturity across eight business-focused pillars.",
          "Identify risks, gaps, and priorities in your current environment.",
          "Receive actionable recommendations aligned to your business goals.",
          "Build a realistic roadmap for improvement with Bobkat IT guidance.",
        ]}
      />
      <InformationCard
        title="Next Steps"
        items={[
          "Click Activate My Account to secure your login.",
          "Set your password and complete your profile.",
          "Begin your Technology Maturity Assessment at your own pace.",
          "Review results and recommendations with the StackScore team.",
        ]}
      />
      <SecurityNotice message="This activation link expires in 7 days and can only be used once. If you did not purchase this assessment, you can safely ignore this email." />
      <Footer />
    </EmailLayout>
  );
}
