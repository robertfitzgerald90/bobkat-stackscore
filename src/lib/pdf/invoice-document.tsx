import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  formatInvoiceStatusLabel,
  INVOICE_PDF_STATUS_BADGE,
  mapInvoiceToPdfData,
  normalizeWebsiteUrl,
  type InvoicePdfData,
  type InvoicePdfSource,
} from "@/lib/pdf/invoice-pdf-data";
import { COLORS, registerPdfFonts } from "@/lib/pdf/shared";
import { getPdfLogoPath } from "@/lib/pdf/shared/constants";
import { PDF_LAYOUT } from "@/lib/pdf/shared/layout";
import type { InvoiceStatus } from "@/generated/prisma/client";

registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    paddingTop: PDF_LAYOUT.paddingTop,
    paddingBottom: PDF_LAYOUT.paddingBottom,
    paddingHorizontal: PDF_LAYOUT.paddingHorizontal,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    gap: 16,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  logo: {
    width: 34,
    height: 34,
    objectFit: "contain",
  },
  brandName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 10,
    color: COLORS.muted,
  },
  headerRight: {
    alignItems: "flex-end",
    minWidth: 170,
  },
  balanceDueLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  balanceDueValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 8,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusBadgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metadataBlock: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metadataItem: {
    width: "31%",
    minWidth: 120,
  },
  metadataLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  metadataValue: {
    fontSize: 9,
    color: COLORS.slate,
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  billToPanel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
  },
  billToPrimary: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 2,
  },
  billToLine: {
    fontSize: 9,
    color: COLORS.slate,
    lineHeight: 1.5,
  },
  relatedRecord: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.navy,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  continuationHeaderWrap: {
    position: "absolute",
    top: PDF_LAYOUT.paddingTop,
    left: PDF_LAYOUT.paddingHorizontal,
    right: PDF_LAYOUT.paddingHorizontal,
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  continuationHeaderCell: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    backgroundColor: COLORS.navy,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "flex-start",
  },
  tableRowAlt: {
    backgroundColor: "#FAFBFC",
  },
  descCol: { width: "52%" },
  qtyCol: { width: "10%", textAlign: "right" },
  unitCol: { width: "18%", textAlign: "right" },
  amtCol: { width: "20%", textAlign: "right" },
  lineTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    lineHeight: 1.45,
  },
  lineDescription: {
    marginTop: 3,
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.45,
  },
  numericCell: {
    fontSize: 9,
    color: COLORS.slate,
    lineHeight: 1.45,
  },
  amountCell: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    lineHeight: 1.45,
  },
  totalsWrap: {
    marginTop: 14,
    alignItems: "flex-end",
  },
  totalsPanel: {
    width: 260,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  totalsSectionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 6,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    gap: 12,
  },
  totalLabel: {
    fontSize: 9,
    color: COLORS.muted,
  },
  totalValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    textAlign: "right",
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.navy,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grandTotalValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textAlign: "right",
  },
  paymentSection: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    backgroundColor: COLORS.navyLight,
  },
  paymentTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  paymentLine: {
    fontSize: 9,
    color: COLORS.slate,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  paymentLink: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textDecoration: "underline",
    marginTop: 4,
  },
  notesSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  noteBlock: {
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 9,
    color: COLORS.slate,
    lineHeight: 1.55,
  },
  thankYou: {
    fontSize: 9,
    color: COLORS.navy,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: PDF_LAYOUT.paddingHorizontal,
    right: PDF_LAYOUT.paddingHorizontal,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  footerLeft: {
    width: "34%",
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 2,
  },
  footerLine: {
    fontSize: 7,
    color: COLORS.muted,
    lineHeight: 1.45,
  },
  footerCenter: {
    width: "32%",
    textAlign: "center",
  },
  footerTagline: {
    fontSize: 7,
    color: COLORS.muted,
    fontStyle: "italic",
    lineHeight: 1.45,
  },
  footerRight: {
    width: "24%",
    alignItems: "flex-end",
  },
  watermark: {
    position: "absolute",
    top: "42%",
    left: "18%",
    transform: "rotate(-35deg)",
    opacity: 0.06,
  },
  watermarkText: {
    fontSize: 88,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    letterSpacing: 8,
  },
});

export type { InvoicePdfData } from "@/lib/pdf/invoice-pdf-data";

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const badge = INVOICE_PDF_STATUS_BADGE[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor }]}>
      <Text style={[styles.statusBadgeText, { color: badge.color }]}>
        {formatInvoiceStatusLabel(status)}
      </Text>
    </View>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metadataItem}>
      <Text style={styles.metadataLabel}>{label}</Text>
      <Text style={styles.metadataValue}>{value}</Text>
    </View>
  );
}

