import React from "react";
import { Img, Section, Text } from "@react-email/components";
import { DEFAULT_COMMUNICATION_BRAND, type CommunicationBrandConfig } from "@/lib/communications/brand-types";
import { bobkatLogoDimensionsForPlacement } from "@/lib/branding/assets";
import { emailTokens } from "@/emails/tokens";

type HeaderProps = {
  brand?: CommunicationBrandConfig;
};

export function Header({ brand = DEFAULT_COMMUNICATION_BRAND }: HeaderProps) {
  const tagline =
    brand.componentSettings.header?.tagline ?? `Powered by ${brand.companyName}`;
  const logoDimensions = bobkatLogoDimensionsForPlacement("email");

  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        borderRadius: `${emailTokens.radius} ${emailTokens.radius} 0 0`,
        border: `1px solid ${emailTokens.border}`,
        borderBottom: "none",
        padding: "28px 24px 20px",
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
                width={logoDimensions.width}
                height={logoDimensions.height}
                style={{
                  display: "block",
                  border: 0,
                  outline: "none",
                  objectFit: "contain",
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
