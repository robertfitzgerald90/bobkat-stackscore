import { StyleSheet } from "@react-pdf/renderer";
import { PDF_COLORS as COLORS } from "@/lib/pdf/shared/colors";
import { REPORT_SPACING, REPORT_TYPOGRAPHY } from "@/lib/pdf/shared/tokens";

/** Letter page content area — reserve space for fixed footer. */
export const PDF_LAYOUT = {
  paddingTop: REPORT_SPACING.pagePaddingTop,
  paddingBottom: REPORT_SPACING.pagePaddingBottom,
  paddingHorizontal: REPORT_SPACING.pagePaddingX,
  footerReserve: REPORT_SPACING.pagePaddingBottom,
  headerReserve: REPORT_SPACING.headerReserve,
} as const;

export const PDF_SPACING = {
  section: REPORT_SPACING.section,
  afterTitle: 10,
  afterSubtitle: 14,
  block: REPORT_SPACING.block,
  paragraph: 8,
  card: 10,
} as const;

export const pdfPageStyles = StyleSheet.create({
  body: {
    paddingTop: PDF_LAYOUT.paddingTop,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: PDF_LAYOUT.paddingHorizontal,
    fontFamily: "Helvetica",
    fontSize: REPORT_TYPOGRAPHY.body,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  bodyWithHeader: {
    paddingTop: PDF_LAYOUT.headerReserve,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: PDF_LAYOUT.paddingHorizontal,
    fontFamily: "Helvetica",
    fontSize: REPORT_TYPOGRAPHY.body,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  cover: {
    paddingTop: 0,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: REPORT_TYPOGRAPHY.body,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  section: {
    marginBottom: PDF_SPACING.section,
  },
});

export const pdfReportBodyStyles = StyleSheet.create({
  bodyText: {
    fontSize: REPORT_TYPOGRAPHY.body,
    lineHeight: 1.65,
    color: COLORS.slate,
    marginBottom: 10,
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 16,
    marginBottom: REPORT_SPACING.block,
  },
  panelTitle: {
    fontSize: REPORT_TYPOGRAPHY.bodySmall,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionBlock: { marginBottom: REPORT_SPACING.section },
});
