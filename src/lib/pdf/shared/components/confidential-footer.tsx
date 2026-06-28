import { Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfConfidentialFooterProps = {
  clientName: string;
  generatedDate: string;
};

export function PdfConfidentialFooter({ clientName, generatedDate }: PdfConfidentialFooterProps) {
  const contact = [BRAND.email, BRAND.website].filter(Boolean).join("  ·  ");

  return (
    <View style={styles.confidentialFooter} fixed>
      <Text style={styles.confidentialFooterLeft}>
        Confidential — Prepared exclusively for {clientName} by {BRAND.companyName}. Unauthorized
        distribution prohibited.
      </Text>
      <Text style={styles.confidentialFooterCenter}>
        {BRAND.productName} · Generated {generatedDate}
        {contact ? `\n${contact}` : ""}
      </Text>
      <Text
        style={styles.confidentialFooterPage}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}
