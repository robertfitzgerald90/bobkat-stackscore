import React, { type ReactNode } from "react";
import { StyleSheet, View } from "@react-pdf/renderer";
import { REPORT_COLORS, REPORT_RADIUS } from "@/lib/pdf/shared/tokens";

type CornerBracketTone = "forest" | "ink";
type CornerBracketCoverage = "two" | "four";

type PdfCornerBracketsProps = {
  children: ReactNode;
  tone?: CornerBracketTone;
  corners?: CornerBracketCoverage;
  style?: object | object[];
};

const ARM = 10;
const THICKNESS = 1.25;
const OUTSET = 3;

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: ARM,
    height: ARM,
  },
});

function cornerStyle(
  position: "tl" | "tr" | "bl" | "br",
  color: string,
): object {
  const base = {
    ...styles.corner,
    borderColor: color,
  };
  if (position === "tl") {
    return {
      ...base,
      top: -OUTSET,
      left: -OUTSET,
      borderTopWidth: THICKNESS,
      borderLeftWidth: THICKNESS,
      borderTopLeftRadius: REPORT_RADIUS.sm,
    };
  }
  if (position === "tr") {
    return {
      ...base,
      top: -OUTSET,
      right: -OUTSET,
      borderTopWidth: THICKNESS,
      borderRightWidth: THICKNESS,
      borderTopRightRadius: REPORT_RADIUS.sm,
    };
  }
  if (position === "bl") {
    return {
      ...base,
      bottom: -OUTSET,
      left: -OUTSET,
      borderBottomWidth: THICKNESS,
      borderLeftWidth: THICKNESS,
      borderBottomLeftRadius: REPORT_RADIUS.sm,
    };
  }
  return {
    ...base,
    bottom: -OUTSET,
    right: -OUTSET,
    borderBottomWidth: THICKNESS,
    borderRightWidth: THICKNESS,
    borderBottomRightRadius: REPORT_RADIUS.sm,
  };
}

/**
 * Print-safe L-shaped corner brackets for PDF cards.
 * Absolute positioning (same technique as fixed PDF headers/footers).
 */
export function PdfCornerBrackets({
  children,
  tone = "forest",
  corners = "two",
  style,
}: PdfCornerBracketsProps) {
  const color = tone === "ink" ? REPORT_COLORS.ink : REPORT_COLORS.forest;
  const positions =
    corners === "four" ? (["tl", "tr", "bl", "br"] as const) : (["tl", "br"] as const);

  return (
    <View style={[styles.wrap, style]} wrap={false}>
      {children}
      {positions.map((position) => (
        <View key={position} style={cornerStyle(position, color)} />
      ))}
    </View>
  );
}
