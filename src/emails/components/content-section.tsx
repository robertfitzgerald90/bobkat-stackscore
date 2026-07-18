import React from "react";
import { Section, Text } from "@react-email/components";
import { emailTokens } from "@/emails/tokens";

type ContentSectionProps = {
  paragraphs: string[];
};

export function ContentSection({ paragraphs }: ContentSectionProps) {
  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        borderLeft: `1px solid ${emailTokens.border}`,
        borderRight: `1px solid ${emailTokens.border}`,
        padding: "0 24px 20px",
      }}
    >
      {paragraphs.map((paragraph) => (
        <Text
          key={paragraph}
          style={{
            margin: "0 0 16px",
            fontSize: "16px",
            lineHeight: "26px",
            color: emailTokens.text,
          }}
        >
          {paragraph}
        </Text>
      ))}
    </Section>
  );
}
