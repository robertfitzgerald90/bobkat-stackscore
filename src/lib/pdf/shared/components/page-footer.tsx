import { Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { PDF_COLORS as COLORS } from "@/lib/pdf/shared/colors";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfPageFooterProps = {
  generatedDate: string;
};

export function PdfPageFooter({ generatedDate }: PdfPageFooterProps) {
  const contact = [BRAND.email, BRAND.phone, BRAND.website].filter(Boolean).join("  |  ");

  return (
    <View style={styles.footer} fixed>
      <Text style={{ fontSize: 8, color: COLORS.muted, maxWidth: "34%" }}>{BRAND.companyName}</Text>
      <Text style={styles.footerCenter}>
        Generated {generatedDate}
        {contact ? `  |  ${contact}` : ""}
      </Text>
      <Text
        style={{ fontSize: 8, color: COLORS.muted, textAlign: "right", minWidth: "18%" }}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}
