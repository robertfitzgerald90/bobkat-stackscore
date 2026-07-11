import React from "react";
import { Img, Section, Text } from "@react-email/components";
import { DEFAULT_COMMUNICATION_BRAND, type CommunicationBrandConfig } from "@/lib/communications/brand-types";
import { emailTokens } from "@/emails/tokens";

type HeaderProps = {
  brand?: CommunicationBrandConfig;
};

export function Header({ brand = DEFAULT_COMMUNICATION_BRAND }: HeaderProps) {
  const tagline =
    brand.componentSettings.header?.tagline ?? `Powered by ${brand.companyName}`;

  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        borderRadius: `${emailTokens.radius} ${emailTokens.radius} 0 0`,
        border: `1px solid ${emailTokens.border}`,
        borderBottom: "none",
        padding: "28px 32px 24px",
        textAlign: "center",
      }}
    >
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{ margin: "0 auto", borderCollapse: "collapse" }}
      >
        <tbody>
          <tr>
            <td style={{ paddingRight: "16px", verticalAlign: "middle" }}>
              <Img
                src={brand.primaryLogoUrl}
                alt={`${brand.companyName} logo`}
                width={48}
                height={48}
                style={{
                  display: "block",
                  borderRadius: "8px",
                  border: 0,
                  outline: "none",
                }}
              />
            </td>
            <td style={{ verticalAlign: "middle", textAlign: "left" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: brand.fontFamilyHeading,
                  fontSize: "28px",
                  fontWeight: 700,
                  lineHeight: "32px",
                  color: brand.primaryColor,
                  letterSpacing: "-0.02em",
                }}
              >
                {brand.productName}
              </Text>
              <Text
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: brand.secondaryColor,
                  fontWeight: 500,
                }}
              >
                {tagline}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
