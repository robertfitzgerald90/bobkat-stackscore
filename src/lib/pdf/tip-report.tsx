import path from "path";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import {
  formatGeneratedDate,
  PRIORITY_LABELS,
  type TipReportData,
} from "@/lib/pdf/types";
import type { Priority } from "@/generated/prisma/client";

const logoPath = path.join(process.cwd(), "public", "branding", "bobkat-it-logo-navy.png");

Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  navy: BRAND.primaryColor,
  slate: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: BRAND.lightBackground,
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 52,
    paddingBottom: 72,
    paddingHorizontal: 54,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
  },
  coverHero: {
    backgroundColor: COLORS.navy,
    padding: 54,
    marginHorizontal: -54,
    marginTop: -52,
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 12,
    color: "#CBD5E1",
    marginBottom: 24,
  },
  coverMeta: {
    fontSize: 10,
    color: "#E2E8F0",
    lineHeight: 1.6,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 12,
    marginTop: 8,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  rowTitle: { flex: 1, fontFamily: "Helvetica-Bold", paddingRight: 8 },
  rowMeta: { width: 80, textAlign: "right", color: COLORS.muted },
  panel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 54,
    right: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLORS.muted,
  },
  signatureBlock: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate,
    width: 220,
    marginTop: 28,
    marginBottom: 6,
  },
});

function PageFooter({ clientName, pageNumber }: { clientName: string; pageNumber: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text>
        Confidential — Prepared for {clientName} by BobKat IT. Unauthorized distribution prohibited.
      </Text>
      <Text>Page {pageNumber}</Text>
    </View>
  );
}

function priorityLabel(priority: Priority) {
  return PRIORITY_LABELS[priority].replace(" Priority", "");
}

export function TipReportDocument({ data }: { data: TipReportData }) {
  const currentRating = getRating(data.currentScore);
  const projectedRating = getRating(data.projectedScore);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.coverHero}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoPath} style={{ width: 120, marginBottom: 24 }} />
          <Text style={styles.coverTitle}>Technology Improvement Plan</Text>
          <Text style={styles.coverSubtitle}>
            A strategic roadmap to strengthen technology resilience and business outcomes
          </Text>
          <Text style={styles.coverMeta}>
            {data.clientName}
            {"\n"}
            Version {data.version}
            {"\n"}
            Generated {data.generatedDate}
            {data.assessmentName ? `\nBased on ${data.assessmentName}` : ""}
          </Text>
        </View>

        <View style={{ marginTop: 32 }}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.body}>
            {data.executiveSummary ||
              `This Technology Improvement Plan outlines prioritized initiatives to advance ${data.clientName}'s technology posture from a current StackScore of ${data.currentScore} toward a projected ${data.projectedScore}, reducing operational risk and improving business continuity.`}
          </Text>
          <View style={styles.panel}>
            <Text style={styles.body}>
              Current StackScore: {data.currentScore} ({RATING_LABELS[currentRating]})
              {"\n"}
              Projected StackScore: {data.projectedScore} ({RATING_LABELS[projectedRating]})
              {"\n"}
              Recommended investment: {formatCurrency(data.clientInvestmentTotal)}
            </Text>
          </View>
        </View>
        <PageFooter clientName={data.clientName} pageNumber={1} />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Prioritized Recommendations</Text>
        {data.recommendations.map((rec) => (
          <View key={rec.id} style={styles.panel}>
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{rec.title}</Text>
              <Text style={styles.rowMeta}>{priorityLabel(rec.priority)}</Text>
            </View>
            <Text style={styles.body}>{rec.businessImpact}</Text>
            {rec.executiveNote ? (
              <Text style={[styles.body, { color: COLORS.muted }]}>Note: {rec.executiveNote}</Text>
            ) : null}
          </View>
        ))}
        <PageFooter clientName={data.clientName} pageNumber={2} />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Phased Implementation Roadmap</Text>
        {data.roadmapPhases.map((phase) => (
          <View key={phase.id} style={styles.panel}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 6 }}>{phase.label}</Text>
            <Text style={styles.body}>
              Initiatives: {phase.recommendations.map((rec) => rec.title).join("; ") || "—"}
            </Text>
            <Text style={styles.body}>
              Projected StackScore after phase: {phase.projectedScore} (+{phase.scoreDelta})
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Investment Summary</Text>
        <View style={styles.panel}>
          {data.includeInternalDetails && data.investmentBreakdown ? (
            <>
              <Text style={styles.body}>Labor: {formatCurrency(data.investmentBreakdown.labor)}</Text>
              <Text style={styles.body}>
                Hardware: {formatCurrency(data.investmentBreakdown.hardware)}
              </Text>
              <Text style={styles.body}>
                Services: {formatCurrency(data.investmentBreakdown.services)}
              </Text>
              <Text style={styles.body}>
                Margin ({data.investmentBreakdown.marginPercent}%): included in total
              </Text>
            </>
          ) : null}
          <Text style={[styles.body, { fontFamily: "Helvetica-Bold" }]}>
            Total client investment: {formatCurrency(data.clientInvestmentTotal)}
          </Text>
        </View>

        <View style={styles.signatureBlock}>
          <Text style={styles.sectionTitle}>Approval</Text>
          <Text style={styles.body}>
            By signing below, {data.clientName} approves the initiatives and investment outlined in
            this Technology Improvement Plan.
          </Text>
          <Text style={styles.signatureLine} />
          <Text style={styles.body}>Authorized Signature</Text>
          <Text style={styles.signatureLine} />
          <Text style={styles.body}>Date</Text>
        </View>
        <PageFooter clientName={data.clientName} pageNumber={3} />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Technology Journey</Text>
        <View style={styles.panel}>
          <Text style={styles.body}>
            Current phase: {data.journeyPhaseLabel}
            {"\n"}
            Journey progress: {data.journeyProgressPercent}%
            {"\n"}
            BobKat IT partners with clients through Assess → Improve → Maintain to deliver measurable
            technology outcomes.
          </Text>
        </View>
        <Text style={[styles.body, { marginTop: 24, color: COLORS.muted }]}>
          Generated by StackScore · {formatGeneratedDate()}
        </Text>
        <PageFooter clientName={data.clientName} pageNumber={4} />
      </Page>
    </Document>
  );
}
