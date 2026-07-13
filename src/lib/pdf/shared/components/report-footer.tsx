import { Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfReportFooterProps = {
  generatedDate: string;
  documentVersion?: string;
  clientName?: string;
  showConfidential?: boolean;
};

export function PdfReportFooter({
  generatedDate,
  documentVersion = "1.0",
  clientName,
  showConfidential = true,
}: PdfReportFooterProps) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerRow}>
        <Text style={styles.footerLeft}>Prepared by {BRAND.companyName}</Text>
        <Text style={styles.footerCenter}>
          Powered by {BRAND.productName}
          {documentVersion ? ` · v${documentVersion}` : ""}
          {"\n"}
          Generated {generatedDate}
        </Text>
        <Text
          style={styles.footerRight}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </View>
      {showConfidential ? (
        <Text style={styles.footerConfidential}>
          Confidential{clientName ? ` — Prepared exclusively for ${clientName}` : ""}. Unauthorized
          distribution prohibited.
        </Text>
      ) : null}
    </View>
  );
}
