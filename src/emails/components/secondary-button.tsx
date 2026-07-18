import React from "react";
import { Button, Section } from "@react-email/components";
import { DEFAULT_COMMUNICATION_BRAND, type CommunicationBrandConfig } from "@/lib/communications/brand-types";
import { emailTokens } from "@/emails/tokens";

type SecondaryButtonProps = {
  href: string;
  label: string;
  brand?: CommunicationBrandConfig;
};

/** Outlined secondary CTA — email-client safe table button. */
export function SecondaryButton({
  href,
  label,
  brand = DEFAULT_COMMUNICATION_BRAND,
}: SecondaryButtonProps) {
  const borderRadius = brand.componentSettings.secondaryButton?.borderRadius ?? "10px";

  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        borderLeft: `1px solid ${emailTokens.border}`,
        borderRight: `1px solid ${emailTokens.border}`,
        padding: "0 24px 24px",
        textAlign: "center",
      }}
    >
      <Button
        href={href}
        style={{
          backgroundColor: brand.buttonSecondaryBg,
          border: `1px solid ${emailTokens.border}`,
          borderRadius,
          color: brand.buttonSecondaryText,
          display: "inline-block",
          fontFamily: brand.fontFamilyBody,
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: "100%",
          padding: "12px 24px",
          textAlign: "center",
          textDecoration: "none",
        }}
      >
        {label}
      </Button>
    </Section>
  );
}
