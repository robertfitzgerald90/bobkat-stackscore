import type { InvoiceDocumentType } from "@/generated/prisma/client";

export const INVOICE_LINE_UNITS = [
  "Each",
  "Hour",
  "Month",
  "Year",
  "Project",
  "License",
  "Device",
  "User",
  "Custom",
] as const;

export type InvoiceLineUnit = (typeof INVOICE_LINE_UNITS)[number];

export const DEFAULT_BUDGETARY_DISCLAIMER =
  "This document is provided for budgetary planning purposes only. Final pricing may change based on confirmed scope, quantities, vendor pricing, taxes, shipping, licensing, and implementation requirements.";

export type BudgetaryOptions = {
  showRange?: boolean;
  contingencyPercent?: number;
  includeTaxInEstimate?: boolean;
  includeShippingInEstimate?: boolean;
  disclaimer?: string;
};

export type ManualInvoiceLineDraft = {
  id: string;
  itemName: string;
  description: string;
  quantity: string;
  unit: InvoiceLineUnit;
  customUnit: string;
  unitPrice: string;
};

export type ManualInvoiceDraft = {
  documentType: InvoiceDocumentType;
  title: string;
  clientDescription: string;
  clientNotes: string;
  internalNotes: string;
  dueDate: string;
  expirationDate: string;
  lineItems: ManualInvoiceLineDraft[];
  discount: string;
  tax: string;
  shipping: string;
  showAdvancedSummary: boolean;
  showEstimateOptions: boolean;
  budgetaryOptions: BudgetaryOptions;
};

export type ManualInvoiceValidationErrors = {
  title?: string;
  lineItems?: string;
  lineItemErrors?: Record<string, Partial<Record<keyof ManualInvoiceLineDraft, string>>>;
  dueDate?: string;
  expirationDate?: string;
  discount?: string;
  tax?: string;
  shipping?: string;
};

export function createEmptyLineDraft(overrides?: Partial<ManualInvoiceLineDraft>): ManualInvoiceLineDraft {
  return {
    id: crypto.randomUUID(),
    itemName: "",
    description: "",
    quantity: "1",
    unit: "Each",
    customUnit: "",
    unitPrice: "",
    ...overrides,
  };
}

export function createLaborLineDraft(unitPriceCents: number): ManualInvoiceLineDraft {
  return createEmptyLineDraft({
    itemName: "Professional Services Labor",
    description: "",
    quantity: "1",
    unit: "Hour",
    unitPrice: (unitPriceCents / 100).toFixed(2),
  });
}

export function createDefaultManualInvoiceDraft(
  documentType: InvoiceDocumentType = "standard",
  laborRateCents?: number,
): ManualInvoiceDraft {
  const lineItems =
    documentType === "labor" && laborRateCents !== undefined
      ? [createLaborLineDraft(laborRateCents)]
      : [createEmptyLineDraft()];

  return {
    documentType,
    title: "",
    clientDescription: "",
    clientNotes: "",
    internalNotes: "",
    dueDate: "",
    expirationDate: "",
    lineItems,
    discount: "",
    tax: "",
    shipping: "",
    showAdvancedSummary: false,
    showEstimateOptions: false,
    budgetaryOptions: {},
  };
}

export function resolveLineUnit(line: Pick<ManualInvoiceLineDraft, "unit" | "customUnit">): string {
  if (line.unit === "Custom") {
    return line.customUnit.trim() || "Custom";
  }
  return line.unit;
}

export function parseMoneyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export function parseQuantityInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export function computeDraftLineTotalCents(line: ManualInvoiceLineDraft): number {
  const quantity = parseQuantityInput(line.quantity);
  const unitPriceCents = parseMoneyInput(line.unitPrice);
  if (quantity === null || unitPriceCents === null) return 0;
  return Math.round(quantity * unitPriceCents);
}

export type ManualInvoiceSummary = {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  contingencyCents: number;
  totalCents: number;
  estimatedLowCents: number | null;
  estimatedHighCents: number | null;
};

export function computeManualInvoiceSummary(draft: ManualInvoiceDraft): ManualInvoiceSummary {
  const subtotalCents = draft.lineItems.reduce(
    (sum, line) => sum + computeDraftLineTotalCents(line),
    0,
  );
  const discountCents = parseMoneyInput(draft.discount) ?? 0;
  const taxCents =
    draft.documentType === "budgetary" && !draft.budgetaryOptions.includeTaxInEstimate
      ? 0
      : parseMoneyInput(draft.tax) ?? 0;
  const shippingCents =
    draft.documentType === "budgetary" && !draft.budgetaryOptions.includeShippingInEstimate
      ? 0
      : parseMoneyInput(draft.shipping) ?? 0;

  const baseBeforeContingency = Math.max(0, subtotalCents - discountCents + taxCents + shippingCents);
  const contingencyPercent = draft.budgetaryOptions.contingencyPercent ?? 0;
  const contingencyCents =
    draft.documentType === "budgetary" && contingencyPercent > 0
      ? Math.round(baseBeforeContingency * (contingencyPercent / 100))
      : 0;

  const totalCents = baseBeforeContingency + contingencyCents;

  let estimatedLowCents: number | null = null;
  let estimatedHighCents: number | null = null;
  if (draft.documentType === "budgetary" && draft.budgetaryOptions.showRange) {
    estimatedLowCents = Math.round(totalCents * 0.9);
    estimatedHighCents = Math.round(totalCents * 1.1);
  }

  return {
    subtotalCents,
    discountCents,
    taxCents,
    shippingCents,
    contingencyCents,
    totalCents,
    estimatedLowCents,
    estimatedHighCents,
  };
}

