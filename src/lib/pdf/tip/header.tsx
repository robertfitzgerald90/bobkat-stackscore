import { Image, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { getPdfLogoPath } from "@/lib/pdf/shared/constants";
import { COLORS } from "@/lib/pdf/shared/colors";
import { TIP_PDF_SPACING } from "@/lib/pdf/tip/tokens";

type PdfTipReportHeaderProps = {
  clientName: string;
  generatedDate: string;
  technologyScore?: number;
  reportVersion?: string;
};

export function PdfTipReportHeader({
  clientName,
  generatedDate,
  technologyScore,
  reportVersion,
}: PdfTipReportHeaderProps) {
  return (
    <View
      fixed
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: TIP_PDF_SPACING.headerReserve,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingHorizontal: TIP_PDF_SPACING.pagePaddingX,
        paddingTop: 8,
        paddingBottom: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={getPdfLogoPath()} style={{ width: 20, height: 20, objectFit: "contain" }} />
        <View>
          <Text
            style={{
              fontSize: 7,
              fontFamily: "Helvetica-Bold",
              color: COLORS.navy,
              letterSpacing: 0.3,
            }}
          >
            {BRAND.companyName} · {BRAND.productName}
          </Text>
          <Text style={{ fontSize: 7, color: COLORS.muted, marginTop: 1 }}>
            Technology Improvement Plan
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 9,
            fontFamily: "Helvetica-Bold",
            color: COLORS.slate,
            marginBottom: 1,
          }}
        >
          {clientName}
        </Text>
        {technologyScore !== undefined ? (
          <Text
            style={{
              fontSize: 8,
              fontFamily: "Helvetica-Bold",
              color: COLORS.navy,
              marginBottom: 1,
            }}
          >
            StackScore {technologyScore}
          </Text>
        ) : null}
        <Text style={{ fontSize: 7, color: COLORS.muted, lineHeight: 1.3 }}>
          {generatedDate}
          {reportVersion ? ` · v${reportVersion}` : ""}
        </Text>
      </View>
    </View>
  );
}
