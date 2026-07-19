import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { formatCurrency } from "@/lib/technology-improvement-plan/pricing";
import type { PhaseProposalDetail } from "@/lib/phase-proposals/types";
import {
  COLORS,
  PdfCoverPage,
  PdfReportFooter,
  PdfReportHeader,
  PdfSectionTitle,
  registerPdfFonts,
} from "@/lib/pdf/shared";
import { formatGeneratedDate } from "@/lib/pdf/types";

registerPdfFonts();

const styles = StyleSheet.create({
  coverPage: {
    paddingTop: 0,
    paddingBottom: 80,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  page: {
    paddingTop: 88,
    paddingBottom: 80,
    paddingHorizontal: 54,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  section: { marginBottom: 18 },
  body: { fontSize: 10, lineHeight: 1.65, color: COLORS.slate, marginBottom: 6 },
  checklistItem: { flexDirection: "row", gap: 6, marginBottom: 4 },
  check: { fontSize: 9, fontFamily: "Helvetica-Bold", color: COLORS.success, width: 10 },
  checklistText: { flex: 1, fontSize: 9, lineHeight: 1.5, color: COLORS.slate },
  initiativeCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
  },
  initiativeTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 4,
  },
  meta: { fontSize: 8, color: COLORS.muted, marginBottom: 3 },
  investmentRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  investmentCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  investmentLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  investmentValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  investmentNote: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 8,
    lineHeight: 1.5,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate,
    width: 220,
    marginTop: 24,
    marginBottom: 6,
  },
  signatureLabel: { fontSize: 9, color: COLORS.muted },
});

