import React from "react";
import { Text, View } from "@react-pdf/renderer";
import { getRating } from "@/lib/scoring";
import { PDF_RATING_BAR, PDF_SCORE_BAR } from "@/lib/pdf/shared/colors";
import { PdfCornerBrackets } from "@/lib/pdf/shared/components/corner-brackets";
import { PDF_TARGET_SCORE } from "@/lib/pdf/shared/constants";
import { REPORT_COLORS, REPORT_RADIUS } from "@/lib/pdf/shared/tokens";
import { pdfComponentStyles as styles } from "@/lib/pdf/shared/styles/components";

type PdfScoreGaugeProps = {
  score: number;
  label: string;
  ratingLabel: string;
  variant?: "default" | "accent";
  showTarget?: boolean;
  /** Use rating-based colors only for risk indicators; default uses forest current score. */
  barVariant?: "current" | "rating" | "improvement";
  /** Four corners on the primary overall maturity score; two elsewhere. */
  bracketCorners?: "two" | "four";
};

export function PdfScoreGauge({
  score,
  label,
  ratingLabel,
  variant = "default",
  showTarget = true,
  barVariant = "current",
  bracketCorners = "two",
}: PdfScoreGaugeProps) {
  const rating = getRating(score);
  const width = `${Math.max(0, Math.min(100, Math.round(score)))}%`;
  const fillColor =
    barVariant === "rating"
      ? PDF_RATING_BAR[rating]
      : barVariant === "improvement"
        ? PDF_SCORE_BAR.improvement
        : PDF_SCORE_BAR.current;

  const card = (
    <View wrap={false} style={variant === "accent" ? styles.gaugeCardAccent : styles.gaugeCard}>
      <Text style={styles.gaugeLabel}>{label}</Text>
      <View style={styles.gaugeScoreBlock}>
        <Text style={styles.gaugeValue}>{score}</Text>
        <Text style={styles.gaugeRating}>{ratingLabel}</Text>
      </View>
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

  return (
    <PdfCornerBrackets
      corners={bracketCorners}
      tone={rating === "critical" || rating === "at_risk" ? "ink" : "forest"}
      style={{ flex: 1 }}
    >
      {card}
    </PdfCornerBrackets>
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
          backgroundColor: REPORT_COLORS.rule,
          borderRadius: REPORT_RADIUS.sm,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 8,
            borderRadius: REPORT_RADIUS.sm,
            width: fillWidth,
            backgroundColor: fillColor,
          }}
        />
      </View>
    </View>
  );
}