function LineItemsTableHeader() {
  return (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderCell, styles.descCol]}>Description</Text>
      <Text style={[styles.tableHeaderCell, styles.qtyCol]}>Qty</Text>
      <Text style={[styles.tableHeaderCell, styles.unitCol]}>Rate</Text>
      <Text style={[styles.tableHeaderCell, styles.amtCol]}>Amount</Text>
    </View>
  );
}

function ContinuationLineItemsHeader() {
  return (
    <View fixed style={styles.continuationHeaderWrap}>
      <Text
        style={[styles.continuationHeaderCell, styles.descCol, { borderTopLeftRadius: 4 }]}
        render={({ pageNumber }) => (pageNumber > 1 ? "Description" : "")}
      />
      <Text
        style={[styles.continuationHeaderCell, styles.qtyCol]}
        render={({ pageNumber }) => (pageNumber > 1 ? "Qty" : "")}
      />
      <Text
        style={[styles.continuationHeaderCell, styles.unitCol]}
        render={({ pageNumber }) => (pageNumber > 1 ? "Rate" : "")}
      />
      <Text
        style={[styles.continuationHeaderCell, styles.amtCol, { borderTopRightRadius: 4 }]}
        render={({ pageNumber }) => (pageNumber > 1 ? "Amount" : "")}
      />
    </View>
  );
}

function InvoiceFooter({ invoiceNumber }: { invoiceNumber: string }) {
  const websiteUrl = normalizeWebsiteUrl(BRAND.website);

  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerLeft}>
        <Text style={styles.footerBrand}>{BRAND.companyName}</Text>
        <Link src={websiteUrl} style={styles.footerLine}>
          {BRAND.website}
        </Link>
        <Link src={`mailto:${BRAND.email}`} style={styles.footerLine}>
          {BRAND.email}
        </Link>
      </View>
      <View style={styles.footerCenter}>
        <Text style={styles.footerTagline}>Reduce complexity. Increase capability.</Text>
      </View>
      <View style={styles.footerRight}>
        <Text style={styles.footerLine}>{invoiceNumber}</Text>
        <Text
          style={styles.footerLine}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </View>
    </View>
  );
}

