import type { ReactNode } from "react";
import { Text, View } from "@react-pdf/renderer";
import { COLORS } from "@/lib/pdf/shared/colors";
import { TIP_PAGINATION, TIP_PDF_SPACING, TIP_PDF_TYPOGRAPHY } from "@/lib/pdf/tip/tokens";

type PdfTipSectionProps = {
  title: string;
  subtitle?: string;
  breakBefore?: boolean;
  children: ReactNode;
};

/**
 * Section chrome with orphan-title protection.
 * Title stays with the following intro/content via minPresenceAhead on the heading block.
 */
export function PdfTipSection({
  title,
  subtitle,
  breakBefore = false,
  children,
}: PdfTipSectionProps) {
  const minPresence = subtitle ? TIP_PAGINATION.sectionWithSubtitle : TIP_PAGINATION.sectionTitle;

  return (
    <View break={breakBefore} style={{ marginBottom: TIP_PDF_SPACING.section }}>
      <View minPresenceAhead={minPresence}>
        <View style={{ width: 24, height: 2, backgroundColor: COLORS.accent, marginBottom: 3 }} />
        <Text
          style={{
            fontSize: TIP_PDF_TYPOGRAPHY.sectionTitle,
            fontFamily: "Helvetica-Bold",
            color: COLORS.navy,
            lineHeight: 1.2,
            paddingBottom: 3,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
          minPresenceAhead={subtitle ? 28 : 40}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontSize: TIP_PDF_TYPOGRAPHY.sectionSubtitle,
              color: COLORS.muted,
              marginTop: 3,
              lineHeight: 1.35,
              marginBottom: 6,
            }}
            minPresenceAhead={36}
          >
            {subtitle}
          </Text>
        ) : (
          <View style={{ height: 6 }} />
        )}
      </View>
      {children}
    </View>
  );
}
