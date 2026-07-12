import { describe, expect, it } from "vitest";
import {
  buildInvoiceContextNote,
  formatInvoiceDate,
  formatInvoiceQuantity,
  mapInvoiceToPdfData,
  parseBillToAddress,
  resolvePaymentUrl,
} from "@/lib/pdf/invoice-pdf-data";

describe("invoice pdf formatting", () => {
  it("formats invoice dates in readable long form", () => {
    expect(formatInvoiceDate(new Date("2026-07-12T12:00:00.000Z"))).toBe("July 12, 2026");
    expect(formatInvoiceDate(null)).toBe("—");
  });

  it("parses billing address json into printable lines", () => {
    expect(
      parseBillToAddress({
        addressLine1: "123 Main Street",
        addressLine2: "Suite 400",
        city: "Houston",
        state: "TX",
        postalCode: "77002",
      }).lines,
    ).toEqual(["123 Main Street", "Suite 400", "Houston, TX 77002"]);
  });

  it("formats quantities without trailing zeros", () => {
    expect(formatInvoiceQuantity(1)).toBe("1");
    expect(formatInvoiceQuantity("2.50")).toBe("2.5");
  });
});

describe("mapInvoiceToPdfData", () => {
  const baseInvoice = {
    invoiceNumber: "INV-001",
    status: "sent" as const,
    issueDate: new Date("2026-07-01T00:00:00.000Z"),
    dueDate: new Date("2026-07-31T00:00:00.000Z"),
    paymentTermsDays: 30,
    billToName: "Jane Doe",
    billToEmail: "billing@example.com",
    billToPhone: "(713) 555-0100",
    billToAddressJson: {
      addressLine1: "123 Main Street",
      city: "Houston",
      state: "TX",
      postalCode: "77002",
    },
    clientNotes: "Thank you.",
    currency: "usd",
    subtotalCents: 100000,
    discountCents: 0,
    taxCents: 0,
    creditCents: 5000,
    depositAppliedCents: 10000,
    totalCents: 85000,
    amountPaidCents: 25000,
    balanceDueCents: 60000,
    stripePaymentLinkUrl: "https://checkout.stripe.com/pay/demo",
    onlinePaymentEnabled: true,
    client: { companyName: "Acme Inc." },
    tip: { title: "2026 Technology Roadmap" },
    lineItems: [
      {
        description: "Managed IT Services",
        clientNote: "February 2026 service period",
        quantity: 1,
        unitPriceCents: 50000,
        amountCents: 50000,
        lineKind: "recurring" as const,
        internalCostCents: 12000,
      },
      {
        description: "Project milestone",
        clientNote: null,
        quantity: 1,
        unitPriceCents: 50000,
        amountCents: 50000,
        lineKind: "one_time" as const,
        internalCostCents: 30000,
      },
    ],
  };

  it("maps client-safe invoice fields and omits internal-only data", () => {
    const mapped = mapInvoiceToPdfData({
      ...baseInvoice,
      internalNotes: "Internal margin review",
      stripeCheckoutSessionId: "cs_test_secret",
      stripePaymentIntentId: "pi_test_secret",
    });

    expect(mapped.billToCompanyName).toBe("Acme Inc.");
    expect(mapped.billToContactName).toBe("Jane Doe");
    expect(mapped.billToAddress.lines).toContain("123 Main Street");
    expect(mapped.oneTimeSubtotalCents).toBe(50000);
    expect(mapped.recurringSubtotalCents).toBe(50000);
    expect(mapped.paymentUrl).toBe("https://checkout.stripe.com/pay/demo");
    expect(mapped.acceptedPaymentMethods).toContain("Credit card");
    expect(mapped.lineItems[0]?.clientNote).toBe("February 2026 service period");
    expect(mapped).not.toHaveProperty("internalNotes");
    expect(mapped).not.toHaveProperty("stripeCheckoutSessionId");
    expect(mapped).not.toHaveProperty("stripePaymentIntentId");
    expect(mapped.lineItems[0]).not.toHaveProperty("internalCostCents");
  });

  it("does not expose payment links for draft or paid invoices", () => {
    expect(
      resolvePaymentUrl({
        ...baseInvoice,
        status: "draft",
        stripePaymentLinkUrl: "https://checkout.stripe.com/pay/demo",
        onlinePaymentEnabled: true,
        balanceDueCents: 60000,
      }),
    ).toBeNull();

    expect(
      resolvePaymentUrl({
        ...baseInvoice,
        status: "paid",
        balanceDueCents: 0,
      }),
    ).toBeNull();
  });

  it("builds contextual notes for related records", () => {
    expect(
      buildInvoiceContextNote({
        relatedRecord: { kind: "tip", label: "2026 Technology Roadmap" },
        depositAppliedCents: 0,
      }),
    ).toContain("Technology Improvement Plan");
  });
});