function TotalsSection({ data }: { data: InvoicePdfData }) {
  const showSplitSummary =
    data.oneTimeSubtotalCents > 0 && data.recurringSubtotalCents > 0;

  return (
    <View style={styles.totalsWrap} wrap={false} minPresenceAhead={140}>
      <View style={styles.totalsPanel}>
        {showSplitSummary ? (
          <>
            <Text style={styles.totalsSectionLabel}>Charge Summary</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>One-time charges</Text>
              <Text style={styles.totalValue}>
                {formatInvoiceMoney(data.oneTimeSubtotalCents, data.currency)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Recurring charges</Text>
              <Text style={styles.totalValue}>
                {formatInvoiceMoney(data.recurringSubtotalCents, data.currency)}
              </Text>
            </View>
          </>
        ) : null}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>
            {formatInvoiceMoney(data.subtotalCents, data.currency)}
          </Text>
        </View>

        {data.discountCents > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={styles.totalValue}>
              -{formatInvoiceMoney(data.discountCents, data.currency)}
            </Text>
          </View>
        ) : null}

        {data.taxCents > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>{formatInvoiceMoney(data.taxCents, data.currency)}</Text>
          </View>
        ) : null}

        {data.depositAppliedCents > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Deposit applied</Text>
            <Text style={styles.totalValue}>
              -{formatInvoiceMoney(data.depositAppliedCents, data.currency)}
            </Text>
          </View>
        ) : null}

        {data.creditCents > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Credits</Text>
            <Text style={styles.totalValue}>
              -{formatInvoiceMoney(data.creditCents, data.currency)}
            </Text>
          </View>
        ) : null}

        {data.amountPaidCents > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Payments received</Text>
            <Text style={styles.totalValue}>
              -{formatInvoiceMoney(data.amountPaidCents, data.currency)}
            </Text>
          </View>
        ) : null}

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Balance due</Text>
          <Text style={styles.grandTotalValue}>
            {formatInvoiceMoney(data.balanceDueCents, data.currency)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
  const websiteUrl = normalizeWebsiteUrl(BRAND.website);

  return (
    <Document title={`Invoice ${data.invoiceNumber}`} author={BRAND.companyName}>
      <Page size="LETTER" style={styles.page} wrap>
        {data.status === "draft" ? (
          <View style={styles.watermark} fixed>
            <Text style={styles.watermarkText}>DRAFT</Text>
          </View>
        ) : null}

        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.headerBrandRow}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={getPdfLogoPath()} style={styles.logo} />
              <Text style={styles.brandName}>{BRAND.companyName}</Text>
            </View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.balanceDueLabel}>Balance Due</Text>
            <Text style={styles.balanceDueValue}>
              {formatInvoiceMoney(data.balanceDueCents, data.currency)}
            </Text>
            <StatusBadge status={data.status} />
          </View>
        </View>

        <View style={styles.metadataBlock}>
          <View style={styles.metadataGrid}>
            <MetadataItem label="Invoice Number" value={data.invoiceNumber} />
            <MetadataItem label="Issue Date" value={formatInvoiceDate(data.issueDate)} />
            <MetadataItem label="Due Date" value={formatInvoiceDate(data.dueDate)} />
            <MetadataItem label="Payment Terms" value={data.paymentTermsLabel} />
            <MetadataItem label="Status" value={formatInvoiceStatusLabel(data.status)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.billToPanel}>
            <Text style={styles.billToPrimary}>{data.billToCompanyName}</Text>
            {data.billToContactName ? (
              <Text style={styles.billToLine}>{data.billToContactName}</Text>
            ) : null}
            {data.billToEmail ? <Text style={styles.billToLine}>{data.billToEmail}</Text> : null}
            {data.billToPhone ? <Text style={styles.billToLine}>{data.billToPhone}</Text> : null}
            {data.billToAddress.lines.map((line) => (
              <Text key={line} style={styles.billToLine}>
                {line}
              </Text>
            ))}
            {data.relatedRecord ? (
              <Text style={styles.relatedRecord}>
                Related {data.relatedRecord.kind === "tip" ? "Technology Improvement Plan" : data.relatedRecord.kind === "project" ? "Project" : "Deposit"}:{" "}
                {data.relatedRecord.label}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <LineItemsTableHeader />
          <ContinuationLineItemsHeader />
          {data.lineItems.map((line, index) => (
            <View
              key={`${line.description}-${index}`}
              style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
              wrap={false}
              minPresenceAhead={72}
            >
              <View style={styles.descCol}>
                <Text style={styles.lineTitle}>{line.description}</Text>
                {line.clientNote ? <Text style={styles.lineDescription}>{line.clientNote}</Text> : null}
              </View>
              <Text style={[styles.numericCell, styles.qtyCol]}>{line.quantity}</Text>
              <Text style={[styles.numericCell, styles.unitCol]}>
                {formatInvoiceMoney(line.unitPriceCents, data.currency)}
              </Text>
              <Text style={[styles.amountCell, styles.amtCol]}>
                {formatInvoiceMoney(line.amountCents, data.currency)}
              </Text>
            </View>
          ))}
        </View>

        <TotalsSection data={data} />

        <View style={styles.paymentSection} wrap={false} minPresenceAhead={90}>
          <Text style={styles.paymentTitle}>Payment Terms</Text>
          <Text style={styles.paymentLine}>{data.paymentTermsLabel}</Text>
          {data.dueDate ? (
            <Text style={styles.paymentLine}>Payment due by {formatInvoiceDate(data.dueDate)}.</Text>
          ) : null}
          {data.paymentUrl ? (
            <Link src={data.paymentUrl} style={styles.paymentLink}>
              Pay Invoice Online
            </Link>
          ) : null}
          {data.acceptedPaymentMethods ? (
            <Text style={styles.paymentLine}>Accepted payment methods: {data.acceptedPaymentMethods}</Text>
          ) : null}
        </View>

        <View style={styles.notesSection} wrap={false} minPresenceAhead={80}>
          {data.clientNotes ? (
            <View style={styles.noteBlock}>
              <Text style={styles.noteTitle}>Invoice Notes</Text>
              <Text style={styles.noteText}>{data.clientNotes}</Text>
            </View>
          ) : null}
          {data.contextNote ? (
            <View style={styles.noteBlock}>
              <Text style={styles.noteText}>{data.contextNote}</Text>
            </View>
          ) : null}
          <Text style={styles.thankYou}>
            Thank you for your business. {BRAND.companyName} appreciates the opportunity to support your technology goals.
          </Text>
          <Text style={[styles.noteText, { marginTop: 6 }]}>
            Questions about this invoice? Contact us at {BRAND.email}
            {BRAND.website ? ` or visit ${websiteUrl.replace(/^https?:\/\//, "")}` : ""}.
          </Text>
        </View>

        <InvoiceFooter invoiceNumber={data.invoiceNumber} />
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(invoice: InvoicePdfSource): Promise<Buffer> {
  const data = mapInvoiceToPdfData(invoice);
  const { renderToBuffer } = await import("@react-pdf/renderer");
  return renderToBuffer(<InvoicePdfDocument data={data} />);
}