export function validateManualInvoiceDraft(draft: ManualInvoiceDraft): ManualInvoiceValidationErrors {
  const errors: ManualInvoiceValidationErrors = {};
  const lineItemErrors: ManualInvoiceValidationErrors["lineItemErrors"] = {};

  if (!draft.title.trim()) {
    errors.title = "Invoice title is required";
  }

  const validLines = draft.lineItems.filter((line) => {
    const lineErrors: Partial<Record<keyof ManualInvoiceLineDraft, string>> = {};
    const hasItem = line.itemName.trim().length > 0;
    const quantity = parseQuantityInput(line.quantity);
    const unitPriceCents = parseMoneyInput(line.unitPrice);

    if (!hasItem) {
      lineErrors.itemName = "Item or service is required";
    }
    if (quantity === null) {
      lineErrors.quantity = "Enter a valid quantity";
    }
    if (unitPriceCents === null) {
      lineErrors.unitPrice = "Enter a valid unit price";
    }
    if (line.unit === "Custom" && !line.customUnit.trim()) {
      lineErrors.customUnit = "Enter a custom unit";
    }

    if (Object.keys(lineErrors).length > 0) {
      lineItemErrors[line.id] = lineErrors;
    }

    return hasItem && quantity !== null && unitPriceCents !== null;
  });

  if (validLines.length === 0) {
    errors.lineItems = "Add at least one valid line item";
  }

  if (Object.keys(lineItemErrors).length > 0) {
    errors.lineItemErrors = lineItemErrors;
  }

  if (parseMoneyInput(draft.discount) === null) {
    errors.discount = "Enter a valid discount amount";
  }
  if (parseMoneyInput(draft.tax) === null) {
    errors.tax = "Enter a valid tax amount";
  }
  if (parseMoneyInput(draft.shipping) === null) {
    errors.shipping = "Enter a valid shipping or other charge";
  }

  if (draft.documentType !== "budgetary" && !draft.dueDate.trim()) {
    errors.dueDate = "Due date is required";
  }

  return errors;
}

export function hasManualInvoiceValidationErrors(errors: ManualInvoiceValidationErrors): boolean {
  return Boolean(
    errors.title ||
      errors.lineItems ||
      errors.dueDate ||
      errors.expirationDate ||
      errors.discount ||
      errors.tax ||
      errors.shipping ||
      (errors.lineItemErrors && Object.keys(errors.lineItemErrors).length > 0),
  );
}

export function getTotalLabel(documentType: InvoiceDocumentType): string {
  if (documentType === "budgetary") return "Estimated Total";
  return "Total Due";
}

export function isCollectibleInvoice(documentType: InvoiceDocumentType): boolean {
  return documentType !== "budgetary";
}

export function buildLineDescription(itemName: string, description: string): string {
  const name = itemName.trim();
  const detail = description.trim();
  if (name && detail && detail !== name) {
    return `${name}\n${detail}`;
  }
  return name || detail || "Line item";
}

export function serializeManualInvoicePayload(
  draft: ManualInvoiceDraft,
  summary: ManualInvoiceSummary,
) {
  return {
    source: "manual" as const,
    documentType: draft.documentType,
    title: draft.title.trim(),
    clientDescription: draft.clientDescription.trim() || undefined,
    clientNotes: draft.clientNotes.trim() || undefined,
    internalNotes: draft.internalNotes.trim() || undefined,
    dueDate: draft.documentType !== "budgetary" && draft.dueDate ? draft.dueDate : undefined,
    expirationDate:
      draft.documentType === "budgetary" && draft.expirationDate ? draft.expirationDate : undefined,
    discountCents: summary.discountCents,
    taxCents: summary.taxCents,
    shippingCents: summary.shippingCents,
    contingencyCents: summary.contingencyCents,
    budgetaryOptions:
      draft.documentType === "budgetary"
        ? {
            ...draft.budgetaryOptions,
            disclaimer: draft.budgetaryOptions.disclaimer?.trim() || DEFAULT_BUDGETARY_DISCLAIMER,
            estimatedLowCents: summary.estimatedLowCents,
            estimatedHighCents: summary.estimatedHighCents,
          }
        : undefined,
    lineItems: draft.lineItems
      .filter((line) => line.itemName.trim())
      .map((line, index) => ({
        itemName: line.itemName.trim(),
        description: buildLineDescription(line.itemName, line.description),
        clientNote: line.description.trim() || undefined,
        quantity: parseQuantityInput(line.quantity) ?? 1,
        unit: resolveLineUnit(line),
        unitPriceCents: parseMoneyInput(line.unitPrice) ?? 0,
        sortOrder: index,
        category: draft.documentType === "labor" ? "professional_services" : undefined,
      })),
  };
}
