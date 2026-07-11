import React from "react";
import { Hr, Link, Section, Text } from "@react-email/components";
import { emailTokens } from "@/emails/tokens";
import { BRAND } from "@/lib/branding";

function websiteHref(): string {
  const website = BRAND.website.trim();
  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }
  return `https://${website.replace(/^\/\//, "")}`;
}

export function Footer() {
  const siteUrl = websiteHref();

  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        border: `1px solid ${emailTokens.border}`,
        borderTop: "none",
        borderRadius: `0 0 ${emailTokens.radius} ${emailTokens.radius}`,
        boxShadow: emailTokens.shadow,
        padding: "24px 32px 32px",
        textAlign: "center",
      }}
    >
      <Hr style={{ borderColor: emailTokens.border, margin: "0 0 20px" }} />
      <Text
        style={{
          margin: "0 0 8px",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
          color: emailTokens.primary,
        }}
      >
        The {BRAND.productName} Team
      </Text>
      <Text
        style={{
          margin: "0 0 12px",
          fontSize: "13px",
          lineHeight: "20px",
          color: emailTokens.textMuted,
        }}
      >
        Powered by {BRAND.companyName}
      </Text>
      <Text
        style={{
          margin: "0 0 16px",
          fontSize: "12px",
          lineHeight: "18px",
          color: emailTokens.textMuted,
        }}
      >
        Technology Consulting · Managed Services · Technology Strategy
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: "20px" }}>
        <Link
          href={siteUrl}
          style={{ color: emailTokens.primary, textDecoration: "underline" }}
        >
          {BRAND.website.replace(/^https?:\/\//, "")}
        </Link>
      </Text>
      <Text style={{ margin: 0, fontSize: "13px", lineHeight: "20px" }}>
        <Link
          href={`mailto:${BRAND.email}`}
          style={{ color: emailTokens.primary, textDecoration: "underline" }}
        >
          {BRAND.email}
        </Link>
      </Text>
      <Text
        style={{
          margin: "20px 0 0",
          fontSize: "11px",
          lineHeight: "16px",
          color: emailTokens.textMuted,
        }}
      >
        © {new Date().getFullYear()} {BRAND.companyName}. All rights reserved.
      </Text>
    </Section>
  );
}
