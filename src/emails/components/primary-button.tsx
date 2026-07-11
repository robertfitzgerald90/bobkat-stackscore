import React from "react";
import { Button, Section } from "@react-email/components";
import { emailTokens } from "@/emails/tokens";

type PrimaryButtonProps = {
  href: string;
  label: string;
};

/** Centered bulletproof CTA for Gmail, Outlook, and Apple Mail. */
export function PrimaryButton({ href, label }: PrimaryButtonProps) {
  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        borderLeft: `1px solid ${emailTokens.border}`,
        borderRight: `1px solid ${emailTokens.border}`,
        padding: "8px 32px 28px",
        textAlign: "center",
      }}
    >
      <Button
        href={href}
        style={{
          backgroundColor: emailTokens.primary,
          borderRadius: "10px",
          color: emailTokens.textInverse,
          display: "inline-block",
          fontFamily: emailTokens.fontFamily,
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: "100%",
          padding: "14px 28px",
          textAlign: "center",
          textDecoration: "none",
        }}
      >
        {label}
      </Button>
    </Section>
  );
}
