import React from "react";
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
import type { InvoiceStatus } from "@/generated/prisma/client";

registerPdfFonts();

/** Invoice-specific page metrics — tighter than report PDFs for one-page fit. */
const INVOICE_PAGE = {
  paddingTop: 36,
  paddingBottom: 52,
  paddingHorizontal: 40,
  footerHeight: 38,
} as const;

const INVOICE_TAGLINE = "Technology made clear.";

const styles = StyleSheet.create({
  page: {
    paddingTop: INVOICE_PAGE.paddingTop,
    paddingBottom: INVOICE_PAGE.paddingBottom,
    paddingHorizontal: INVOICE_PAGE.paddingHorizontal,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.slate,
    backgroundColor: COLORS.white,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  headerLeft: { flex: 1 },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  logo: { width: 30, height: 30, objectFit: "contain" },
  brandBlock: { flexDirection: "column" },
  brandName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  brandTagline: {
    fontSize: 7,
    color: COLORS.muted,
    marginTop: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  invoiceNumber: { fontSize: 9, color: COLORS.muted },
  headerRight: { alignItems: "flex-end", minWidth: 140 },
  balanceDueLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  balanceDueValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 5,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  statusBadgeText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metadataBlock: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metadataItem: { width: "19%" },
  metadataLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  metadataValue: { fontSize: 8, color: COLORS.slate, lineHeight: 1.3 },
  sectionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  billToPanel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: "row",
  },
  billToLeft: { flex: 1, paddingRight: 10 },
  billToDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  billToRight: { flex: 1, paddingLeft: 10 },
  billToPrimary: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 2,
  },
  billToLine: { fontSize: 8, color: COLORS.slate, lineHeight: 1.4 },
  relatedLabel: {
    fontSize: 7,
    color: COLORS.muted,
    marginBottom: 3,
    lineHeight: 1.35,
  },
  relatedTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.35,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.navy,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
  },
  tableRowAlt: { backgroundColor: "#FAFBFC" },
  descCol: { width: "54%" },
  qtyCol: { width: "8%", textAlign: "center" },
  unitCol: { width: "18%", textAlign: "right" },
  amtCol: { width: "20%", textAlign: "right" },
  lineTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.35,
  },
  lineDescription: {
    marginTop: 2,
    fontSize: 7,
    color: COLORS.muted,
    lineHeight: 1.35,
  },
  numericCell: { fontSize: 8, color: COLORS.slate, lineHeight: 1.35 },
  amountCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    lineHeight: 1.35,
  },
  paymentTotalsRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 10,
    alignItems: "stretch",
  },
  paymentPanel: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  paymentPanelAccent: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.navyLight,
  },
  panelHeading: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  panelText: {
    fontSize: 8,
    color: COLORS.slate,
    lineHeight: 1.4,
    marginBottom: 3,
  },
  paymentLink: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textDecoration: "none",
    marginTop: 2,
  },
  totalsPanel: {
    width: 210,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
  },
  totalsSectionLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    gap: 8,
  },
  totalLabel: { fontSize: 8, color: COLORS.muted },
  totalValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.slate,
    textAlign: "right",
  },
  grandTotalRow: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  grandTotalLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textAlign: "right",
  },
  termsPanel: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surface,
  },
  notesPanel: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  noteText: { fontSize: 8, color: COLORS.slate, lineHeight: 1.45, marginBottom: 4 },
  thankYou: {
    fontSize: 8,
    color: COLORS.navy,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.45,
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: INVOICE_PAGE.paddingHorizontal,
    right: INVOICE_PAGE.paddingHorizontal,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerBrand: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 1,
  },
  footerLine: { fontSize: 6.5, color: COLORS.muted, lineHeight: 1.35 },
  footerCenter: { width: "36%", textAlign: "center" },
  footerTagline: {
    fontSize: 6.5,
    color: COLORS.muted,
    fontStyle: "italic",
    lineHeight: 1.35,
  },
  footerRight: { width: "22%", alignItems: "flex-end" },
  watermark: {
    position: "absolute",
    top: "40%",
    left: "16%",
    transform: "rotate(-35deg)",
    opacity: 0.05,
  },
  watermarkText: {
    fontSize: 72,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    letterSpacing: 6,
  },
});

export type { InvoicePdfData } from "@/lib/pdf/invoice-pdf-data";

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const badge = INVOICE_PDF_STATUS_BADGE[status];
  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor },
      ]}
    >
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

