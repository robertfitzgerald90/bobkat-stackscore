import React from "react";
import { Hr, Link, Section, Text } from "@react-email/components";
import { DEFAULT_COMMUNICATION_BRAND, type CommunicationBrandConfig } from "@/lib/communications/brand-types";
import { emailTokens } from "@/emails/tokens";

function websiteHref(website: string): string {
  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }
  return `https://${website.replace(/^\/\//, "")}`;
}

export function Footer({ brand = DEFAULT_COMMUNICATION_BRAND }: { brand?: CommunicationBrandConfig }) {
  const siteUrl = websiteHref(brand.websiteUrl);
  const displayWebsite = brand.websiteUrl.replace(/^https?:\/\//, "");
  const tagline = brand.footerTagline?.trim();

  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        border: `1px solid ${emailTokens.border}`,
        borderTop: "none",
        borderRadius: `0 0 ${emailTokens.radius} ${emailTokens.radius}`,
        padding: "24px 24px 28px",
        textAlign: "center",
      }}
    >
      <Hr style={{ borderColor: emailTokens.rule, borderTop: `1px solid ${emailTokens.rule}`, margin: "0 0 20px" }} />
      <Text
        style={{
          margin: "0 0 6px",
          fontSize: "15px",
          fontWeight: 700,
          lineHeight: "22px",
          color: emailTokens.ink,
          letterSpacing: "-0.01em",
        }}
      >
        {brand.productName}
      </Text>
      <Text
        style={{
          margin: "0 0 16px",
          fontSize: "13px",
          lineHeight: "20px",
          color: emailTokens.inkSecondary,
        }}
      >
        Powered by {brand.companyName}
      </Text>
      {tagline ? (
        <Text
          style={{
            margin: "0 0 20px",
            fontSize: "12px",
            fontWeight: 600,
            lineHeight: "18px",
            letterSpacing: "0.06em",
            color: emailTokens.inkSecondary,
          }}
        >
          {tagline}
        </Text>
      ) : null}
      <Text style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: "20px" }}>
        <Link
          href={siteUrl}
          style={{ color: emailTokens.forest, textDecoration: "underline" }}
        >
          {displayWebsite}
        </Link>
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: "20px" }}>
        <Link
          href={`mailto:${brand.supportEmail}`}
          style={{ color: emailTokens.forest, textDecoration: "underline" }}
        >
          {brand.supportEmail}
        </Link>
      </Text>
      {brand.supportPhone ? (
        <Text
          style={{
            margin: "0 0 8px",
            fontSize: "13px",
            lineHeight: "20px",
            color: emailTokens.inkSecondary,
          }}
        >
          {brand.supportPhone}
        </Text>
      ) : null}
      <Text
        style={{
          margin: "18px 0 0",
          fontSize: "11px",
          lineHeight: "16px",
          color: emailTokens.inkSecondary,
        }}
      >
        {brand.copyrightText}
      </Text>
    </Section>
  );
}
