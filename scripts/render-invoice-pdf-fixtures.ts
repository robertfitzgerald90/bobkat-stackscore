/**
 * Renders invoice PDF layout fixtures for visual inspection.
 * Usage: npx tsx scripts/render-invoice-pdf-fixtures.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { InvoiceLineKind, InvoiceStatus } from "../src/generated/prisma/client";
import { mapInvoiceToPdfData } from "../src/lib/pdf/invoice-pdf-data";
import { renderInvoicePdf } from "../src/lib/pdf/invoice-document";

const OUTPUT_DIR = path.join(process.cwd(), "tmp", "invoice-pdf-fixtures");

type FixtureLine = {
  description: string;
  clientNote?: string | null;
  quantity: number;
  unitPriceCents: number;
  lineKind?: InvoiceLineKind;
};

type Fixture = {
  name: string;
  status?: InvoiceStatus;
  lineItems: FixtureLine[];
  discountCents?: number;
  taxCents?: number;
  creditCents?: number;
  depositAppliedCents?: number;
  amountPaidCents?: number;
  paymentUrl?: string | null;
  clientNotes?: string | null;
  withRelatedPlan?: boolean;
};

function buildFixtureLines(lines: FixtureLine[]) {
  return lines.map((line, index) => ({
    description: line.description,
    clientNote: line.clientNote ?? null,
    quantity: line.quantity,
    unitPriceCents: line.unitPriceCents,
    amountCents: Math.round(line.quantity * line.unitPriceCents),
    lineKind: line.lineKind ?? ("one_time" as const),
    internalCostCents: 1000,
  }));
}

function sumLines(lines: ReturnType<typeof buildFixtureLines>) {
  return lines.reduce((sum, line) => sum + line.amountCents, 0);
}

async function renderFixture(fixture: Fixture) {
  const lineRows = buildFixtureLines(fixture.lineItems);
  const subtotalCents = sumLines(lineRows);
  const discountCents = fixture.discountCents ?? 0;
  const taxCents = fixture.taxCents ?? 0;
  const creditCents = fixture.creditCents ?? 0;
  const depositAppliedCents = fixture.depositAppliedCents ?? 0;
  const totalCents = subtotalCents - discountCents + taxCents - creditCents - depositAppliedCents;
  const amountPaidCents = fixture.amountPaidCents ?? 0;
  const balanceDueCents = Math.max(0, totalCents - amountPaidCents);

  const invoice = {
    invoiceNumber: "ACME-2026-0007",
    status: fixture.status ?? ("sent" as const),
    issueDate: new Date("2026-07-12T00:00:00.000Z"),
    dueDate: new Date("2026-08-11T00:00:00.000Z"),
    paymentTermsDays: 30,
    billToName: "Jane Smith",
    billToEmail: "billing@acmeinc.com",
    billToPhone: "(713) 555-0148",
    billToAddressJson: {
      addressLine1: "123 Main Street",
      city: "Houston",
      state: "TX",
      postalCode: "77002",
    },
    clientNotes: fixture.clientNotes ?? "Thank you for your continued partnership.",
    internalNotes: "Internal margin note — must not appear in PDF",
    currency: "usd",
    subtotalCents,
    discountCents,
    taxCents,
    creditCents,
    depositAppliedCents,
    totalCents,
    amountPaidCents,
    balanceDueCents,
    stripePaymentLinkUrl: fixture.paymentUrl === null ? null : fixture.paymentUrl ?? "https://checkout.stripe.com/c/pay/demo",
    onlinePaymentEnabled: fixture.paymentUrl !== null,
    client: { companyName: "Acme Inc." },
    tip: fixture.withRelatedPlan === false ? null : { title: "Acme Inc. 2026 Technology Improvement Plan v1" },
    project: null,
    deposit: null,
    lineItems: lineRows,
  };

  const pdf = await renderInvoicePdf(invoice);
  const data = mapInvoiceToPdfData(invoice);
  const filePath = path.join(OUTPUT_DIR, `${fixture.name}.pdf`);
  writeFileSync(filePath, pdf);
  return { filePath, pages: data.lineItems.length };
}

const FIXTURES: Fixture[] = [
  {
    name: "01-one-line-item",
    lineItems: [{ description: "Technology Assessment", quantity: 1, unitPriceCents: 50000 }],
  },
  {
    name: "02-four-line-items",
    lineItems: [
      { description: "Managed IT Services — July 2026", clientNote: "18 users", quantity: 18, unitPriceCents: 12500, lineKind: "recurring" },
      { description: "Microsoft 365 Management — July 2026", quantity: 18, unitPriceCents: 3500, lineKind: "recurring" },
      { description: "Endpoint Management Deployment — Phase 2", clientNote: "Milestone billing", quantity: 1, unitPriceCents: 1850000 },
      { description: "Backup & Disaster Recovery Setup", quantity: 1, unitPriceCents: 450000 },
    ],
    discountCents: 50000,
    taxCents: 2472525,
    depositAppliedCents: 500000,
    amountPaidCents: 250000,
  },
  {
    name: "03-six-line-items",
    lineItems: Array.from({ length: 6 }, (_, index) => ({
      description: `Professional Services Block ${index + 1}`,
      clientNote: index % 2 === 0 ? "Scoped deliverable package" : null,
      quantity: 1,
      unitPriceCents: 150000 + index * 25000,
    })),
  },
  {
    name: "04-long-descriptions",
    lineItems: [
      {
        description: "Comprehensive network infrastructure redesign including firewall migration, VLAN segmentation, and wireless access point deployment across multiple office locations",
        clientNote: "Includes after-hours cutover support and 30-day post-deployment warranty",
        quantity: 1,
        unitPriceCents: 1250000,
      },
    ],
  },
  {
    name: "05-no-payment-link",
    paymentUrl: null,
    lineItems: [{ description: "Consulting Services", quantity: 4, unitPriceCents: 25000 }],
  },
  {
    name: "06-deposit-applied",
    depositAppliedCents: 250000,
    lineItems: [{ description: "Project Milestone 2", quantity: 1, unitPriceCents: 1000000 }],
  },
  {
    name: "07-partial-payment",
    amountPaidCents: 300000,
    lineItems: [{ description: "Managed IT Services", quantity: 1, unitPriceCents: 750000 }],
  },
  {
    name: "08-discount-and-tax",
    discountCents: 10000,
    taxCents: 7200,
    lineItems: [{ description: "Hardware Procurement", quantity: 2, unitPriceCents: 20000 }],
  },
  {
    name: "09-recurring-and-onetime",
    lineItems: [
      { description: "Managed IT — August", quantity: 1, unitPriceCents: 225000, lineKind: "recurring" },
      { description: "New workstation deployment", quantity: 3, unitPriceCents: 85000, lineKind: "one_time" },
    ],
  },
  {
    name: "10-many-line-items-page-two",
    lineItems: Array.from({ length: 14 }, (_, index) => ({
      description: `Service Line Item ${index + 1}`,
      quantity: 1,
      unitPriceCents: 95000,
    })),
  },
  {
    name: "11-draft-watermark",
    status: "draft",
    lineItems: [{ description: "Draft Invoice Item", quantity: 1, unitPriceCents: 100000 }],
  },
  {
    name: "12-paid-no-watermark",
    status: "paid",
    amountPaidCents: 100000,
    paymentUrl: null,
    lineItems: [{ description: "Completed Engagement", quantity: 1, unitPriceCents: 100000 }],
  },
];

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const results: string[] = [];

  for (const fixture of FIXTURES) {
    const { filePath } = await renderFixture(fixture);
    results.push(filePath);
    console.log(`Wrote ${filePath}`);
  }

  console.log(`\nRendered ${results.length} fixture PDFs to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
