import React from "react";
import { Heading, Hr, Section, Text } from "@react-email/components";
import {
  ContentSection,
  EmailFooter,
  EmailHeader,
  EmailHero,
  EmailLayout,
  InformationCard,
  PrimaryButton,
} from "@/emails/components";
import { emailTokens } from "@/emails/tokens";
import { DEFAULT_COMMUNICATION_BRAND } from "@/lib/communications/brand-types";
import type { CommunicationBrandConfig } from "@/lib/communications/brand-types";
import type { TemplateVersionContent } from "@/lib/communications/template-content";
import { BRAND } from "@/lib/branding";

export type AssessmentInvitationEmailData = {
  invitationUrl: string;
  firstName?: string;
  organizationName?: string;
  assessmentName?: string;
  supportEmail?: string;
  websiteUrl?: string;
};

export type AssessmentInvitationEmailProps = AssessmentInvitationEmailData & {
  brand?: CommunicationBrandConfig;
  content?: TemplateVersionContent | null;
};

const DEFAULT_DELIVERABLES = [
  "Overall Technology Health Score",
  "Category-by-Category Maturity Scores",
  "Executive-Friendly Reporting",
  "Technology Risk Identification",
  "Prioritized Improvement Recommendations",
  "Technology Roadmap",
  "Business-Focused Insights",
];

const DEFAULT_FAQ = [
  {
    question: "Do I need technical knowledge?",
    answer:
      "No. The assessment is written to be understandable by both technical and business stakeholders.",
  },
  {
    question: "How long does it take?",
    answer: "Most organizations complete the assessment in approximately 15–30 minutes.",
  },
  {
    question: "Can I return later?",
    answer: "Yes. Your progress will be saved automatically after activation.",
  },
  {
    question: "Will someone review my results?",
    answer: `Yes. If your assessment includes a consultation, ${BRAND.companyName} will schedule a review session to discuss your results and answer any questions.`,
  },
];

function interpolateCopy(
  value: string,
  data: AssessmentInvitationEmailData,
  brand: CommunicationBrandConfig,
): string {
  return value
    .replace(/\{\{firstName\}\}/g, data.firstName ?? "there")
    .replace(/\{\{organizationName\}\}/g, data.organizationName ?? "your organization")
    .replace(/\{\{supportEmail\}\}/g, data.supportEmail ?? brand.supportEmail)
    .replace(/\{\{companyName\}\}/g, brand.companyName);
}

function FaqSection({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        borderLeft: `1px solid ${emailTokens.border}`,
        borderRight: `1px solid ${emailTokens.border}`,
        padding: "0 32px 24px",
      }}
    >
      <Heading
        as="h2"
        style={{
          margin: "0 0 16px",
          fontFamily: emailTokens.fontFamilyHeading,
          fontSize: "18px",
          fontWeight: 700,
          lineHeight: "26px",
          color: emailTokens.primary,
        }}
      >
        Frequently Asked Questions
      </Heading>
      {items.map((item) => (
        <Section key={item.question} style={{ marginBottom: "16px" }}>
          <Text
            style={{
              margin: "0 0 4px",
              fontSize: "15px",
              fontWeight: 700,
              lineHeight: "22px",
              color: emailTokens.primary,
            }}
          >
            {item.question}
          </Text>
          <Text
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: "24px",
              color: emailTokens.text,
            }}
          >
            {item.answer}
          </Text>
        </Section>
      ))}
    </Section>
  );
}

