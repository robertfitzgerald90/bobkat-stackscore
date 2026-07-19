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
  SecondaryButton,
} from "@/emails/components";
import { emailTokens } from "@/emails/tokens";
import {
  ASSESSMENT_BOOKING_LABELS,
  getTechnologyMaturityAssessmentBookingUrl,
} from "@/lib/communications/booking-urls";
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
  assessmentBookingUrl?: string;
};

export type AssessmentInvitationEmailProps = AssessmentInvitationEmailData & {
  brand?: CommunicationBrandConfig;
  content?: TemplateVersionContent | null;
};

const DEFAULT_DELIVERABLES = [
  "Overall Technology Health Score",
  "Category-by-Category Maturity Analysis",
  "Executive-Ready Reporting",
  "Technology Risk Identification",
  "Prioritized Improvement Recommendations",
  "Living Execution Plan Guidance",
];

const DEFAULT_FAQ = [
  {
    question: "Do I need technical expertise?",
    answer:
      "No. The assessment is designed for business and technology leaders alike—clear questions, practical language, and actionable results.",
  },
  {
    question: "How long does it take?",
    answer: "Most organizations complete the assessment in 15–30 minutes.",
  },
  {
    question: "Can I save progress and return later?",
    answer: "Yes. Your work is saved automatically once your account is activated.",
  },
  {
    question: "What happens after I finish?",
    answer: `${BRAND.companyName} can review your results with you and help translate findings into a practical improvement plan.`,
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
        padding: "0 24px 24px",
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
        <Section key={item.question} style={{ marginBottom: "14px" }}>
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
  assessmentBookingUrl,
  brand = DEFAULT_COMMUNICATION_BRAND,
  content,
}: AssessmentInvitationEmailProps) {
  const bookingUrl = assessmentBookingUrl ?? getTechnologyMaturityAssessmentBookingUrl();
  const greeting =
    content?.heroTitle ??
    (firstName
      ? `${firstName}, you're invited`
      : "You're invited to assess your technology maturity");

  const introParagraphs =
    content?.contentParagraphs && content.contentParagraphs.length > 0
      ? content.contentParagraphs.map((paragraph) =>
          interpolateCopy(
            paragraph,
            { invitationUrl, firstName, organizationName, supportEmail, assessmentBookingUrl: bookingUrl },
            brand,
          ),
        )
      : [
          organizationName
            ? `${organizationName} has been invited to complete a ${brand.productName} Technology Maturity Assessment.`
            : `You've been invited to complete a ${brand.productName} Technology Maturity Assessment.`,
          `${brand.productName} gives leadership a clear view of technology strengths, risks, and priorities—without unnecessary complexity.`,
          "Activate your account to begin. You'll receive structured guidance, measurable scores, and recommendations you can act on.",
        ];

  const deliverables = content?.nextSteps ?? DEFAULT_DELIVERABLES;

  const previewText =
    content?.previewText ??
    "Discover your organization's technology maturity and uncover practical next steps.";

  const closingParagraph =
    content?.closingParagraph ??
    `Questions about your invitation? Contact us at ${supportEmail ?? brand.supportEmail}. We're ready to help you get started.`;

  return (
    <EmailLayout preview={previewText}>
      <EmailHeader brand={brand} />
      <EmailHero
        title={greeting}
        description={
          content?.heroDescription ??
          "A professional assessment designed to give your leadership team clarity and confidence."
        }
      />
      <ContentSection paragraphs={introParagraphs} />
      <PrimaryButton
        href={invitationUrl}
        label={content?.ctaLabel ?? ASSESSMENT_BOOKING_LABELS.invitation}
        brand={brand}
      />
      <InformationCard title="What You'll Receive" items={deliverables} />
      <Section
        style={{
          backgroundColor: emailTokens.surface,
          borderLeft: `1px solid ${emailTokens.border}`,
          borderRight: `1px solid ${emailTokens.border}`,
          padding: "0 24px 24px",
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
          Progress is saved automatically after activation.
        </Text>
      </Section>
      <FaqSection items={DEFAULT_FAQ} />
      <Section
        style={{
          backgroundColor: emailTokens.surface,
          borderLeft: `1px solid ${emailTokens.border}`,
          borderRight: `1px solid ${emailTokens.border}`,
          padding: "0 24px 24px",
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
          Why It Matters
        </Heading>
        <Text style={{ margin: 0, fontSize: "15px", lineHeight: "24px", color: emailTokens.text }}>
          A Technology Maturity Assessment helps leadership prioritize investments, reduce operational
          risk, and align technology decisions with business goals—before small gaps become costly
          disruptions.
        </Text>
      </Section>
      <Hr style={{ borderColor: emailTokens.border, margin: "0 24px" }} />
      <ContentSection
        paragraphs={[
          `Prefer to review the full assessment offer first? You can explore what's included and how ${brand.companyName} supports your team.`,
        ]}
      />
      <SecondaryButton
        href={bookingUrl}
        label={ASSESSMENT_BOOKING_LABELS.offer}
        brand={brand}
      />
      <ContentSection
        paragraphs={[
          interpolateCopy(
            closingParagraph,
            { invitationUrl, firstName, organizationName, supportEmail, assessmentBookingUrl: bookingUrl },
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
    assessmentBookingUrl: getTechnologyMaturityAssessmentBookingUrl(),
  };
}
