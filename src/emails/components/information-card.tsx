import React from "react";
import { Heading, Section, Text } from "@react-email/components";
import { emailTokens } from "@/emails/tokens";

type InformationCardProps = {
  title: string;
  items: string[];
};

export function InformationCard({ title, items }: InformationCardProps) {
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
        {items.map((item) => (
          <Text
            key={item}
            style={{
              margin: "0 0 10px",
              paddingLeft: "16px",
              fontSize: "15px",
              lineHeight: "24px",
              color: emailTokens.text,
            }}
          >
            <span style={{ marginLeft: "-16px", color: emailTokens.secondary }}>• </span>
            {item}
          </Text>
        ))}
      </Section>
    </Section>
  );
}
