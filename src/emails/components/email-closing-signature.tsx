import { Section, Text } from "@react-email/components";
import { emailTokens } from "@/emails/tokens";
import {
  buildBobkatFounderSignatureLines,
  DEFAULT_FOUNDER_CLOSING_MESSAGE,
} from "@/lib/email/bobkat-founder-signature";

export interface EmailClosingSignatureProps {
  closingMessage?: string;
}

const lineStyle = {
  margin: "0 0 4px",
  fontSize: "16px",
  lineHeight: "26px",
  color: emailTokens.ink,
} as const;

const spacerStyle = {
  margin: "0 0 12px",
  fontSize: "1px",
  lineHeight: "12px",
  color: emailTokens.ink,
} as const;

/**
 * Renders a professional founder closing signature with explicit line breaks
 * for reliable display in Gmail, Outlook, Apple Mail, and mobile clients.
 */
export function EmailClosingSignature({
  closingMessage = DEFAULT_FOUNDER_CLOSING_MESSAGE,
}: EmailClosingSignatureProps) {
  const lines = buildBobkatFounderSignatureLines(closingMessage);

  return (
    <Section
      style={{
        backgroundColor: emailTokens.surface,
        borderLeft: `1px solid ${emailTokens.border}`,
        borderRight: `1px solid ${emailTokens.border}`,
        padding: "0 24px 20px",
      }}
    >
      {lines.map((line, index) =>
        line === "" ? (
          <Text key={`spacer-${index}`} style={spacerStyle}>
            &nbsp;
          </Text>
        ) : (
          <Text key={`line-${index}`} style={lineStyle}>
            {line}
          </Text>
        ),
      )}
    </Section>
  );
}
