import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/branding";
import { formatMoney } from "@/lib/billing/money";
import { INVOICE_STATUS_LABELS } from "@/lib/billing/labels";
import { COLORS, registerPdfFonts } from "@/lib/pdf/shared";
import type { InvoiceStatus } from "@/generated/prisma/client";

registerPdfFonts();

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.slate,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brand: { fontSize: 12, fontFamily: "Helvetica-Bold", color: COLORS.navy },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: COLORS.navy, marginTop: 4 },
  meta: { fontSize: 9, color: COLORS.muted, lineHeight: 1.5 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.navy,
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: { color: COLORS.white, fontFamily: "Helvetica-Bold", fontSize: 8 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 8,
  },
  descCol: { width: "55%" },
  qtyCol: { width: "10%", textAlign: "right" },
  unitCol: { width: "15%", textAlign: "right" },
  amtCol: { width: "20%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  totals: { marginTop: 12, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, marginBottom: 4 },
  totalLabel: { color: COLORS.muted },
  totalValue: { fontFamily: "Helvetica-Bold" },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.navy,
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
  },
  grandTotalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: COLORS.navy },
  footer: { marginTop: 32, fontSize: 8, color: COLORS.muted, lineHeight: 1.5 },
});

export type InvoicePdfData = {
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date | null;
  dueDate: Date | null;
  billToName: string | null;
  billToEmail: string | null;
  clientNotes: string | null;
  currency: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  creditCents: number;
  depositAppliedCents: number;
  totalCents: number;
  amountPaidCents: number;
  balanceDueCents: number;
  lineItems: Array<{
    description: string;
    quantity: unknown;
    unitPriceCents: number;
    amountCents: number;
  }>;
  client: { companyName: string };
};

export function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
  return (
    <Document title={`Invoice ${data.invoiceNumber}`} author={BRAND.companyName}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{BRAND.companyName}</Text>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.meta}>{data.invoiceNumber}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.meta}>Status: {INVOICE_STATUS_LABELS[data.status]}</Text>
            {data.issueDate ? (
              <Text style={styles.meta}>Issue date: {data.issueDate.toLocaleDateString()}</Text>
            ) : null}
            {data.dueDate ? (
              <Text style={styles.meta}>Due date: {data.dueDate.toLocaleDateString()}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text>{data.billToName ?? data.client.companyName}</Text>
          {data.billToEmail ? <Text style={styles.meta}>{data.billToEmail}</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descCol]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.qtyCol]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.unitCol]}>Unit</Text>
            <Text style={[styles.tableHeaderCell, styles.amtCol]}>Amount</Text>
          </View>
          {data.lineItems.map((line, index) => (
            <View key={`${line.description}-${index}`} style={styles.tableRow}>
              <Text style={styles.descCol}>{line.description}</Text>
              <Text style={styles.qtyCol}>{String(line.quantity)}</Text>
              <Text style={styles.unitCol}>{formatMoney(line.unitPriceCents, data.currency)}</Text>
              <Text style={styles.amtCol}>{formatMoney(line.amountCents, data.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatMoney(data.subtotalCents, data.currency)}</Text>
          </View>
          {data.discountCents > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>-{formatMoney(data.discountCents, data.currency)}</Text>
            </View>
          ) : null}
          {data.taxCents > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>{formatMoney(data.taxCents, data.currency)}</Text>
            </View>
          ) : null}
          {data.depositAppliedCents > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Deposit applied</Text>
              <Text style={styles.totalValue}>
                -{formatMoney(data.depositAppliedCents, data.currency)}
              </Text>
            </View>
          ) : null}
          <View style={styles.grandTotal}>
            <Text style={styles.totalLabel}>Balance due</Text>
            <Text style={styles.grandTotalValue}>
              {formatMoney(data.balanceDueCents, data.currency)}
            </Text>
          </View>
        </View>

        {data.clientNotes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{data.clientNotes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          {BRAND.companyName} · {BRAND.website} · {BRAND.email}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(
  invoice: InvoicePdfData & { client: { companyName: string } },
): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  return renderToBuffer(<InvoicePdfDocument data={invoice} />);
}
