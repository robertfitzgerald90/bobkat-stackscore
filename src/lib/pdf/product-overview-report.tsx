import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import {
  PdfCoverPage,
  PdfReportFooter,
  PdfReportHeader,
  PdfSectionTitle,
  registerPdfFonts,
} from "@/lib/pdf/shared";
import { PDF_COLORS as COLORS } from "@/lib/pdf/shared/colors";
import type { DemoProfileBundle } from "@/lib/product-overview/demo-profiles/types";
import { formatDemoCurrency } from "@/lib/product-overview/demo-dashboard";

registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 72,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
  },
  body: { lineHeight: 1.55, marginBottom: 10 },
  listItem: { marginBottom: 10 },
  listTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: COLORS.navy, marginBottom: 3 },
  kpiRow: { flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 16 },
});

export type ProductOverviewPdfData = {
  companyName: string;
  industry: string;
  generatedDate: string;
  profile: DemoProfileBundle;
};

export function ProductOverviewPdfDocument({ data }: { data: ProductOverviewPdfData }) {
  const { profile } = data;
  const dashboard = profile.dashboard;

  return (
    <Document
      title={`${data.companyName} — StackScore Product Overview`}
      author={BRAND.companyName}
      subject="StackScore Interactive Product Overview"
    >
      <Page size="LETTER" style={styles.page}>
        <PdfCoverPage
          eyebrow="StackScore Product Overview"
          title="Technology Strategy Platform"
          subtitle="Executive overview of assessments, recommendations, roadmaps, and ongoing partnership"
          clientName={data.companyName}
          meta={[
            { label: "Industry", value: data.industry },
            {
              label: "Technology Score",
              value: `${dashboard.technologyScore.score}/${dashboard.technologyScore.maxScore}`,
            },
            { label: "Maturity", value: dashboard.technologyScore.maturityLabel },
            { label: "Generated", value: data.generatedDate },
          ]}
          confidentialNotice="Sample demo overview for evaluation purposes"
        />
      </Page>

      <Page size="LETTER" style={styles.page}>
        <PdfReportHeader
          clientName={data.companyName}
          generatedDate={data.generatedDate}
          documentLabel="StackScore Product Overview"
        />
        <PdfReportFooter generatedDate={data.generatedDate} clientName={data.companyName} />
        <PdfSectionTitle
          title="Platform Overview"
          subtitle="One command center for technology posture, priorities, projects, and executive planning"
        />
        <Text style={styles.body}>{dashboard.organization.summary}</Text>
        <View style={styles.kpiRow}>
          <View>
            <Text style={styles.listTitle}>Open Recommendations</Text>
            <Text>{dashboard.metrics.openRecommendations}</Text>
          </View>
          <View>
            <Text style={styles.listTitle}>Active Projects</Text>
            <Text>{dashboard.metrics.activeProjects}</Text>
          </View>
          <View>
            <Text style={styles.listTitle}>Roadmap Completion</Text>
            <Text>{dashboard.metrics.roadmapCompletionPercent}%</Text>
          </View>
        </View>
        <PdfSectionTitle title="Technology Journey" subtitle="Assessment through continuous improvement" />
        {profile.timelineSnapshots.slice(0, 3).map((snapshot) => (
          <View key={snapshot.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{snapshot.label}</Text>
            <Text style={styles.body}>{snapshot.summary}</Text>
          </View>
        ))}
      </Page>

      <Page size="LETTER" style={styles.page}>
        <PdfReportHeader
          clientName={data.companyName}
          generatedDate={data.generatedDate}
          documentLabel="Assessment & Recommendations"
        />
        <PdfReportFooter generatedDate={data.generatedDate} clientName={data.companyName} />
        <PdfSectionTitle title="Technology Assessment" subtitle="Eight-pillar maturity framework" />
        {dashboard.pillars.slice(0, 4).map((pillar) => (
          <View key={pillar.id} style={styles.listItem}>
            <Text style={styles.listTitle}>
              {pillar.name} — {pillar.score}/100
            </Text>
            <Text style={styles.body}>{pillar.summary}</Text>
          </View>
        ))}
        <PdfSectionTitle title="Recommendations" subtitle="Prioritized improvements with business impact" />
        {profile.recommendations.slice(0, 4).map((rec) => (
          <View key={rec.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{rec.title}</Text>
            <Text style={styles.body}>{rec.whyItMatters}</Text>
          </View>
        ))}
      </Page>

      <Page size="LETTER" style={styles.page}>
        <PdfReportHeader
          clientName={data.companyName}
          generatedDate={data.generatedDate}
          documentLabel="Roadmap & Projects"
        />
        <PdfReportFooter generatedDate={data.generatedDate} clientName={data.companyName} />
        <PdfSectionTitle title="Strategic Roadmap" subtitle="Quarter-by-quarter planning" />
        {profile.roadmapInitiatives.slice(0, 4).map((item) => (
          <View key={item.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.description}</Text>
          </View>
        ))}
        <PdfSectionTitle title="Project Execution" subtitle="Managed initiatives with measurable outcomes" />
        {dashboard.projects.map((project) => (
          <View key={project.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{project.title}</Text>
            <Text style={styles.body}>{project.businessOutcome}</Text>
          </View>
        ))}
      </Page>

      <Page size="LETTER" style={styles.page}>
        <PdfReportHeader
          clientName={data.companyName}
          generatedDate={data.generatedDate}
          documentLabel="Executive Reporting & Partnership"
        />
        <PdfReportFooter generatedDate={data.generatedDate} clientName={data.companyName} />
        <PdfSectionTitle title="Quarterly Reviews" subtitle="Executive accountability every quarter" />
        {dashboard.quarterlyReview.executiveSummary.map((line) => (
          <Text key={line} style={styles.body}>
            • {line}
          </Text>
        ))}
        <PdfSectionTitle title="Budget Planning" subtitle="Approved spend aligned with roadmap priorities" />
        <Text style={styles.body}>
          Annual plan {formatDemoCurrency(dashboard.budget.planned)} · Approved{" "}
          {formatDemoCurrency(dashboard.budget.approved)} · Remaining{" "}
          {formatDemoCurrency(dashboard.budget.remaining)}
        </Text>
        <PdfSectionTitle title="Business Outcomes" subtitle="Technology strategy that drives measurable growth" />
        <Text style={styles.body}>
          StackScore connects assessments, recommendations, roadmaps, projects, quarterly reviews,
          executive reports, and budget planning into one ongoing Strategic IT Consulting partnership.
        </Text>
        <PdfSectionTitle title="Next Step" subtitle="Begin your technology strategy with Bobkat IT" />
        <Text style={styles.body}>
          Purchase your Technology Maturity Assessment or schedule a discovery call with {BRAND.companyName}.
        </Text>
      </Page>
    </Document>
  );
}
