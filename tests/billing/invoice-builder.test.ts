import { describe, expect, it } from "vitest";
import {
  computeDraftLineTotalCents,
  computeManualInvoiceSummary,
  createDefaultManualInvoiceDraft,
  createLaborLineDraft,
  getTotalLabel,
  hasManualInvoiceValidationErrors,
  serializeManualInvoicePayload,
  validateManualInvoiceDraft,
} from "@/lib/billing/invoice-builder";

describe("invoice builder", () => {
  it("computes line totals without floating point drift", () => {
    const line = createLaborLineDraft(15000);
    line.quantity = "2.5";
    expect(computeDraftLineTotalCents(line)).toBe(37500);
  });

  it("calculates contingency as a separate summary line", () => {
    const draft = createDefaultManualInvoiceDraft("budgetary");
    draft.lineItems = [
      {
        ...createLaborLineDraft(10000),
        itemName: "Hardware",
        unitPrice: "1000.00",
        quantity: "1",
      },
    ];
    draft.budgetaryOptions.contingencyPercent = 10;
    const summary = computeManualInvoiceSummary(draft);
    expect(summary.subtotalCents).toBe(100000);
    expect(summary.contingencyCents).toBe(10000);
    expect(summary.totalCents).toBe(110000);
  });

  it("requires a title and at least one valid line item", () => {
    const draft = createDefaultManualInvoiceDraft("standard");
    const errors = validateManualInvoiceDraft(draft);
    expect(hasManualInvoiceValidationErrors(errors)).toBe(true);
    expect(errors.title).toBeTruthy();
    expect(errors.lineItems).toBeTruthy();
  });

  it("serializes manual invoice payload for draft creation", () => {
    const draft = createDefaultManualInvoiceDraft("labor");
    draft.title = "Monthly Support Labor";
    draft.dueDate = "2026-08-01";
    draft.lineItems = [createLaborLineDraft(15000)];
    draft.lineItems[0]!.itemName = "Professional Services Labor";
    draft.lineItems[0]!.quantity = "4";

    const summary = computeManualInvoiceSummary(draft);
    const payload = serializeManualInvoicePayload(draft, summary);

    expect(payload.documentType).toBe("labor");
    expect(payload.title).toBe("Monthly Support Labor");
    expect(payload.lineItems[0]?.unit).toBe("Hour");
    expect(payload.lineItems[0]?.unitPriceCents).toBe(15000);
    expect(getTotalLabel("budgetary")).toBe("Estimated Total");
  });
});
