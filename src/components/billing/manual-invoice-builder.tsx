"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import type { InvoiceDocumentType } from "@/generated/prisma/client";
import { InvoiceLineItemsEditor } from "@/components/billing/invoice-line-items-editor";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_BUDGETARY_DISCLAIMER,
  computeManualInvoiceSummary,
  createDefaultManualInvoiceDraft,
  createLaborLineDraft,
  getTotalLabel,
  hasManualInvoiceValidationErrors,
  serializeManualInvoicePayload,
  validateManualInvoiceDraft,
  type ManualInvoiceDraft,
} from "@/lib/billing/invoice-builder";
import { getDefaultLaborRateCents } from "@/lib/billing/labor-rate";
import { formatMoney } from "@/lib/billing/money";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ManualInvoiceBuilderProps = {
  clientId: string;
};

const DOCUMENT_TYPES: Array<{ value: InvoiceDocumentType; label: string; description: string }> = [
  {
    value: "standard",
    label: "Standard Invoice",
    description: "A normal invoice intended to be sent for payment.",
  },
  {
    value: "budgetary",
    label: "Budgetary Invoice",
    description: "An itemized preliminary estimate for planning and approval.",
  },
  {
    value: "labor",
    label: "Labor Invoice",
    description: "A simplified invoice primarily for hourly labor.",
  },
];

