import { Text, View } from "@react-pdf/renderer";
import { getRating } from "@/lib/scoring";
import { PDF_RATING_BAR } from "@/lib/pdf/shared/colors";
import { PDF_TARGET_SCORE } from "@/lib/pdf/shared/constants";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfScoreGaugeProps = {
  score: number;
  label: string;
  ratingLabel: string;
  variant?: "default" | "accent";
  showTarget?: boolean;
};

export function PdfScoreGauge({
  score,
  label,
  ratingLabel,
  variant = "default",
  showTarget = true,
}: PdfScoreGaugeProps) {
  const rating = getRating(score);
  const width = `${Math.max(0, Math.min(100, Math.round(score)))}%`;

  return (
    <View wrap={false} style={variant === "accent" ? styles.gaugeCardAccent : styles.gaugeCard}>
      <Text style={styles.gaugeLabel}>{label}</Text>
      <Text style={styles.gaugeValue}>{score}</Text>
      <Text style={styles.gaugeRating}>{ratingLabel}</Text>
      <View style={styles.gaugeTrack}>
        <View style={[styles.gaugeFill, { width, backgroundColor: PDF_RATING_BAR[rating] }]} />
        {showTarget ? (
          <View style={[styles.targetLine, { left: `${PDF_TARGET_SCORE}%` }]} />
        ) : null}
      </View>
      {showTarget ? (
        <Text style={styles.targetCaption}>Target: {PDF_TARGET_SCORE}+</Text>
      ) : null}
    </View>
  );
}

export function PdfMiniScoreBar({ score, width = 120 }: { score: number; width?: number }) {
  const rating = getRating(score);
  const fillWidth = `${Math.max(0, Math.min(100, Math.round(score)))}%`;

  return (
    <View style={{ width }}>
      <View
        style={{
          height: 10,
          width: "100%",
          backgroundColor: "#E2E8F0",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 10,
            borderRadius: 5,
            width: fillWidth,
            backgroundColor: PDF_RATING_BAR[rating],
          }}
        />
      </View>
    </View>
  );
}