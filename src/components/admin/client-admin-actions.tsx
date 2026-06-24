"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { PermanentDeleteDialog } from "@/components/admin/permanent-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientDeletionPreview } from "@/lib/records/types";
import { DELETE_CONFIRMATION_TEXT } from "@/lib/records/types";
import { toast } from "sonner";

type ClientAdminActionsProps = {
  clientId: string;
  clientName: string;
  status: string;
};

export function ClientAdminActions({ clientId, clientName, status }: ClientAdminActionsProps) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<ClientDeletionPreview | null>(null);
  const isArchived = status === "archived";

  async function handleArchive() {
    setArchiving(true);
    const endpoint = isArchived
      ? `/api/v1/clients/${clientId}/restore`
      : `/api/v1/clients/${clientId}/archive`;
    const response = await fetch(endpoint, { method: "POST" });
    setArchiving(false);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to update client");
      return;
    }

    toast.success(isArchived ? "Client restored" : "Client archived");
    router.refresh();
  }

  async function openDeleteDialog() {
    const response = await fetch(`/api/v1/clients/${clientId}/deletion-preview`);
    if (!response.ok) {
      toast.error("Unable to load deletion preview");
      return;
    }
    setPreview(await response.json());
    setDeleteOpen(true);
  }

  async function handlePermanentDelete() {
    setDeleting(true);
    const response = await fetch(`/api/v1/clients/${clientId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: DELETE_CONFIRMATION_TEXT }),
    });
    setDeleting(false);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to delete client");
      return;
    }

    toast.success("Client permanently deleted");
    setDeleteOpen(false);
    router.push("/clients");
    router.refresh();
  }

  return (
    <>
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base">Admin Record Management</CardTitle>
          <CardDescription>
            Archive clients to hide them from default views, or permanently delete with confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button variant="outline" onClick={handleArchive} disabled={archiving} className="w-full sm:w-auto">
            {isArchived ? (
              <>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Restore Client
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Archive Client
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={openDeleteDialog} className="w-full sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" />
            Permanently Delete
          </Button>
        </CardContent>
      </Card>

      <PermanentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Permanently Delete Client"
        description="This action cannot be undone. All related business records for this client will be removed from the system."
        entityName={clientName}
        warningItems={[
          "Assessments and assessment responses",
          "Recommendations",
          "Projects",
          "Score history",
          "Documents and reports",
          "Notes and activity logs",
        ]}
        countItems={
          preview
            ? [
                { label: "Assessments", count: preview.counts.assessments },
                { label: "Assessment responses", count: preview.counts.assessmentResponses },
                { label: "Recommendations", count: preview.counts.recommendations },
                { label: "Projects", count: preview.counts.projects },
                { label: "Score history entries", count: preview.counts.scoreHistory },
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