export function ManualInvoiceBuilder({ clientId }: ManualInvoiceBuilderProps) {
  const router = useRouter();
  const laborRateCents = getDefaultLaborRateCents();
  const [draft, setDraft] = useState<ManualInvoiceDraft>(() =>
    createDefaultManualInvoiceDraft("standard", laborRateCents),
  );
  const [submitting, setSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const summary = useMemo(() => computeManualInvoiceSummary(draft), [draft]);
  const validationErrors = useMemo(() => validateManualInvoiceDraft(draft), [draft]);

  function updateDraft(patch: Partial<ManualInvoiceDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function setDocumentType(documentType: InvoiceDocumentType) {
    setDraft((current) => {
      if (current.documentType === documentType) return current;
      const next = createDefaultManualInvoiceDraft(documentType, laborRateCents);
      return {
        ...next,
        title: current.title,
        clientDescription: current.clientDescription,
        clientNotes: current.clientNotes,
        internalNotes: current.internalNotes,
        dueDate: documentType === "budgetary" ? "" : current.dueDate,
        expirationDate: documentType === "budgetary" ? current.expirationDate : "",
      };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setShowValidation(true);
    if (hasManualInvoiceValidationErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const payload = serializeManualInvoicePayload(draft, summary);
      const res = await fetch(`/api/v1/clients/${clientId}/billing/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to create invoice");
      }
      const data = (await res.json()) as { invoice: { id: string } };
      toast.success("Draft invoice created");
      router.push(`/clients/${clientId}/billing/invoices/${data.invoice.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Type</CardTitle>
          <CardDescription>Select the manual invoice format for this draft.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {DOCUMENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setDocumentType(type.value)}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                draft.documentType === type.value
                  ? "border-primary bg-primary/5"
                  : "border-border/60 hover:bg-muted/20",
              )}
            >
              <p className="font-medium">{type.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="invoice-title">Invoice Title</Label>
            <input
              id="invoice-title"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              placeholder="Network Infrastructure Upgrade — Budgetary Estimate"
              className={fieldClassName(showValidation && Boolean(validationErrors.title))}
            />
            {showValidation && validationErrors.title ? (
              <p className="text-xs text-destructive">{validationErrors.title}</p>
            ) : null}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="client-description">Client-facing Description</Label>
            <textarea
              id="client-description"
              value={draft.clientDescription}
              onChange={(event) => updateDraft({ clientDescription: event.target.value })}
              rows={3}
              placeholder="Brief summary visible to the client on the invoice."
              className={cn(fieldClassName(), "resize-y")}
            />
          </div>

          {draft.documentType === "budgetary" ? (
            <div className="space-y-1.5">
              <Label htmlFor="expiration-date">Expiration Date</Label>
              <input
                id="expiration-date"
                type="date"
                value={draft.expirationDate}
                onChange={(event) => updateDraft({ expirationDate: event.target.value })}
                className={fieldClassName()}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="due-date">Due Date</Label>
              <input
                id="due-date"
                type="date"
                value={draft.dueDate}
                onChange={(event) => updateDraft({ dueDate: event.target.value })}
                className={fieldClassName(showValidation && Boolean(validationErrors.dueDate))}
              />
              {showValidation && validationErrors.dueDate ? (
                <p className="text-xs text-destructive">{validationErrors.dueDate}</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
          <CardDescription>
            {draft.documentType === "labor"
              ? `Default labor rate: ${formatMoney(laborRateCents)}/hr. Add as many labor lines as needed.`
              : "Build the itemized charges for this invoice."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showValidation && validationErrors.lineItems ? (
            <p className="mb-3 text-sm text-destructive">{validationErrors.lineItems}</p>
          ) : null}
          <InvoiceLineItemsEditor
            lineItems={draft.lineItems}
            errors={validationErrors.lineItemErrors}
            onChange={(lineItems) => updateDraft({ lineItems })}
          />
          {draft.documentType === "labor" ? (
            <div className="mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateDraft({
                    lineItems: [...draft.lineItems, createLaborLineDraft(laborRateCents)],
                  })
                }
              >
                Add labor line at default rate
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Totals update automatically as line items change.</CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => updateDraft({ showAdvancedSummary: !draft.showAdvancedSummary })}
          >
            {draft.showAdvancedSummary ? "Hide adjustments" : "Add discount, tax, or other charges"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <SummaryRow label="Subtotal" value={formatMoney(summary.subtotalCents)} />

          {draft.showAdvancedSummary ? (
            <div className="grid gap-3 md:grid-cols-3">
              <MoneyField
                id="discount"
                label="Discount"
                value={draft.discount}
                error={showValidation ? validationErrors.discount : undefined}
                onChange={(discount) => updateDraft({ discount })}
              />
              <MoneyField
                id="tax"
                label="Tax"
                value={draft.tax}
                error={showValidation ? validationErrors.tax : undefined}
                onChange={(tax) => updateDraft({ tax })}
              />
              <MoneyField
                id="shipping"
                label="Shipping / Other Charges"
                value={draft.shipping}
                error={showValidation ? validationErrors.shipping : undefined}
                onChange={(shipping) => updateDraft({ shipping })}
              />
            </div>
          ) : null}

          {summary.discountCents > 0 ? (
            <SummaryRow label="Discount" value={`-${formatMoney(summary.discountCents)}`} />
          ) : null}
          {summary.taxCents > 0 ? (
            <SummaryRow label="Tax" value={formatMoney(summary.taxCents)} />
          ) : null}
          {summary.shippingCents > 0 ? (
            <SummaryRow label="Shipping / Other" value={formatMoney(summary.shippingCents)} />
          ) : null}
          {summary.contingencyCents > 0 ? (
            <SummaryRow
              label={`Contingency (${draft.budgetaryOptions.contingencyPercent ?? 0}%)`}
              value={formatMoney(summary.contingencyCents)}
            />
          ) : null}

          {draft.documentType === "budgetary" &&
          draft.budgetaryOptions.showRange &&
          summary.estimatedLowCents !== null &&
          summary.estimatedHighCents !== null ? (
            <SummaryRow
              label="Estimated Range"
              value={`${formatMoney(summary.estimatedLowCents)} – ${formatMoney(summary.estimatedHighCents)}`}
              emphasis
            />
          ) : (
            <SummaryRow
              label={getTotalLabel(draft.documentType)}
              value={formatMoney(summary.totalCents)}
              emphasis
            />
          )}
        </CardContent>
      </Card>

      {draft.documentType === "budgetary" ? (
        <Card>
          <CardHeader>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => updateDraft({ showEstimateOptions: !draft.showEstimateOptions })}
              aria-expanded={draft.showEstimateOptions}
            >
              <div>
                <CardTitle className="text-base">Estimate Options</CardTitle>
                <CardDescription>Optional budgetary controls and disclaimer text.</CardDescription>
              </div>
              {draft.showEstimateOptions ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {draft.showEstimateOptions ? (
            <CardContent className="space-y-4">
              <ToggleRow
                label="Show low/high range instead of one fixed total"
                checked={Boolean(draft.budgetaryOptions.showRange)}
                onChange={(checked) =>
                  updateDraft({
                    budgetaryOptions: { ...draft.budgetaryOptions, showRange: checked },
                  })
                }
              />
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contingency-percent">Contingency percentage</Label>
                  <input
                    id="contingency-percent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={draft.budgetaryOptions.contingencyPercent ?? ""}
                    onChange={(event) =>
                      updateDraft({
                        budgetaryOptions: {
                          ...draft.budgetaryOptions,
                          contingencyPercent: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        },
                      })
                    }
                    className={fieldClassName()}
                  />
                </div>
              </div>
              <ToggleRow
                label="Include tax in estimate"
                checked={Boolean(draft.budgetaryOptions.includeTaxInEstimate)}
                onChange={(checked) =>
                  updateDraft({
                    budgetaryOptions: { ...draft.budgetaryOptions, includeTaxInEstimate: checked },
                  })
                }
              />
              <ToggleRow
                label="Include shipping in estimate"
                checked={Boolean(draft.budgetaryOptions.includeShippingInEstimate)}
                onChange={(checked) =>
                  updateDraft({
                    budgetaryOptions: {
                      ...draft.budgetaryOptions,
                      includeShippingInEstimate: checked,
                    },
                  })
                }
              />
              <div className="space-y-1.5">
                <Label htmlFor="budgetary-disclaimer">Budgetary disclaimer</Label>
                <textarea
                  id="budgetary-disclaimer"
                  value={draft.budgetaryOptions.disclaimer ?? DEFAULT_BUDGETARY_DISCLAIMER}
                  onChange={(event) =>
                    updateDraft({
                      budgetaryOptions: { ...draft.budgetaryOptions, disclaimer: event.target.value },
                    })
                  }
                  rows={4}
                  className={cn(fieldClassName(), "resize-y")}
                />
              </div>
            </CardContent>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes and Terms</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="client-notes">Client Notes</Label>
            <textarea
              id="client-notes"
              value={draft.clientNotes}
              onChange={(event) => updateDraft({ clientNotes: event.target.value })}
              rows={4}
              className={cn(fieldClassName(), "resize-y")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="internal-notes">Internal Notes</Label>
            <textarea
              id="internal-notes"
              value={draft.internalNotes}
              onChange={(event) => updateDraft({ internalNotes: event.target.value })}
              rows={4}
              className={cn(fieldClassName(), "resize-y")}
            />
          </div>
        </CardContent>
      </Card>

      <button type="submit" disabled={submitting} className={buttonClassName({ variant: "default" })}>
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating…
          </>
        ) : (
          "Create Draft Invoice"
        )}
      </button>
    </form>
  );
}

function fieldClassName(hasError?: boolean) {
  return cn(
    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none",
    "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    hasError && "border-destructive",
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-2 last:border-b-0">
      <span className={emphasis ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={cn("tabular-nums", emphasis && "text-lg font-semibold")}>{value}</span>
    </div>
  );
}

function MoneyField({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClassName(Boolean(error))}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1"
      />
      <span>{label}</span>
    </label>
  );
}
