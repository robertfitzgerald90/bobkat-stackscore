"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DELETE_CONFIRMATION_TEXT } from "@/lib/records/types";
import { cn } from "@/lib/utils";

type CountItem = {
  label: string;
  count: number;
};

type PermanentDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  entityName: string;
  warningItems?: string[];
  countItems?: CountItem[];
  onConfirm: () => Promise<void>;
  loading?: boolean;
};

export function PermanentDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  entityName,
  warningItems = [],
  countItems = [],
  onConfirm,
  loading = false,
}: PermanentDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmText("");
    }
  }, [open]);

  if (!open) return null;

  const canDelete = confirmText === DELETE_CONFIRMATION_TEXT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative z-10 w-full max-w-lg rounded-xl border border-destructive/30 bg-card p-6 shadow-xl"
      >
        <div className="space-y-4">
          <div>
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-destructive">
              {title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <p className="mt-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm font-medium text-foreground">
              {entityName}
            </p>
          </div>

          {warningItems.length > 0 ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-sm font-medium text-destructive">This action will also remove:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {warningItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {countItems.length > 0 ? (
            <div className="rounded-md border border-border/60 bg-muted/20 p-3">
              <p className="text-sm font-medium">Related records</p>
              <ul className="mt-2 space-y-1 text-sm">
                {countItems.map((item) => (
                  <li key={item.label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold tabular-nums">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">
              Type <span className="font-mono font-semibold text-destructive">{DELETE_CONFIRMATION_TEXT}</span>{" "}
              to confirm
            </Label>
            <Input
              id="delete-confirmation"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={DELETE_CONFIRMATION_TEXT}
              className={cn(
                "font-mono",
                canDelete && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              )}
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!canDelete || loading}
              onClick={async () => {
                await onConfirm();
              }}
            >
              {loading ? "Deleting..." : "Permanently Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
