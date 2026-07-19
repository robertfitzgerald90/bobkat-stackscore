import type { ReactNode } from "react";
import { Text, View } from "@react-pdf/renderer";
import { COLORS } from "@/lib/pdf/shared/colors";
import { estimateSectionIntroHeight } from "@/lib/pdf/tip/pagination";
import {
  TIP_PAGINATION,
  TIP_PDF_PAGE,
  TIP_PDF_SPACING,
  TIP_PDF_TYPOGRAPHY,
} from "@/lib/pdf/tip/tokens";

type PdfTipSectionProps = {
  title: string;
  subtitle?: string;
  breakBefore?: boolean;
  /** First meaningful content block — kept with the section heading. */
  firstBlock?: ReactNode;
  /** Estimated height (pt) of `firstBlock` for pagination grouping. */
  firstBlockMinHeight?: number;
  children?: ReactNode;
};

export function PdfTipSectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <>
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
        >
          {subtitle}
        </Text>
      ) : (
        <View style={{ height: 6 }} />
      )}
    </>
  );
}

/**
 * Section chrome grouped with the first content block so titles are never orphaned.
 * Remaining section content paginates normally after the intro group.
 */
export function PdfTipSection({
  title,
  subtitle,
  breakBefore = false,
  firstBlock,
  firstBlockMinHeight = 0,
  children,
}: PdfTipSectionProps) {
  const hasSubtitle = Boolean(subtitle);
  const introPresence = estimateSectionIntroHeight(hasSubtitle, firstBlockMinHeight);
  const lockIntroOnOnePage =
    firstBlockMinHeight > 0 &&
    introPresence <= TIP_PDF_PAGE.printableContentHeight * TIP_PAGINATION.maxIntroRatio;

  const introContent =
    firstBlock !== undefined ? (
      <>
        <PdfTipSectionHeader title={title} subtitle={subtitle} />
        {firstBlock}
      </>
    ) : (
      <>
        <PdfTipSectionHeader title={title} subtitle={subtitle} />
        {children}
      </>
    );

  return (
    <View break={breakBefore} style={{ marginBottom: TIP_PDF_SPACING.section }}>
      <View wrap={lockIntroOnOnePage ? false : undefined} minPresenceAhead={introPresence}>
        {introContent}
      </View>
      {firstBlock !== undefined ? children : null}
    </View>
  );
}
