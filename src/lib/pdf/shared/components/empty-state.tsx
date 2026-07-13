import { Text, View } from "@react-pdf/renderer";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfEmptyStateProps = {
  title: string;
  description?: string;
};

export function PdfEmptyState({ title, description }: PdfEmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {description ? <Text style={styles.emptyStateText}>{description}</Text> : null}
    </View>
  );
}
