"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjectCustomerUpdatePanel } from "@/components/projects/project-customer-update-panel";
import { ProjectDeliveryPanel } from "@/components/projects/project-delivery-panel";
import { ProjectAdminActions } from "@/components/admin/project-admin-actions";
import { buttonClassName } from "@/components/ui/button";
import { ALL_PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/projects";
import type { ProjectStatus } from "@/generated/prisma/client";

export function ProjectWorkspaceControls({
  projectId,
  clientId,
  title,
  initialStatus,
  initialNotes,
  isAdmin,
}: {
  projectId: string;
  clientId: string;
  title: string;
  initialStatus: ProjectStatus;
  initialNotes: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function save() {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, notes }),
        });
        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error ?? "Unable to save project");
        }
        setMessage("Project changes saved.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to save project");
      }
    });
  }
  return (
    <details className="rounded-xl border border-border bg-card p-5">
      <summary className="cursor-pointer text-sm font-semibold">
        Manage project · status, tasks, milestones, and customer updates
      </summary>
      <div className="mt-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="block">Project status</span>
            <select
              disabled={pending}
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full rounded-lg border border-border bg-background p-2"
            >
              {ALL_PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PROJECT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Completing a project also completes its linked recommendation
            through the existing delivery workflow. Notification settings still
            apply.
          </p>
        </div>
        <label className="block space-y-2 text-sm">
          <span>Project notes</span>
          <textarea
            rows={3}
            maxLength={5000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-3"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
        <button
          disabled={pending}
          onClick={save}
          className={buttonClassName({})}
        >
          {pending ? "Saving…" : "Save project"}
        </button>
        <ProjectCustomerUpdatePanel projectId={projectId} />
        <ProjectDeliveryPanel projectId={projectId} clientId={clientId} />
        <Link href={`/projects?selected=${projectId}`} className="inline-block text-xs text-muted-foreground underline underline-offset-4">Advanced project controls and assessment context</Link>
        {isAdmin && (
          <details className="rounded-lg border border-border p-3">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Record management
            </summary>
            <div className="mt-3">
              <ProjectAdminActions
                projectId={projectId}
                projectTitle={title}
                status={initialStatus}
                onUpdated={() => router.refresh()}
                onDeleted={() => router.push(`/clients/${clientId}/projects`)}
              />
            </div>
          </details>
        )}
      </div>
    </details>
  );
}
