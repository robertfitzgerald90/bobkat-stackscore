"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2 } from "lucide-react";
import { PermanentDeleteDialog } from "@/components/admin/permanent-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssessmentDeletionPreview } from "@/lib/records/types";
import { DELETE_CONFIRMATION_TEXT } from "@/lib/records/types";
import { toast } from "sonner";

type AssessmentAdminActionsProps = {
  assessmentId: string;
  assessmentName: string;
  status: string;
  redirectTo?: string;
};

export function AssessmentAdminActions({
  assessmentId,
  assessmentName,
  status,
  redirectTo = "/clients",
}: AssessmentAdminActionsProps) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<AssessmentDeletionPreview | null>(null);
  const isArchived = status === "archived";

  async function handleArchive() {
    if (isArchived) {
      toast.error("Archived assessments cannot be restored from this screen.");
      return;
    }

    setArchiving(true);
    const response = await fetch(`/api/v1/assessments/${assessmentId}/archive`, {
      method: "POST",
    });
    setArchiving(false);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to archive assessment");
      return;
    }

    toast.success("Assessment archived");
    router.push(redirectTo);
    router.refresh();
  }

  async function openDeleteDialog() {
    const response = await fetch(`/api/v1/assessments/${assessmentId}/deletion-preview`);
    if (!response.ok) {
      toast.error("Unable to load deletion preview");
      return;
    }
    setPreview(await response.json());
    setDeleteOpen(true);
  }

  async function handlePermanentDelete() {
    setDeleting(true);
    const response = await fetch(`/api/v1/assessments/${assessmentId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: DELETE_CONFIRMATION_TEXT }),
    });
    setDeleting(false);

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error ?? "Unable to delete assessment");
      return;
    }

    toast.success("Assessment permanently deleted");
    setDeleteOpen(false);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <>
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base">Admin Record Management</CardTitle>
          <CardDescription>
            Archive assessments to remove them from active workflows, or permanently delete with
            confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {!isArchived ? (
            <Button variant="outline" onClick={handleArchive} disabled={archiving} className="w-full sm:w-auto">
              <Archive className="mr-2 h-4 w-4" />
              Archive Assessment
            </Button>
          ) : null}
          <Button variant="destructive" onClick={openDeleteDialog} className="w-full sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" />
            Permanently Delete
          </Button>
        </CardContent>
      </Card>

      <PermanentDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Permanently Delete Assessment"
        description="This action cannot be undone. The assessment and its related records will be permanently removed."
        entityName={assessmentName}
        warningItems={[
          "Assessment responses",
          "Category scores",
          "Recommendations tied to this assessment",
          "Score history entries",
          "Documents and notes",
        ]}
        countItems={
          preview
            ? [
                { label: "Responses", count: preview.counts.responses },
                { label: "Recommendations", count: preview.counts.recommendations },
                { label: "Category scores", count: preview.counts.categoryScores },
                { label: "Score history entries", count: preview.counts.scoreHistory },
                { label: "Documents", count: preview.counts.documents },
                { label: "Notes", count: preview.counts.notes },
                { label: "Derived reassessments", count: preview.counts.derivedAssessments },
              ]
            : []
        }
        onConfirm={handlePermanentDelete}
        loading={deleting}
      />
    </>
  );
}
