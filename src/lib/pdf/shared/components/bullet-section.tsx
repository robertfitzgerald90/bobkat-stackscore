import { Text, View } from "@react-pdf/renderer";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfBulletSectionProps = {
  title: string;
  items: string[];
};

export function PdfBulletSection({ title, items }: PdfBulletSectionProps) {
  if (items.length === 0) return null;

  // Short lists stay together to avoid orphaned headings / split briefing blocks.
  const keepTogether = items.length <= 4;

  if (keepTogether) {
    return (
      <View wrap={false} style={styles.bulletSection}>
        <Text style={styles.bulletHeading}>{title}</Text>
        {items.map((item, index) => (
          <Text key={`${title}-${index}`} style={styles.bulletItem}>
            • {item}
          </Text>
        ))}
      </View>
    );
  }

  const [first, ...rest] = items;

  return (
    <View style={styles.bulletSection}>
      <View wrap={false}>
        <Text style={styles.bulletHeading}>{title}</Text>
        <Text style={styles.bulletItem}>• {first}</Text>
      </View>
      {rest.map((item, index) => (
        <Text key={`${title}-${index + 1}`} style={styles.bulletItem}>
          • {item}
        </Text>
      ))}
    </View>
  );
}
