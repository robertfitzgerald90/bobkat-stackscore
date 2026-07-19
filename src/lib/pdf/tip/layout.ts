import { StyleSheet } from "@react-pdf/renderer";
import { COLORS } from "@/lib/pdf/shared/colors";
import { TIP_PDF_SPACING, TIP_PDF_TYPOGRAPHY } from "@/lib/pdf/tip/tokens";

export const tipPageStyles = StyleSheet.create({
  cover: {
    paddingTop: 0,
    paddingBottom: TIP_PDF_SPACING.pagePaddingBottom,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: TIP_PDF_TYPOGRAPHY.body,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  body: {
    paddingTop: TIP_PDF_SPACING.headerReserve,
    paddingBottom: TIP_PDF_SPACING.pagePaddingBottom,
    paddingHorizontal: TIP_PDF_SPACING.pagePaddingX,
    fontFamily: "Helvetica",
    fontSize: TIP_PDF_TYPOGRAPHY.body,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
});
