import { Image, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { getPdfLogoPath } from "@/lib/pdf/shared/constants";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfReportHeaderProps = {
  clientName: string;
  generatedDate: string;
  documentLabel: string;
};

export function PdfReportHeader({
  clientName,
  generatedDate,
  documentLabel,
}: PdfReportHeaderProps) {
  return (
    <View style={styles.pageHeader} fixed>
      <View style={styles.pageHeaderLeft}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={getPdfLogoPath()} style={styles.pageHeaderLogo} />
        <View>
          <Text style={styles.pageHeaderBrand}>
            {BRAND.companyName} · {BRAND.productName}
          </Text>
          <Text style={styles.pageHeaderDoc}>{documentLabel}</Text>
        </View>
      </View>
      <View style={styles.pageHeaderRight}>
        <Text style={styles.pageHeaderClient}>{clientName}</Text>
        <Text style={styles.pageHeaderDate}>Prepared {generatedDate}</Text>
      </View>
    </View>
  );
}
