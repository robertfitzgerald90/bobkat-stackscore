import { Text, View } from "@react-pdf/renderer";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

export type PdfTimelineItem = {
  id: string;
  label: string;
  meta?: string;
  active?: boolean;
};

type PdfTimelineProps = {
  items: PdfTimelineItem[];
};

export function PdfTimeline({ items }: PdfTimelineProps) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={item.id} style={styles.timelineRow}>
          <View style={{ alignItems: "center", width: 16 }}>
            <View style={[styles.timelineDot, item.active ? styles.timelineDotActive : {}]} />
            {index < items.length - 1 ? (
              <View style={{ ...styles.timelineConnector, flex: 1, minHeight: 20 }} />
            ) : null}
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineLabel}>{item.label}</Text>
            {item.meta ? <Text style={styles.timelineMeta}>{item.meta}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}
