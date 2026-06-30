import { StyleSheet } from "@react-pdf/renderer";

/** Letter page content area — reserve space for fixed footer (copyright + page numbers). */
export const PDF_LAYOUT = {
  paddingTop: 52,
  paddingBottom: 80,
  paddingHorizontal: 54,
  footerReserve: 80,
} as const;

export const PDF_SPACING = {
  section: 22,
  afterTitle: 10,
  afterSubtitle: 14,
  block: 12,
  paragraph: 8,
  card: 10,
} as const;

export const pdfPageStyles = StyleSheet.create({
  body: {
    paddingTop: PDF_LAYOUT.paddingTop,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: PDF_LAYOUT.paddingHorizontal,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#334155",
    backgroundColor: "#FFFFFF",
  },
  cover: {
    paddingTop: 0,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#334155",
    backgroundColor: "#FFFFFF",
  },
  section: {
    marginBottom: PDF_SPACING.section,
  },
});
