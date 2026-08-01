import React from "react";
import { Circle, Path, Svg, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildQbrExecutiveHealthSummary,
  buildQbrPdfDashboardMetrics,
  formatSignedPoints,
  type QbrPdfDashboardMetric,
} from "@/lib/qbr/presentation";
import type { QbrReportData } from "@/lib/qbr/types";
import { COLORS, PdfSectionTitle } from "@/lib/pdf/shared";

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  heroRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  heroCard: {
    flex: 1,
    minHeight: 108,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCardAccent: {
    flex: 1,
    minHeight: 108,
    borderWidth: 1,
    borderColor: COLORS.navy,
    borderRadius: 10,
    backgroundColor: COLORS.navy,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: "center",
  },
  heroLabelOnAccent: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: "center",
  },
  heroValue: {
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textAlign: "center",
    lineHeight: 1.1,
  },
  heroValueOnAccent: {
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 1.1,
  },
  heroHint: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 8,
    textAlign: "center",
  },
  heroHintOnAccent: {
    fontSize: 8,
    color: "rgba(255,255,255,0.75)",
    marginTop: 8,
    textAlign: "center",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  metricCard: {
    width: "31.5%",
    minHeight: 92,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    padding: 12,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  iconWell: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 4,
  },
  metricValuePositive: {
    color: COLORS.success,
  },
  metricValueWarning: {
    color: COLORS.warning,
  },
  metricSecondary: {
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.35,
  },
  healthPanel: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  healthTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 12,
  },
  healthRow: {
    marginBottom: 10,
  },
  healthRowLast: {
    marginBottom: 0,
  },
  healthLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  healthValue: {
    fontSize: 10,
    color: COLORS.slate,
    lineHeight: 1.45,
  },
});

function DashboardIcon({
  name,
  tone = "default",
}: {
  name: QbrPdfDashboardMetric["icon"];
  tone?: QbrPdfDashboardMetric["tone"];
}) {
  const stroke =
    tone === "warning" ? COLORS.warning : tone === "positive" ? COLORS.success : COLORS.navy;

  return (
    <View style={styles.iconWell}>
      <Svg width={12} height={12} viewBox="0 0 24 24">
        {name === "roadmap" ? (
          <Path
            d="M4 19V5M4 19h16M8 15l3-3 3 2 5-6"
            stroke={stroke}
            strokeWidth={2}
            fill="none"
          />
        ) : null}
        {name === "projects" ? (
          <Path
            d="M4 7h16v12H4zM8 7V5h8v2"
            stroke={stroke}
            strokeWidth={2}
            fill="none"
          />
        ) : null}
        {name === "resolved" ? (
          <Path d="M5 13l4 4L19 7" stroke={stroke} strokeWidth={2} fill="none" />
        ) : null}
        {name === "risks" ? (
          <>
            <Path d="M12 3l10 18H2L12 3z" stroke={stroke} strokeWidth={2} fill="none" />
            <Path d="M12 10v4" stroke={stroke} strokeWidth={2} fill="none" />
            <Circle cx={12} cy={17} r={1} fill={stroke} />
          </>
        ) : null}
        {name === "budget" ? (
          <Path
            d="M4 19V5h16v14H4zm4-4h8M8 11h8"
            stroke={stroke}
            strokeWidth={2}
            fill="none"
          />
        ) : null}
        {name === "investment" ? (
          <>
            <Circle cx={12} cy={12} r={8} stroke={stroke} strokeWidth={2} fill="none" />
            <Path d="M12 8v8M9.5 10.5c.5-1 1.5-1.5 2.5-1.5s2 .7 2 1.7c0 2-4 1.3-4 3.3 0 1 .9 1.7 2 1.7s1.9-.4 2.4-1.2" stroke={stroke} strokeWidth={1.6} fill="none" />
          </>
        ) : null}
      </Svg>
    </View>
  );
}

function HeroCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <View style={accent ? styles.heroCardAccent : styles.heroCard} wrap={false}>
      <Text style={accent ? styles.heroLabelOnAccent : styles.heroLabel}>{label}</Text>
      <Text style={accent ? styles.heroValueOnAccent : styles.heroValue}>{value}</Text>
      {hint ? (
        <Text style={accent ? styles.heroHintOnAccent : styles.heroHint}>{hint}</Text>
      ) : null}
    </View>
  );
}

function MetricCard({ metric }: { metric: QbrPdfDashboardMetric }) {
  return (
    <View style={styles.metricCard} wrap={false}>
      <View style={styles.metricHeader}>
        <DashboardIcon name={metric.icon} tone={metric.tone} />
        <Text style={styles.metricLabel}>{metric.label}</Text>
      </View>
      <Text
        style={[
          styles.metricValue,
          metric.tone === "positive" ? styles.metricValuePositive : undefined,
          metric.tone === "warning" ? styles.metricValueWarning : undefined,
        ]}
      >
        {metric.value}
      </Text>
      {metric.secondary ? <Text style={styles.metricSecondary}>{metric.secondary}</Text> : null}
    </View>
  );
}

export function QbrPdfExecutiveDashboard({ data }: { data: QbrReportData }) {
  const scoreEnd = data.scoreAtPeriodEnd ?? data.currentStackScore;
  const metrics = buildQbrPdfDashboardMetrics(data);
  const health = buildQbrExecutiveHealthSummary(data);
  const improvementHint =
    data.scoreAtPeriodStart != null
      ? `From ${data.scoreAtPeriodStart}`
      : "Versus prior review";

  return (
    <View style={styles.section}>
      <PdfSectionTitle
        title="Executive Dashboard"
        subtitle="How healthy is this client's technology environment?"
      />

      {/* Tier 1 — hero score story */}
      <View style={styles.heroRow} wrap={false}>
        <HeroCard
          label="Previous Score"
          value={data.scoreAtPeriodStart != null ? String(data.scoreAtPeriodStart) : "—"}
          hint="Prior review"
        />
        <HeroCard
          label="Score Improvement"
          value={formatSignedPoints(data.scoreChange)}
          hint={improvementHint}
          accent
        />
        <HeroCard
          label="Current StackScore"
          value={scoreEnd != null ? String(scoreEnd) : "—"}
          hint={data.currentMaturityLabel ?? "Current period"}
        />
      </View>

      {/* Tier 2 — balanced 3×2 metric grid */}
      <View style={styles.metricGrid}>
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      {/* Tier 3 — executive health narrative */}
      <View style={styles.healthPanel} wrap={false}>
        <Text style={styles.healthTitle}>Executive Health Summary</Text>
        <View style={styles.healthRow}>
          <Text style={styles.healthLabel}>Overall Technology Health</Text>
          <Text style={styles.healthValue}>{health.overallHealth}</Text>
        </View>
        <View style={styles.healthRow}>
          <Text style={styles.healthLabel}>Biggest Win Since Previous Review</Text>
          <Text style={styles.healthValue}>{health.biggestWin}</Text>
        </View>
        <View style={styles.healthRow}>
          <Text style={styles.healthLabel}>Largest Remaining Concern</Text>
          <Text style={styles.healthValue}>{health.largestConcern}</Text>
        </View>
        <View style={[styles.healthRow, styles.healthRowLast]}>
          <Text style={styles.healthLabel}>Overall Recommendation</Text>
          <Text style={styles.healthValue}>{health.overallRecommendation}</Text>
        </View>
      </View>
    </View>
  );
}
