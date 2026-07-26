"use client";

import { useEffect, useId, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveLeadDisplayName } from "@/lib/technology-snapshot/contact-helpers";

export type SnapshotLeadDeleteTarget = {
  id: string;
  contactName: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName: string;
  email: string;
  createdAt: Date | string;
};

type SnapshotLeadDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: SnapshotLeadDeleteTarget | null;
  loading?: boolean;
  onConfirm: () => Promise<void>;
};

function formatSubmissionDate(value: Date | string) {
  return new Date(value).toLocaleString();
}

export function SnapshotLeadDeleteDialog({
  open,
  onOpenChange,
  lead,
  loading = false,
  onConfirm,
}: SnapshotLeadDeleteDialogProps) {
  const titleId = useId();
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!open) {
      inFlightRef.current = false;
    }
  }, [open]);

  if (!lead) return null;

  const displayName = resolveLeadDisplayName(lead);

  async function handleConfirm() {
    if (loading || inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      await onConfirm();
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (loading) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-w-md border-destructive/30 bg-card text-foreground"
        showCloseButton={!loading}
        aria-labelledby={titleId}
      >
        <DialogHeader className="border-border">
          <DialogTitle id={titleId} className="text-destructive">
            Delete Snapshot Lead?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This will permanently delete the Snapshot Lead for:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4">
          <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm">
            <p className="font-semibold text-foreground">{lead.companyName}</p>
            <dl className="mt-2 space-y-1 text-muted-foreground">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-foreground">Contact</dt>
                <dd>{displayName}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-foreground">Business</dt>
                <dd>{lead.companyName}</dd>
              </div>
              <div className="flex min-w-0 flex-wrap gap-x-2">
                <dt className="font-medium text-foreground">Email</dt>
                <dd className="break-all">{lead.email}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-foreground">Submitted</dt>
                <dd>{formatSubmissionDate(lead.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <p className="text-sm font-medium text-destructive">This action cannot be undone.</p>
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {loading ? "Deleting Snapshot Lead…" : null}
          </p>
        </div>

        <DialogFooter className="border-border">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={loading}
              aria-label={`Delete Snapshot Lead for ${displayName}`}
              onClick={() => void handleConfirm()}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden />
              {loading ? "Deleting…" : "Delete Lead"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
