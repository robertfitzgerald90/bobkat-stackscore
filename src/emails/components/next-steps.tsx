import React from "react";
import { Heading, Section, Text } from "@react-email/components";
import { emailTokens } from "@/emails/tokens";

type NextStepsProps = {
  title?: string;
  steps: string[];
};

export function NextSteps({ title = "Next Steps", steps }: NextStepsProps) {
  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        borderLeft: `1px solid ${emailTokens.border}`,
        borderRight: `1px solid ${emailTokens.border}`,
        padding: "0 32px 24px",
      }}
    >
      <Section
        style={{
          backgroundColor: emailTokens.surfaceMuted,
          border: `1px solid ${emailTokens.border}`,
          borderRadius: emailTokens.radius,
          padding: "20px 24px",
        }}
      >
        <Heading
          as="h2"
          style={{
            margin: "0 0 12px",
            fontFamily: emailTokens.fontFamilyHeading,
            fontSize: "16px",
            fontWeight: 700,
            lineHeight: "24px",
            color: emailTokens.primary,
          }}
        >
          {title}
        </Heading>
        {steps.map((step, index) => (
          <Text
            key={step}
            style={{
              margin: "0 0 10px",
              fontSize: "15px",
              lineHeight: "24px",
              color: emailTokens.text,
            }}
          >
            <span style={{ fontWeight: 600, color: emailTokens.primary }}>{index + 1}. </span>
            {step}
          </Text>
        ))}
      </Section>
    </Section>
  );
}