function Checklist({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.checklistItem}>
          <Text style={styles.check}>✓</Text>
          <Text style={styles.checklistText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function PhaseProposalDocument({ data }: { data: PhaseProposalDetail }) {
  const snapshot = data.snapshot;
  const proposalDate = formatGeneratedDate(new Date(data.createdAt));

  return (
    <Document
      title={`${data.proposalNumber} — ${data.title}`}
      author={BRAND.companyName}
      subject="Phase Implementation Proposal"
    >
      <Page size="LETTER" style={styles.coverPage} wrap={false}>
        <PdfReportFooter
          generatedDate={proposalDate}
          clientName={snapshot.clientName}
          documentVersion={`v${data.version}`}
        />
        <PdfCoverPage
          eyebrow={`Prepared by ${BRAND.companyName}`}
          title="Implementation Proposal"
          subtitle={`${data.phaseSubtitle} — ${data.phaseName}`}
          clientName={snapshot.clientName}
          meta={[
            { label: "Proposal Number", value: data.proposalNumber },
            { label: "Version", value: `v${data.version}` },
            { label: "Proposal Date", value: proposalDate },
            ...(snapshot.assessmentDate
              ? [
                  {
                    label: "Assessment Date",
                    value: formatGeneratedDate(new Date(snapshot.assessmentDate)),
                  },
                ]
              : []),
            { label: "Timeline", value: data.timeline },
            { label: "Prepared By", value: data.preparedByName },
          ]}
          confidentialNotice="Confidential — proposal for authorized recipients only"
        />
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfReportHeader
          clientName={snapshot.clientName}
          generatedDate={proposalDate}
          documentLabel="Implementation Proposal"
        />
        <PdfReportFooter
          generatedDate={proposalDate}
          clientName={snapshot.clientName}
          documentVersion={`v${data.version}`}
        />

        <View style={styles.section}>
          <PdfSectionTitle
            title="Executive Summary"
            subtitle="Why this phase exists and the business value it delivers"
          />
          {snapshot.executiveSummary.split(/\n\n+/).map((paragraph) => (
            <Text key={paragraph.slice(0, 40)} style={styles.body}>
              {paragraph}
            </Text>
          ))}
          <Text style={styles.body}>
            Estimated StackScore improvement for this phase: +{data.expectedScoreImprovement}{" "}
            points.
          </Text>
        </View>

        <View style={styles.section}>
          <PdfSectionTitle
            title="Scope of Work"
            subtitle="Initiatives, activities, and deliverables included in this phase"
          />
          <Text style={[styles.body, { fontFamily: "Helvetica-Bold" }]}>
            Included initiatives
          </Text>
          <Checklist items={snapshot.scopeOfWork.includedInitiatives} />
          <Text style={[styles.body, { fontFamily: "Helvetica-Bold", marginTop: 8 }]}>
            Implementation activities
          </Text>
          <Checklist items={snapshot.scopeOfWork.implementationActivities} />
          <Text style={[styles.body, { fontFamily: "Helvetica-Bold", marginTop: 8 }]}>
            Deliverables
          </Text>
          <Checklist items={snapshot.scopeOfWork.deliverables} />
          <Text style={[styles.body, { marginTop: 8 }]}>
            Expected completion timeline: {snapshot.scopeOfWork.expectedTimeline}
          </Text>
          <Text style={[styles.body, { fontFamily: "Helvetica-Bold", marginTop: 8 }]}>
            Dependencies
          </Text>
          <Checklist items={snapshot.scopeOfWork.dependencies} />
          <Text style={[styles.body, { fontFamily: "Helvetica-Bold", marginTop: 8 }]}>
            Out of scope
          </Text>
          <Checklist items={snapshot.scopeOfWork.outOfScope} />
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfReportHeader
          clientName={snapshot.clientName}
          generatedDate={proposalDate}
          documentLabel="Implementation Proposal"
        />
        <PdfReportFooter
          generatedDate={proposalDate}
          clientName={snapshot.clientName}
          documentVersion={`v${data.version}`}
        />

        <View style={styles.section}>
          <PdfSectionTitle
            title="Business Outcomes"
            subtitle="Measurable improvements expected from this phase"
          />
          <Checklist
            items={snapshot.businessOutcomes.map(
              (outcome) => outcome.description || outcome.title,
            )}
          />
        </View>

        <View style={styles.section}>
          <PdfSectionTitle
            title="Included Initiatives"
            subtitle="Detailed scope for this phase only"
          />
          {snapshot.initiatives.map((initiative) => (
            <View key={initiative.recommendationId} style={styles.initiativeCard} wrap={false}>
              <Text style={styles.initiativeTitle}>{initiative.title}</Text>
              <Text style={styles.meta}>{initiative.description}</Text>
              <Text style={styles.meta}>Business benefit: {initiative.businessImpact}</Text>
              <Text style={styles.meta}>
                Estimated StackScore contribution: +{initiative.estimatedImpactPoints} points
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section} wrap={false}>
          <PdfSectionTitle
            title="Investment Summary"
            subtitle="Investment for this phase only — one-time and recurring are never combined"
          />
          <View style={styles.investmentRow}>
            <View style={styles.investmentCard}>
              <Text style={styles.investmentLabel}>One-Time Implementation Investment</Text>
              <Text style={styles.investmentValue}>
                {formatCurrency(data.oneTimeInvestment)}
              </Text>
            </View>
            {data.monthlyRecurringInvestment > 0 ? (
              <View style={styles.investmentCard}>
                <Text style={styles.investmentLabel}>Monthly Recurring Services</Text>
                <Text style={styles.investmentValue}>
                  {formatCurrency(data.monthlyRecurringInvestment)}/mo
                </Text>
              </View>
            ) : null}
          </View>
          {data.annualRecurringInvestment > 0 ? (
            <View style={[styles.investmentCard, { marginTop: 8 }]}>
              <Text style={styles.investmentLabel}>Annual Recurring Services</Text>
              <Text style={styles.investmentValue}>
                {formatCurrency(data.annualRecurringInvestment)}/year
              </Text>
            </View>
          ) : null}
          {data.monthlyRecurringInvestment > 0 ? (
            <Text style={styles.investmentNote}>
              Monthly services begin after successful implementation and client acceptance of this
              phase.
            </Text>
          ) : null}
        </View>
      </Page>

      <Page size="LETTER" style={styles.page} wrap>
        <PdfReportHeader
          clientName={snapshot.clientName}
          generatedDate={proposalDate}
          documentLabel="Implementation Proposal"
        />
        <PdfReportFooter
          generatedDate={proposalDate}
          clientName={snapshot.clientName}
          documentVersion={`v${data.version}`}
        />

        <View style={styles.section}>
          <PdfSectionTitle
            title="Assumptions"
            subtitle="Conditions required for successful delivery of this phase"
          />
          <Checklist items={snapshot.assumptions} />
        </View>

        <View style={styles.section} wrap={false}>
          <PdfSectionTitle
            title="Acceptance"
            subtitle="Approval applies to this phase only"
          />
          <Text style={styles.body}>
            By signing below, {snapshot.clientName} approves {data.phaseSubtitle} — {data.phaseName}{" "}
            as described in this proposal. Remaining Technology Roadmap phases remain optional and
            may be approved separately as priorities and budget allow.
          </Text>
          <Text style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Authorized Signature</Text>
          <Text style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Date</Text>
        </View>
      </Page>
    </Document>
  );
}
