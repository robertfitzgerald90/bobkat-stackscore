import React from "react";
import { Img, Section, Text } from "@react-email/components";
import { EMAIL_BRAND_ASSETS } from "@/emails/assets";
import { emailTokens } from "@/emails/tokens";
import { BRAND } from "@/lib/branding";

export function Header() {
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
                src={EMAIL_BRAND_ASSETS.bobkatItLogoNavy}
                alt={`${BRAND.companyName} logo`}
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
                  fontFamily: emailTokens.fontFamilyHeading,
                  fontSize: "28px",
                  fontWeight: 700,
                  lineHeight: "32px",
                  color: emailTokens.primary,
                  letterSpacing: "-0.02em",
                }}
              >
                {BRAND.productName}
              </Text>
              <Text
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: emailTokens.secondary,
                  fontWeight: 500,
                }}
              >
                Powered by {BRAND.companyName}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
