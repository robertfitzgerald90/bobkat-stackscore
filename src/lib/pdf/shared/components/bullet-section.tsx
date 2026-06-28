import { Text, View } from "@react-pdf/renderer";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfBulletSectionProps = {
  title: string;
  items: string[];
};

export function PdfBulletSection({ title, items }: PdfBulletSectionProps) {
  if (items.length === 0) return null;

  return (
    <View wrap={false} style={styles.bulletSection}>
      <Text style={styles.bulletHeading}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.bulletItem}>
          • {item}
        </Text>
      ))}
    </View>
  );
}
