import { Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { COLORS } from "@/lib/pdf/shared/colors";
import { TIP_PDF_SPACING, TIP_PDF_TYPOGRAPHY } from "@/lib/pdf/tip/tokens";

type PdfTipReportFooterProps = {
  generatedDate: string;
  documentVersion?: string;
  clientName?: string;
};

export function PdfTipReportFooter({
  generatedDate,
  documentVersion = "1.0",
  clientName,
}: PdfTipReportFooterProps) {
  return (
    <View
      fixed
      style={{
        position: "absolute",
        bottom: 14,
        left: TIP_PDF_SPACING.pagePaddingX,
        right: TIP_PDF_SPACING.pagePaddingX,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 5,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text style={{ fontSize: TIP_PDF_TYPOGRAPHY.footer, color: COLORS.muted, flex: 1 }}>
          {BRAND.companyName} · {BRAND.productName}
          {documentVersion ? ` v${documentVersion}` : ""} · {generatedDate}
        </Text>
        <Text
          style={{
            fontSize: TIP_PDF_TYPOGRAPHY.footer,
            color: COLORS.muted,
            textAlign: "right",
          }}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </View>
      <Text
        style={{
          fontSize: 7,
          color: COLORS.muted,
          lineHeight: 1.3,
          marginTop: 2,
          textAlign: "center",
        }}
      >
        Confidential{clientName ? ` — Prepared exclusively for ${clientName}` : ""}. Unauthorized
        distribution prohibited.
      </Text>
    </View>
  );
}
