import { View } from "@react-pdf/renderer";
import { PDF_SCORE_BAR } from "@/lib/pdf/shared/colors";

type PdfProgressBarProps = {
  percent: number;
  width?: number | string;
  height?: number;
  variant?: "current" | "improvement" | "decline" | "neutral";
};

export function PdfProgressBar({
  percent,
  width = "100%",
  height = 8,
  variant = "current",
}: PdfProgressBarProps) {
  const fillWidth = `${Math.max(0, Math.min(100, Math.round(percent)))}%`;
  const fillColor =
    variant === "improvement"
      ? PDF_SCORE_BAR.improvement
      : variant === "decline"
        ? PDF_SCORE_BAR.decline
        : variant === "neutral"
          ? PDF_SCORE_BAR.neutral
          : PDF_SCORE_BAR.current;

  return (
    <View style={{ width }}>
      <View
        style={{
          height,
          width: "100%",
          backgroundColor: "#E5E7EB",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height,
            borderRadius: 4,
            width: fillWidth,
            backgroundColor: fillColor,
          }}
        />
      </View>
    </View>
  );
}
