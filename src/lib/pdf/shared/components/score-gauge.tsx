import { Text, View } from "@react-pdf/renderer";
import { getRating } from "@/lib/scoring";
import { PDF_RATING_BAR, PDF_SCORE_BAR } from "@/lib/pdf/shared/colors";
import { PDF_TARGET_SCORE } from "@/lib/pdf/shared/constants";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfScoreGaugeProps = {
  score: number;
  label: string;
  ratingLabel: string;
  variant?: "default" | "accent";
  showTarget?: boolean;
  /** Use rating-based colors only for risk indicators; default uses current-score blue. */
  barVariant?: "current" | "rating" | "improvement";
};

export function PdfScoreGauge({
  score,
  label,
  ratingLabel,
  variant = "default",
  showTarget = true,
  barVariant = "current",
}: PdfScoreGaugeProps) {
  const rating = getRating(score);
  const width = `${Math.max(0, Math.min(100, Math.round(score)))}%`;
  const fillColor =
    barVariant === "rating"
      ? PDF_RATING_BAR[rating]
      : barVariant === "improvement"
        ? PDF_SCORE_BAR.improvement
        : PDF_SCORE_BAR.current;

  return (
    <View wrap={false} style={variant === "accent" ? styles.gaugeCardAccent : styles.gaugeCard}>
      <Text style={styles.gaugeLabel}>{label}</Text>
      <Text style={styles.gaugeValue}>{score}</Text>
      <Text style={styles.gaugeRating}>{ratingLabel}</Text>
      <View style={styles.gaugeTrack}>
        <View style={[styles.gaugeFill, { width, backgroundColor: fillColor }]} />
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

export function PdfMiniScoreBar({
  score,
  width = 120,
  variant = "current",
}: {
  score: number;
  width?: number;
  variant?: "current" | "rating" | "improvement";
}) {
  const rating = getRating(score);
  const fillWidth = `${Math.max(0, Math.min(100, Math.round(score)))}%`;
  const fillColor =
    variant === "rating"
      ? PDF_RATING_BAR[rating]
      : variant === "improvement"
        ? PDF_SCORE_BAR.improvement
        : PDF_SCORE_BAR.current;

  return (
    <View style={{ width }}>
      <View
        style={{
          height: 8,
          width: "100%",
          backgroundColor: "#E5E7EB",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 8,
            borderRadius: 4,
            width: fillWidth,
            backgroundColor: fillColor,
          }}
        />
      </View>
    </View>
  );
}
