import { Text, View } from "@react-pdf/renderer";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfBulletSectionProps = {
  title: string;
  items: string[];
};

export function PdfBulletSection({ title, items }: PdfBulletSectionProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.bulletSection}>
      <View wrap={false}>
        <Text style={styles.bulletHeading}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <Text key={`${title}-${index}`} style={styles.bulletItem}>
          • {item}
        </Text>
      ))}
    </View>
  );
}