function InvoiceFooter({ invoiceNumber }: { invoiceNumber: string }) {
  const websiteUrl = normalizeWebsiteUrl(BRAND.website);

  return (
    <View style={styles.footer} fixed>
      <View style={{ width: "34%" }}>
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

function TotalsCard({ data }: { data: InvoicePdfData }) {
  const showSplitSummary =
    data.oneTimeSubtotalCents > 0 && data.recurringSubtotalCents > 0;

  return (
    <View style={styles.totalsPanel}>
      {showSplitSummary ? (
        <>
          <Text style={styles.totalsSectionLabel}>Charge Summary</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>One-time</Text>
            <Text style={styles.totalValue}>
              {formatInvoiceMoney(data.oneTimeSubtotalCents, data.currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Recurring</Text>
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
  );
}

function SecurePaymentPanel({ data }: { data: InvoicePdfData }) {
  if (!data.paymentUrl) return null;

  return (
    <View style={styles.paymentPanelAccent}>
      <Text style={styles.panelHeading}>Secure Online Payment</Text>
      <Text style={styles.panelText}>
        Pay securely online using the link below. Payment is processed through Stripe.
      </Text>
      <Link src={data.paymentUrl} style={styles.paymentLink}>
        Pay Invoice Online →
      </Link>
      {data.acceptedPaymentMethods ? (
        <Text style={[styles.panelText, { marginTop: 4, fontSize: 7, color: COLORS.muted }]}>
          {data.acceptedPaymentMethods}
        </Text>
      ) : null}
    </View>
  );
}

function relatedRecordHeading(kind: "tip" | "project" | "deposit") {
  if (kind === "tip") return "Related Technology Improvement Plan";
  if (kind === "project") return "Related Project";
  return "Related Deposit";
}

export function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
  const websiteUrl = normalizeWebsiteUrl(BRAND.website);
  const hasPaymentPanel = Boolean(data.paymentUrl);

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
              <View style={styles.brandBlock}>
                <Text style={styles.brandName}>{BRAND.companyName}</Text>
                <Text style={styles.brandTagline}>{INVOICE_TAGLINE}</Text>
              </View>
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
          <MetadataItem label="Invoice Number" value={data.invoiceNumber} />
          <MetadataItem label="Issue Date" value={formatInvoiceDate(data.issueDate)} />
          <MetadataItem label="Due Date" value={formatInvoiceDate(data.dueDate)} />
          <MetadataItem label="Payment Terms" value={data.paymentTermsLabel} />
          <MetadataItem label="Status" value={formatInvoiceStatusLabel(data.status)} />
        </View>

        <Text style={styles.sectionLabel}>Bill To</Text>
        <View style={styles.billToPanel}>
          <View style={styles.billToLeft}>
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
          </View>
          {data.relatedRecord ? (
            <>
              <View style={styles.billToDivider} />
              <View style={styles.billToRight}>
                <Text style={styles.relatedLabel}>
                  {relatedRecordHeading(data.relatedRecord.kind)}
                </Text>
                <Text style={styles.relatedTitle}>{data.relatedRecord.label}</Text>
              </View>
            </>
          ) : null}
        </View>

        <LineItemsTableHeader />
        {data.lineItems.map((line, index) => (
          <View
            key={`${line.description}-${index}`}
            style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
            wrap={false}
          >
            <View style={styles.descCol}>
              <Text style={styles.lineTitle}>{line.description}</Text>
              {line.clientNote ? (
                <Text style={styles.lineDescription}>{line.clientNote}</Text>
              ) : null}
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

        <View style={styles.paymentTotalsRow} wrap={false}>
          {hasPaymentPanel ? (
            <SecurePaymentPanel data={data} />
          ) : (
            <View style={styles.paymentPanel}>
              <Text style={styles.panelHeading}>Payment</Text>
              <Text style={styles.panelText}>
                Please remit payment according to the terms below.
              </Text>
            </View>
          )}
          <TotalsCard data={data} />
        </View>

        <View style={styles.termsPanel}>
          <Text style={styles.panelHeading}>Payment Terms</Text>
          <Text style={styles.panelText}>{data.paymentTermsLabel}</Text>
          {data.dueDate ? (
            <Text style={styles.panelText}>
              Payment is due by {formatInvoiceDate(data.dueDate)}.
            </Text>
          ) : null}
        </View>

        <View style={styles.notesPanel}>
          <Text style={styles.panelHeading}>Invoice Notes</Text>
          {data.contextNote ? <Text style={styles.noteText}>{data.contextNote}</Text> : null}
          {data.clientNotes ? <Text style={styles.noteText}>{data.clientNotes}</Text> : null}
          <Text style={styles.thankYou}>
            Thank you for your business. {BRAND.companyName} appreciates the opportunity to support
            your technology goals.
          </Text>
          <Text style={styles.noteText}>
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
