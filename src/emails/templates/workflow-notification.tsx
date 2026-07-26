import React from "react";
import {
  ContentSection,
  EmailClosingSignature,
  EmailFooter,
  EmailHeader,
  EmailHero,
  EmailLayout,
  InformationCard,
  PrimaryButton,
  SecondaryButton,
  SecurityNotice,
} from "@/emails/components";
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
  /** Renders the standard Bobkat founder closing signature with reliable line breaks. */
  founderClosing?: boolean | { message?: string };
  securityNotice?: string | string[];
  firstName?: string;
};

export type WorkflowNotificationEmailProps = WorkflowNotificationEmailData & {
  brand?: CommunicationBrandConfig;
  content?: TemplateVersionContent | null;
};

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
  founderClosing,
  securityNotice,
  brand = DEFAULT_COMMUNICATION_BRAND,
  content,
}: WorkflowNotificationEmailProps) {
  const securityItems = Array.isArray(securityNotice)
    ? securityNotice
    : securityNotice
      ? [securityNotice]
      : [];

  const founderClosingMessage =
    typeof founderClosing === "object" ? founderClosing.message : undefined;

  return (
    <EmailLayout preview={previewText ?? heroDescription ?? heroTitle}>
      <EmailHeader brand={brand} />
      <EmailHero
        title={content?.heroTitle ?? heroTitle}
        description={content?.heroDescription ?? heroDescription ?? ""}
      />
      {paragraphs.length > 0 ? <ContentSection paragraphs={paragraphs} /> : null}
      <PrimaryButton href={primaryCta.href} label={content?.ctaLabel ?? primaryCta.label} brand={brand} />
      {secondaryCta ? (
        <SecondaryButton href={secondaryCta.href} label={secondaryCta.label} brand={brand} />
      ) : null}
      {summaryItems.length > 0 ? (
        <InformationCard title={summaryTitle ?? "Summary"} items={summaryItems} />
      ) : null}
      {securityItems.length > 0 ? <SecurityNotice items={securityItems} /> : null}
      {founderClosing ? (
        <EmailClosingSignature closingMessage={founderClosingMessage} />
      ) : closingParagraph ? (
        <ContentSection paragraphs={[closingParagraph]} />
      ) : null}
      <EmailFooter brand={brand} />
    </EmailLayout>
  );
}
