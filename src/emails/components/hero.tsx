import React from "react";
import { Heading, Section, Text } from "@react-email/components";
import { emailTokens } from "@/emails/tokens";

type HeroProps = {
  title: string;
  description: string;
};

export function Hero({ title, description }: HeroProps) {
  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        borderLeft: `1px solid ${emailTokens.border}`,
        borderRight: `1px solid ${emailTokens.border}`,
        padding: "8px 24px 20px",
        textAlign: "center",
      }}
    >
      <Heading
        as="h1"
        style={{
          margin: "0 0 12px",
          fontFamily: emailTokens.fontFamilyHeading,
          fontSize: "26px",
          fontWeight: 700,
          lineHeight: "32px",
          color: emailTokens.primary,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </Heading>
      <Text
        style={{
          margin: 0,
          fontSize: "16px",
          lineHeight: "26px",
          color: emailTokens.textMuted,
        }}
      >
        {description}
      </Text>
    </Section>
  );
}
