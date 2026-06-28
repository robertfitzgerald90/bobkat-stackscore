import { Text } from "@react-pdf/renderer";
import type { Priority } from "@/generated/prisma/client";
import { PDF_PRIORITY_BADGE } from "@/lib/pdf/shared/colors";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfPriorityBadgeProps = {
  priority: Priority;
};

export function PdfPriorityBadge({ priority }: PdfPriorityBadgeProps) {
  const badge = PDF_PRIORITY_BADGE[priority];

  return (
    <Text
      style={[
        styles.priorityBadge,
        { backgroundColor: badge.bg, color: badge.text, borderColor: badge.border },
      ]}
    >
      {badge.label}
    </Text>
  );
}
