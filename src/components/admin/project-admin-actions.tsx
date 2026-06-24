"use client";

import { useState } from "react";
import { Archive, Trash2 } from "lucide-react";
import { PermanentDeleteDialog } from "@/components/admin/permanent-delete-dialog";
import { Button } from "@/components/ui/button";
import type { ProjectDeletionPreview } from "@/lib/records/types";
import { DELETE_CONFIRMATION_TEXT } from "@/lib/records/types";
import { toast } from "sonner";

type ProjectAdminActionsProps = {
  projectId: string;
  projectTitle: string;
  status: string;
  onUpdated?: () => void;
  onDeleted?: () => void;
};

export function ProjectAdminActions({
  projectId,
  projectTitle,
  status,
  onUpdated,
  onDeleted,
}: ProjectAdminActionsProps) {
  const [cancelling, setCancelling] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<ProjectDeletionPreview | null>(null);
  const isCancelled = status === "cancelled";

  async function handleCancel() {
    if (isCancelled) return;

    setCancelling(true);
    const response = await fetch(`/api/v1/projects/${projectId}/cancel`, { method: "POST" });
    setCancelling(false);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to cancel project");
      return;
    }

    toast.success("Project cancelled");
    onUpdated?.();
  }

  async function openDeleteDialog() {
    const response = await fetch(`/api/v1/projects/${projectId}/deletion-preview`);
    if (!response.ok) {
      toast.error("Unable to load deletion preview");
      return;
    }
    setPreview(await response.json());
    setDeleteOpen(true);
  }

  async function handlePermanentDelete() {
    setDeleting(true);
    const response = await fetch(`/api/v1/projects/${projectId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: DELETE_CONFIRMATION_TEXT }),
    });
    setDeleting(false);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to delete project");
      return;
    }

    toast.success("Project permanently deleted");
    setDeleteOpen(false);
    onDeleted?.();
  }

  return (
    <>
      <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div>
          <p className="text-sm font-medium text-destructive">Admin Record Management</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cancel projects to remove them from active workflows, or permanently delete with
            confirmation.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {!isCancelled ? (
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={cancelling} className="w-full sm:w-auto">
              <Archive className="mr-2 h-4 w-4" />
              Cancel Project
            </Button>
          ) : null}
          <Button variant="destructive" size="sm" onClick={openDeleteDialog} className="w-full sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" />
            Permanently Delete
          </Button>
        </div>
      </div>

      <PermanentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Permanently Delete Project"
        description="This action cannot be undone. The project record and related documents or notes will be permanently removed."
        entityName={projectTitle}
        countItems={
          preview
            ? [
                { label: "Documents", count: preview.counts.documents },
                { label: "Notes", count: preview.counts.notes },
              ]
            : []
        }
        onConfirm={handlePermanentDelete}
        loading={deleting}
      />
    </>
  );
}
