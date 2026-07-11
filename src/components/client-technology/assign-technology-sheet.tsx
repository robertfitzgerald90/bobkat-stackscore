"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ClientTechnologyRecord } from "@/lib/technology-catalog/types";
import { toast } from "sonner";

type CatalogOption = {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  standardStatus: string;
  category: { name: string };
  products: Array<{
    id: string;
    name: string;
    modelNumber: string | null;
    isPreferred: boolean;
  }>;
};

type AssignTechnologySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  catalogOptions: CatalogOption[];
  onAssigned: (deployment: ClientTechnologyRecord) => void;
};

export function AssignTechnologySheet({
  open,
  onOpenChange,
  clientId,
  catalogOptions,
  onAssigned,
}: AssignTechnologySheetProps) {
  const [loading, setLoading] = useState(false);
  const [technologyId, setTechnologyId] = useState("");
  const [technologyProductId, setTechnologyProductId] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [notes, setNotes] = useState("");

  const selectedTechnology = useMemo(
    () => catalogOptions.find((option) => option.id === technologyId) ?? null,
    [catalogOptions, technologyId],
  );

  useEffect(() => {
    if (!open) {
      setTechnologyId("");
      setTechnologyProductId("");
      setBusinessPurpose("");
      setQuantity("");
      setQuantityUnit("");
      setNotes("");
    }
  }, [open]);

  useEffect(() => {
    setTechnologyProductId("");
  }, [technologyId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!technologyId) {
      toast.error("Select a catalog technology");
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/v1/clients/${clientId}/technologies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        technologyId,
        technologyProductId: technologyProductId || null,
        businessPurpose: businessPurpose || null,
        quantity: quantity ? Number(quantity) : null,
        quantityUnit: quantityUnit || null,
        notes: notes || null,
      }),
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to assign technology");
      return;
    }

    const deployment = (await response.json()) as ClientTechnologyRecord;
    onAssigned(deployment);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-[100vw] overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Assign Technology</SheetTitle>
          <SheetDescription>
            Record a catalog technology deployed at this client organization.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <Label>Catalog Technology</Label>
            <Select
              value={technologyId}
              onValueChange={(value) => setTechnologyId(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select technology" />
              </SelectTrigger>
              <SelectContent>
                {catalogOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name} ({option.category.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTechnology && selectedTechnology.products.length > 0 ? (
            <div className="space-y-2">
              <Label>Product / Model</Label>
              <Select
                value={technologyProductId}
                onValueChange={(value) => setTechnologyProductId(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Optional product selection" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTechnology.products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                      {product.modelNumber ? ` (${product.modelNumber})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="businessPurpose">Business Purpose</Label>
            <Input
              id="businessPurpose"
              value={businessPurpose}
              onChange={(event) => setBusinessPurpose(event.target.value)}
              placeholder="What business role does this deployment serve?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantityUnit">Unit</Label>
              <Input
                id="quantityUnit"
                value={quantityUnit}
                onChange={(event) => setQuantityUnit(event.target.value)}
                placeholder="devices, users, sites..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional deployment notes"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Assigning..." : "Assign Technology"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
