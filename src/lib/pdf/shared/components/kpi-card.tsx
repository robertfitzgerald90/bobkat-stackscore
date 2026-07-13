import { Text, View } from "@react-pdf/renderer";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfKpiCardProps = {
  label: string;
  value: string | number;
  caption?: string;
  highlight?: boolean;
};

export function PdfKpiCard({ label, value, caption, highlight = false }: PdfKpiCardProps) {
  return (
    <View wrap={false} style={highlight ? styles.kpiCardHighlight : styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {caption ? <Text style={styles.kpiCaption}>{caption}</Text> : null}
    </View>
  );
}

type PdfKpiRowProps = {
  children: React.ReactNode;
};

export function PdfKpiRow({ children }: PdfKpiRowProps) {
  return <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>{children}</View>;
}
