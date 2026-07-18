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
  const servicesLine =
    brand.componentSettings.footer?.servicesLine ??
    brand.footerTagline ??
    "Technology consulting for growing organizations";

  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        border: `1px solid ${emailTokens.border}`,
        borderTop: "none",
        borderRadius: `0 0 ${emailTokens.radius} ${emailTokens.radius}`,
        boxShadow: emailTokens.shadow,
        padding: "24px 24px 28px",
        textAlign: "center",
      }}
    >
      <Hr style={{ borderColor: emailTokens.border, margin: "0 0 20px" }} />
      <Text
        style={{
          margin: "0 0 6px",
          fontSize: "15px",
          fontWeight: 700,
          lineHeight: "22px",
          color: brand.primaryColor,
          letterSpacing: "-0.01em",
        }}
      >
        {brand.productName}
      </Text>
      <Text
        style={{
          margin: "0 0 14px",
          fontSize: "13px",
          lineHeight: "20px",
          color: emailTokens.textMuted,
        }}
      >
        Powered by {brand.companyName}
      </Text>
      <Text
        style={{
          margin: "0 0 16px",
          fontSize: "12px",
          lineHeight: "18px",
          color: emailTokens.textMuted,
        }}
      >
        {servicesLine}
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: "20px" }}>
        <Link
          href={siteUrl}
          style={{ color: brand.primaryColor, textDecoration: "underline" }}
        >
          {displayWebsite}
        </Link>
      </Text>
      <Text style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: "20px" }}>
        <Link
          href={`mailto:${brand.supportEmail}`}
          style={{ color: brand.primaryColor, textDecoration: "underline" }}
        >
          {brand.supportEmail}
        </Link>
      </Text>
      {brand.supportPhone ? (
        <Text style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: "20px", color: emailTokens.textMuted }}>
          {brand.supportPhone}
        </Text>
      ) : null}
      <Text
        style={{
          margin: "18px 0 0",
          fontSize: "11px",
          lineHeight: "16px",
          color: emailTokens.textMuted,
        }}
      >
        {brand.copyrightText}
      </Text>
    </Section>
  );
}
