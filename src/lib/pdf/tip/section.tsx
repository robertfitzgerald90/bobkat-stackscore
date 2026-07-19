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

/** Print-aware section wrapper with orphan title prevention. */
export function PdfTipSection({
  title,
  subtitle,
  breakBefore = false,
  children,
}: PdfTipSectionProps) {
  const minPresence = subtitle ? TIP_PAGINATION.sectionWithSubtitle : TIP_PAGINATION.sectionTitle;

  return (
    <View break={breakBefore} style={{ marginBottom: TIP_PDF_SPACING.section }}>
      <View wrap={false} minPresenceAhead={minPresence}>
        <View style={{ width: 28, height: 2, backgroundColor: COLORS.accent, marginBottom: 4 }} />
        <Text
          style={{
            fontSize: TIP_PDF_TYPOGRAPHY.sectionTitle,
            fontFamily: "Helvetica-Bold",
            color: COLORS.navy,
            lineHeight: 1.2,
            paddingBottom: 4,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontSize: TIP_PDF_TYPOGRAPHY.sectionSubtitle,
              color: COLORS.muted,
              marginTop: 4,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}
