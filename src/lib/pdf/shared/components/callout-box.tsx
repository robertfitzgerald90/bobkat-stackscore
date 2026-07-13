import { Text, View } from "@react-pdf/renderer";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfCalloutBoxProps = {
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "warning";
};

export function PdfCalloutBox({ title, children, variant = "default" }: PdfCalloutBoxProps) {
  if (variant === "warning") {
    return (
      <View style={styles.calloutWarning}>
        {title ? <Text style={styles.calloutWarningTitle}>{title}</Text> : null}
        <Text style={styles.calloutBody}>{children}</Text>
      </View>
    );
  }

  return (
    <View style={styles.calloutBox}>
      {title ? <Text style={styles.calloutTitle}>{title}</Text> : null}
      <Text style={styles.calloutBody}>{children}</Text>
    </View>
  );
}