export function AssessmentInvitationEmail({
  invitationUrl,
  firstName,
  organizationName,
  assessmentName: _assessmentName,
  supportEmail,
  brand = DEFAULT_COMMUNICATION_BRAND,
  content,
}: AssessmentInvitationEmailProps) {
  const greeting =
    content?.heroTitle ??
    (firstName
      ? `You're Invited, ${firstName}`
      : "You're Invited to Discover Your Technology Maturity");

  const introParagraphs =
    content?.contentParagraphs && content.contentParagraphs.length > 0
      ? content.contentParagraphs.map((paragraph) =>
          interpolateCopy(
            paragraph,
            { invitationUrl, firstName, organizationName, supportEmail },
            brand,
          ),
        )
      : [
          organizationName
            ? `${organizationName} has been invited to complete a ${brand.productName} Technology Maturity Assessment.`
            : `You've been invited to complete a ${brand.productName} Technology Maturity Assessment.`,
          `${brand.productName} helps organizations understand the strengths, weaknesses, and opportunities within their technology environment by transforming technical information into clear business insights.`,
          "Whether you're evaluating your current infrastructure, planning future investments, or simply looking for a clearer picture of your technology, this assessment provides a structured starting point.",
        ];

  const deliverables = content?.nextSteps ?? DEFAULT_DELIVERABLES;

  const previewText =
    content?.previewText ??
    "Discover your organization's technology maturity and uncover opportunities for improvement.";

  const closingParagraph =
    content?.closingParagraph ??
    `Questions about your invitation? Contact us at ${supportEmail ?? brand.supportEmail}. We look forward to helping you get started.`;

  return (
    <EmailLayout preview={previewText}>
      <EmailHeader brand={brand} />
      <EmailHero
        title={greeting}
        description={
          content?.heroDescription ??
          "A professional technology assessment designed to give your leadership team clarity and confidence."
        }
      />
      <ContentSection paragraphs={introParagraphs} />
      <PrimaryButton
        href={invitationUrl}
        label={content?.ctaLabel ?? "Activate Account & Begin Assessment"}
        brand={brand}
      />
      <InformationCard title="What You'll Receive" items={deliverables} />
      <Section
        style={{
          backgroundColor: emailTokens.surface,
          borderLeft: `1px solid ${emailTokens.border}`,
          borderRight: `1px solid ${emailTokens.border}`,
          padding: "0 32px 24px",
        }}
      >
        <Heading
          as="h2"
          style={{
            margin: "0 0 12px",
            fontFamily: emailTokens.fontFamilyHeading,
            fontSize: "18px",
            fontWeight: 700,
            lineHeight: "26px",
            color: emailTokens.primary,
          }}
        >
          Assessment Details
        </Heading>
        <Text style={{ margin: "0 0 8px", fontSize: "15px", lineHeight: "24px", color: emailTokens.text }}>
          <strong>Estimated time:</strong> 15–30 minutes
        </Text>
        <Text style={{ margin: "0 0 8px", fontSize: "15px", lineHeight: "24px", color: emailTokens.text }}>
          No software installation required.
        </Text>
        <Text style={{ margin: "0 0 8px", fontSize: "15px", lineHeight: "24px", color: emailTokens.text }}>
          Complete from any modern web browser.
        </Text>
        <Text style={{ margin: 0, fontSize: "15px", lineHeight: "24px", color: emailTokens.text }}>
          Responses can be saved and completed later.
        </Text>
      </Section>
      <FaqSection items={DEFAULT_FAQ} />
      <Section
        style={{
          backgroundColor: emailTokens.surface,
          borderLeft: `1px solid ${emailTokens.border}`,
          borderRight: `1px solid ${emailTokens.border}`,
          padding: "0 32px 24px",
        }}
      >
        <Heading
          as="h2"
          style={{
            margin: "0 0 12px",
            fontFamily: emailTokens.fontFamilyHeading,
            fontSize: "18px",
            fontWeight: 700,
            lineHeight: "26px",
            color: emailTokens.primary,
          }}
        >
          Business Value
        </Heading>
        <Text style={{ margin: 0, fontSize: "15px", lineHeight: "24px", color: emailTokens.text }}>
          Completing a Technology Maturity Assessment provides your organization with greater visibility
          into its technology environment, helping leadership prioritize investments, reduce operational
          risk, and make informed technology decisions.
        </Text>
      </Section>
      <Hr style={{ borderColor: emailTokens.border, margin: "0 32px" }} />
      <Section
        style={{
          backgroundColor: emailTokens.surface,
          borderLeft: `1px solid ${emailTokens.border}`,
          borderRight: `1px solid ${emailTokens.border}`,
          padding: "0 32px 24px",
        }}
      >
        <Heading
          as="h3"
          style={{
            margin: "0 0 8px",
            fontFamily: emailTokens.fontFamilyHeading,
            fontSize: "16px",
            fontWeight: 700,
            color: emailTokens.primary,
          }}
        >
          Book a Meeting
        </Heading>
        <Text style={{ margin: 0, fontSize: "15px", lineHeight: "24px", color: emailTokens.text }}>
          After completing your assessment, {brand.companyName} can walk you through your results,
          discuss your Technology Blueprint and Roadmap, and explore next steps tailored to your
          organization.
        </Text>
      </Section>
      <ContentSection
        paragraphs={[
          interpolateCopy(
            closingParagraph,
            { invitationUrl, firstName, organizationName, supportEmail },
            brand,
          ),
        ]}
      />
      <EmailFooter brand={brand} />
    </EmailLayout>
  );
}

export function buildAssessmentInvitationDefaults() {
  return {
    assessmentName: `${BRAND.productName} Technology Maturity Assessment`,
  };
}
