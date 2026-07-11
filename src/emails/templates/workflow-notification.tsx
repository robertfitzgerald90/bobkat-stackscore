import React from "react";
import { Section } from "@react-email/components";
import {
  ContentSection,
  EmailFooter,
  EmailHeader,
  EmailHero,
  EmailLayout,
  InformationCard,
  PrimaryButton,
  SecurityNotice,
} from "@/emails/components";
import { emailTokens } from "@/emails/tokens";
import { DEFAULT_COMMUNICATION_BRAND } from "@/lib/communications/brand-types";
import type { CommunicationBrandConfig } from "@/lib/communications/brand-types";
import type { TemplateVersionContent } from "@/lib/communications/template-content";

export type WorkflowEmailCta = {
  label: string;
  href: string;
};

export type WorkflowNotificationEmailData = {
  heroTitle: string;
  heroDescription?: string;
  previewText?: string;
  paragraphs?: string[];
  summaryTitle?: string;
  summaryItems?: string[];
  primaryCta: WorkflowEmailCta;
  secondaryCta?: WorkflowEmailCta;
  closingParagraph?: string;
  securityNotice?: string;
  firstName?: string;
};

export type WorkflowNotificationEmailProps = WorkflowNotificationEmailData & {
  brand?: CommunicationBrandConfig;
  content?: TemplateVersionContent | null;
};

function SecondaryButton({ href, label }: WorkflowEmailCta) {
  return (
    <Section style={{ textAlign: "center" as const, marginTop: "12px" }}>
      <a
        href={href}
        style={{
          color: emailTokens.primary,
          fontSize: "15px",
          fontWeight: 600,
          textDecoration: "underline",
        }}
      >
        {label}
      </a>
    </Section>
  );
}

export function WorkflowNotificationEmail({
  heroTitle,
  heroDescription,
  previewText,
  paragraphs = [],
  summaryTitle,
  summaryItems = [],
  primaryCta,
  secondaryCta,
  closingParagraph,
  securityNotice,
  brand = DEFAULT_COMMUNICATION_BRAND,
  content,
}: WorkflowNotificationEmailProps) {
  return (
    <EmailLayout preview={previewText ?? heroDescription ?? heroTitle}>
      <EmailHeader brand={brand} />
      <EmailHero
        title={content?.heroTitle ?? heroTitle}
        description={content?.heroDescription ?? heroDescription ?? ""}
      />
      {paragraphs.length > 0 ? <ContentSection paragraphs={paragraphs} /> : null}
      <PrimaryButton href={primaryCta.href} label={content?.ctaLabel ?? primaryCta.label} brand={brand} />
      {secondaryCta ? <SecondaryButton {...secondaryCta} /> : null}
      {summaryItems.length > 0 ? (
        <InformationCard title={summaryTitle ?? "Summary"} items={summaryItems} />
      ) : null}
      {securityNotice ? <SecurityNotice message={securityNotice} /> : null}
      {closingParagraph ? <ContentSection paragraphs={[closingParagraph]} /> : null}
      <EmailFooter brand={brand} />
    </EmailLayout>
  );
}
