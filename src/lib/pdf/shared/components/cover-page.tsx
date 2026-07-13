import { Image, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { getPdfLogoPath } from "@/lib/pdf/shared/constants";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

export type PdfCoverMetaItem = {
  label: string;
  value: string;
};

type PdfCoverPageProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  clientName: string;
  meta?: PdfCoverMetaItem[];
  confidentialNotice?: string;
};

export function PdfCoverPage({
  eyebrow,
  title,
  subtitle,
  clientName,
  meta = [],
  confidentialNotice,
}: PdfCoverPageProps) {
  return (
    <>
      <View style={styles.coverAccentBar} />
      <View style={styles.coverBody}>
        {eyebrow ? <Text style={styles.coverEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.coverTitle}>{title}</Text>
        {subtitle ? <Text style={styles.coverSubtitle}>{subtitle}</Text> : null}
        <Text style={styles.coverClientName}>{clientName}</Text>

        {meta.length > 0 ? (
          <View style={styles.coverMetaGrid}>
            {meta.map((item) => (
              <View key={item.label} style={styles.coverMetaBlock}>
                <Text style={styles.coverMetaLabel}>{item.label}</Text>
                <Text style={styles.coverMetaValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.coverBrandRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={getPdfLogoPath()} style={styles.coverBrandLogo} />
          <View>
            <Text style={styles.coverPreparedBy}>Prepared by {BRAND.companyName}</Text>
            <Text style={styles.coverFinePrint}>
              Powered by {BRAND.productName}
              {confidentialNotice ? ` · ${confidentialNotice}` : ""}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
