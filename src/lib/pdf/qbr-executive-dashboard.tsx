import React from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildQbrExecutiveHealthSummary,
  buildQbrPdfDashboardMetrics,
  formatSignedPoints,
} from "@/lib/qbr/presentation";
import type { QbrReportData } from "@/lib/qbr/types";
import { REPORT_COLORS as C, REPORT_FONTS as F } from "@/lib/pdf/shared/tokens";

const s = StyleSheet.create({
  heroes: { flexDirection: "row", gap: 8, marginBottom: 14 },
  hero: { flex: 1, padding: 11, borderWidth: 1, borderColor: C.rule },
  label: { fontSize: 8, color: C.inkSecondary, marginBottom: 6 },
  value: {
    fontFamily: F.bodyBold,
    fontSize: 23,
    color: C.ink,
    marginBottom: 4,
  },
  hint: { fontSize: 8, lineHeight: 1.4, color: C.inkSecondary },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 18,
    marginBottom: 14,
  },
  metric: {
    width: "48%",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
    paddingVertical: 8,
  },
  metricCopy: { flex: 1, paddingRight: 8 },
  metricValue: { fontSize: 13, fontFamily: F.bodyBold, color: C.ink },
  health: { marginBottom: 18 },
  healthRow: { flexDirection: "row", marginBottom: 6 },
  healthLabel: {
    width: "35%",
    fontSize: 9,
    fontFamily: F.bodyBold,
    color: C.ink,
  },
  healthText: { flex: 1, fontSize: 9, lineHeight: 1.5, color: C.inkSecondary },
});

/** The same restrained metric grid and document typography as the assessment PDF. */
export function QbrPdfExecutiveDashboard({ data }: { data: QbrReportData }) {
  const score = data.scoreAtPeriodEnd ?? data.currentStackScore;
  const metrics = buildQbrPdfDashboardMetrics(data);
  const health = buildQbrExecutiveHealthSummary(data);
  return (
    <View>
      <View style={s.heroes} wrap={false}>
        {[
          {
            label: "Previous score",
            value:
              data.scoreAtPeriodStart != null
                ? String(data.scoreAtPeriodStart)
                : "Not available",
            hint: "Prior review",
          },
          {
            label: "Score change",
            value: formatSignedPoints(data.scoreChange),
            hint: "Change across completed assessments",
          },
          {
            label: "Current StackScore",
            value: score != null ? `${score} / 100` : "Not assessed",
            hint: data.currentMaturityLabel ?? "Current period",
          },
        ].map((m) => (
          <View style={s.hero} key={m.label}>
            <Text style={s.label}>{m.label}</Text>
            <Text style={s.value}>{m.value}</Text>
            <Text style={s.hint}>{m.hint}</Text>
          </View>
        ))}
      </View>
      <View style={s.grid}>
        {metrics.map((m) => (
          <View style={s.metric} key={m.id} wrap={false}>
            <View style={s.metricCopy}>
              <Text style={s.label}>{m.label}</Text>
              {m.secondary && <Text style={s.hint}>{m.secondary}</Text>}
            </View>
            <Text style={s.metricValue}>{m.value}</Text>
          </View>
        ))}
      </View>
      <View style={s.health}>
        {[
          ["Technology health", health.overallHealth],
          ["Biggest win", health.biggestWin],
          ["Largest concern", health.largestConcern],
          ["Recommendation", health.overallRecommendation],
        ].map(([label, value]) => (
          <View key={label} style={s.healthRow} wrap={false}>
            <Text style={s.healthLabel}>{label}</Text>
            <Text style={s.healthText}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
