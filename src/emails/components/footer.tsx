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
  const teamLabel =
    brand.componentSettings.footer?.teamLabel ?? `The ${brand.productName} Team`;
  const servicesLine =
    brand.componentSettings.footer?.servicesLine ?? brand.footerTagline;
  const showSocial =
    brand.componentSettings.socialLinks?.enabled !== false && brand.socialLinks.length > 0;

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
          color: brand.primaryColor,
        }}
      >
        {teamLabel}
      </Text>
      <Text
        style={{
          margin: "0 0 12px",
          fontSize: "13px",
          lineHeight: "20px",
          color: emailTokens.textMuted,
        }}
      >
        Powered by {brand.companyName}
      </Text>
      {servicesLine ? (
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
      ) : null}
      {brand.address ? (
        <Text
          style={{
            margin: "0 0 12px",
            fontSize: "12px",
            lineHeight: "18px",
            color: emailTokens.textMuted,
          }}
        >
          {brand.address}
        </Text>
      ) : null}
      <Text style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: "20px" }}>
        <Link
          href={siteUrl}
          style={{ color: brand.primaryColor, textDecoration: "underline" }}
        >
          {brand.websiteUrl.replace(/^https?:\/\//, "")}
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
      {showSocial ? (
        <Text style={{ margin: "12px 0 0", fontSize: "12px", lineHeight: "20px" }}>
          {brand.socialLinks.map((link, index) => (
            <React.Fragment key={link.platform}>
              {index > 0 ? " · " : null}
              <Link href={link.url} style={{ color: brand.primaryColor, textDecoration: "underline" }}>
                {link.label ?? link.platform}
              </Link>
            </React.Fragment>
          ))}
        </Text>
      ) : null}
      <Text
        style={{
          margin: "20px 0 0",
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
