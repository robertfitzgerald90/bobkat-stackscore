import React from "react";
import { Heading, Section, Text } from "@react-email/components";
import { emailTokens } from "@/emails/tokens";

type SecurityNoticeProps = {
  title?: string;
  message?: string;
  items?: string[];
};

export function SecurityNotice({
  title = "Security Notice",
  message,
  items,
}: SecurityNoticeProps) {
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
          backgroundColor: emailTokens.warningBackground,
          border: `1px solid ${emailTokens.warningBorder}`,
          borderRadius: emailTokens.radius,
          padding: "16px 20px",
        }}
      >
        <Heading
          as="h3"
          style={{
            margin: "0 0 8px",
            fontFamily: emailTokens.fontFamilyHeading,
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: "20px",
            color: emailTokens.warningText,
          }}
        >
          {title}
        </Heading>
        {message ? (
          <Text
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: "22px",
              color: emailTokens.warningText,
            }}
          >
            {message}
          </Text>
        ) : null}
        {items?.map((item) => (
          <Text
            key={item}
            style={{
              margin: "0 0 6px",
              fontSize: "14px",
              lineHeight: "22px",
              color: emailTokens.warningText,
            }}
          >
            • {item}
          </Text>
        ))}
      </Section>
    </Section>
  );
}
