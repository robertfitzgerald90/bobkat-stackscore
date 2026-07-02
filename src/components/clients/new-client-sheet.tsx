"use client";

import { useState } from "react";
import { NewClientForm } from "@/components/clients/new-client-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CreatedClient } from "@/lib/clients/create-client";

type NewClientSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (client: CreatedClient) => void;
};

export function NewClientSheet({ open, onOpenChange, onCreated }: NewClientSheetProps) {
  const [formKey, setFormKey] = useState(0);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFormKey((current) => current + 1);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New Client</SheetTitle>
          <SheetDescription>Add a business to assess</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <NewClientForm
            key={formKey}
            onSuccess={(client) => {
              handleOpenChange(false);
              onCreated?.(client);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
