"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  INVOICE_LINE_UNITS,
  computeDraftLineTotalCents,
  type ManualInvoiceLineDraft,
  type ManualInvoiceValidationErrors,
} from "@/lib/billing/invoice-builder";
import { formatMoney } from "@/lib/billing/money";
import { cn } from "@/lib/utils";

type InvoiceLineItemsEditorProps = {
  lineItems: ManualInvoiceLineDraft[];
  errors?: ManualInvoiceValidationErrors["lineItemErrors"];
  onChange: (lineItems: ManualInvoiceLineDraft[]) => void;
};

export function InvoiceLineItemsEditor({
  lineItems,
  errors,
  onChange,
}: InvoiceLineItemsEditorProps) {
  function updateLine(id: string, patch: Partial<ManualInvoiceLineDraft>) {
    onChange(lineItems.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function removeLine(id: string) {
    if (lineItems.length <= 1) return;
    onChange(lineItems.filter((line) => line.id !== id));
  }

  function addLine() {
    onChange([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        itemName: "",
        description: "",
        quantity: "1",
        unit: "Each",
        customUnit: "",
        unitPrice: "",
      },
    ]);
  }

  function moveLine(id: string, direction: -1 | 1) {
    const index = lineItems.findIndex((line) => line.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= lineItems.length) return;
    const next = [...lineItems];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="hidden overflow-x-auto rounded-lg border border-border/60 lg:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2.5 font-medium">Item / Service</th>
              <th className="px-3 py-2.5 font-medium">Description</th>
              <th className="w-20 px-3 py-2.5 font-medium">Qty</th>
              <th className="w-28 px-3 py-2.5 font-medium">Unit</th>
              <th className="w-28 px-3 py-2.5 font-medium">Unit Price</th>
              <th className="w-28 px-3 py-2.5 text-right font-medium">Total</th>
              <th className="w-24 px-3 py-2.5 font-medium" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {lineItems.map((line, index) => (
              <LineItemTableRow
                key={line.id}
                line={line}
                index={index}
                totalCount={lineItems.length}
                errors={errors?.[line.id]}
                onUpdate={(patch) => updateLine(line.id, patch)}
                onRemove={() => removeLine(line.id)}
                onMoveUp={() => moveLine(line.id, -1)}
                onMoveDown={() => moveLine(line.id, 1)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {lineItems.map((line, index) => (
          <LineItemMobileCard
            key={line.id}
            line={line}
            index={index}
            totalCount={lineItems.length}
            errors={errors?.[line.id]}
            onUpdate={(patch) => updateLine(line.id, patch)}
            onRemove={() => removeLine(line.id)}
            onMoveUp={() => moveLine(line.id, -1)}
            onMoveDown={() => moveLine(line.id, 1)}
          />
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addLine}>
        <Plus className="mr-2 h-4 w-4" />
        Add Line Item
      </Button>
    </div>
  );
}

type LineItemRowProps = {
  line: ManualInvoiceLineDraft;
  index: number;
  totalCount: number;
  errors?: Partial<Record<keyof ManualInvoiceLineDraft, string>>;
  onUpdate: (patch: Partial<ManualInvoiceLineDraft>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

function inputClassName(hasError?: boolean) {
  return cn(
    "flex w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm outline-none",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    hasError && "border-destructive",
  );
}

function LineItemTableRow({
  line,
  index,
  totalCount,
  errors,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: LineItemRowProps) {
  const lineTotal = computeDraftLineTotalCents(line);

  return (
    <tr className="border-b border-border/40 align-top last:border-b-0">
      <td className="px-3 py-2.5">
        <input
          value={line.itemName}
          onChange={(event) => onUpdate({ itemName: event.target.value })}
          placeholder="Item or service"
          className={inputClassName(Boolean(errors?.itemName))}
          aria-invalid={Boolean(errors?.itemName)}
        />
        {errors?.itemName ? <FieldError message={errors.itemName} /> : null}
      </td>
      <td className="px-3 py-2.5">
        <textarea
          value={line.description}
          onChange={(event) => onUpdate({ description: event.target.value })}
          placeholder="Optional details"
          rows={2}
          className={cn(inputClassName(), "min-h-[2.75rem] resize-y")}
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          min="0"
          step="0.01"
          value={line.quantity}
          onChange={(event) => onUpdate({ quantity: event.target.value })}
          className={inputClassName(Boolean(errors?.quantity))}
          aria-invalid={Boolean(errors?.quantity)}
        />
        {errors?.quantity ? <FieldError message={errors.quantity} /> : null}
      </td>
      <td className="px-3 py-2.5">
        <select
          value={line.unit}
          onChange={(event) =>
            onUpdate({ unit: event.target.value as ManualInvoiceLineDraft["unit"] })
          }
          className={inputClassName()}
        >
          {INVOICE_LINE_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
        {line.unit === "Custom" ? (
          <input
            value={line.customUnit}
            onChange={(event) => onUpdate({ customUnit: event.target.value })}
            placeholder="Custom unit"
            className={cn(inputClassName(Boolean(errors?.customUnit)), "mt-2")}
          />
        ) : null}
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          min="0"
          step="0.01"
          value={line.unitPrice}
          onChange={(event) => onUpdate({ unitPrice: event.target.value })}
          className={inputClassName(Boolean(errors?.unitPrice))}
          aria-invalid={Boolean(errors?.unitPrice)}
        />
        {errors?.unitPrice ? <FieldError message={errors.unitPrice} /> : null}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums font-medium">{formatMoney(lineTotal)}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" onClick={onMoveUp} disabled={index === 0}>
            <ChevronUp className="h-4 w-4" />
            <span className="sr-only">Move up</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onMoveDown}
            disabled={index === totalCount - 1}
          >
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Move down</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            disabled={totalCount <= 1}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove line item</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function LineItemMobileCard({
  line,
  index,
  totalCount,
  errors,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: LineItemRowProps) {
  const lineTotal = computeDraftLineTotalCents(line);

  return (
    <div className="space-y-3 rounded-lg border border-border/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Line Item {index + 1}
        </p>
        <p className="text-sm font-medium tabular-nums">{formatMoney(lineTotal)}</p>
      </div>

      <div className="space-y-1.5">
        <Label>Item / Service</Label>
        <input
          value={line.itemName}
          onChange={(event) => onUpdate({ itemName: event.target.value })}
          className={inputClassName(Boolean(errors?.itemName))}
        />
        {errors?.itemName ? <FieldError message={errors.itemName} /> : null}
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <textarea
          value={line.description}
          onChange={(event) => onUpdate({ description: event.target.value })}
          rows={3}
          className={cn(inputClassName(), "resize-y")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Quantity</Label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={line.quantity}
            onChange={(event) => onUpdate({ quantity: event.target.value })}
            className={inputClassName(Boolean(errors?.quantity))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Unit Price</Label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={line.unitPrice}
            onChange={(event) => onUpdate({ unitPrice: event.target.value })}
            className={inputClassName(Boolean(errors?.unitPrice))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Unit</Label>
        <select
          value={line.unit}
          onChange={(event) =>
            onUpdate({ unit: event.target.value as ManualInvoiceLineDraft["unit"] })
          }
          className={inputClassName()}
        >
          {INVOICE_LINE_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
        {line.unit === "Custom" ? (
          <input
            value={line.customUnit}
            onChange={(event) => onUpdate({ customUnit: event.target.value })}
            placeholder="Custom unit"
            className={inputClassName(Boolean(errors?.customUnit))}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onMoveUp} disabled={index === 0}>
          Move up
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onMoveDown}
          disabled={index === totalCount - 1}
        >
          Move down
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          disabled={totalCount <= 1}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}
