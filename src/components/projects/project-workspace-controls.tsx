"use client";

import { useEffect, useState, useTransition } from "react";
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
  const [section, setSection] = useState<
    "delivery" | "details" | "updates" | "records"
  >("delivery");
  const [updatesOpened, setUpdatesOpened] = useState(false);
  const [saved, setSaved] = useState({
    status: initialStatus,
    notes: initialNotes ?? "",
  });
  const dirty = status !== saved.status || notes !== saved.notes;
  const sections: Array<{
    id: "delivery" | "details" | "updates" | "records";
    label: string;
  }> = [
    { id: "delivery", label: "Tasks & milestones" },
    { id: "details", label: "Project details" },
    { id: "updates", label: "Customer updates" },
    ...(isAdmin
      ? [{ id: "records" as const, label: "Record management" }]
      : []),
  ];
  useEffect(() => {
    function openDelivery(event: MouseEvent) {
      if (
        event.target instanceof Element &&
        event.target.closest('a[href="#project-delivery"]')
      ) {
        setSection("delivery");
      }
    }
    document.addEventListener("click", openDelivery);
    return () => document.removeEventListener("click", openDelivery);
  }, []);

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
        setSaved({ status, notes });
        setMessage("Project changes saved.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to save project");
      }
    });
  }
  return (
    <section
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
      aria-label="Staff project workspace"
    >
      <h2 className="text-base font-semibold">Manage delivery</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Work in the same project workspace your customer sees, with staff
        controls available here.
      </p>
      <nav
        className="mt-4 flex flex-wrap gap-2 border-b border-border pb-4"
        aria-label="Project management sections"
      >
        {sections.map((item) => (
          <button
            key={item.id}
            id={`project-section-${item.id}`}
            type="button"
            aria-pressed={section === item.id}
            onClick={() => {
              setSection(item.id);
              if (item.id === "updates") setUpdatesOpened(true);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${section === item.id ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:bg-muted"}`}
          >
            {item.label}
            {item.id === "details" && dirty ? (
              <span className="ml-1.5 text-xs">· Unsaved</span>
            ) : null}
          </button>
        ))}
      </nav>
      <div
        className="mt-5"
        role="region"
        aria-labelledby={`project-section-${section}`}
      >
        <div hidden={section !== "delivery"}>
          <ProjectDeliveryPanel projectId={projectId} clientId={clientId} />
        </div>
        <div hidden={section !== "details"} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="block font-medium">Project status</span>
            <select
              disabled={pending}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ProjectStatus);
                setMessage("");
              }}
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
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Project description</span>
            <textarea
              disabled={pending}
              rows={4}
              maxLength={5000}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setMessage("");
              }}
              className="w-full rounded-lg border border-border bg-background p-3"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            This description is visible in the customer project overview.
          </p>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <p role="status" className="text-sm text-muted-foreground">
            {pending
              ? "Saving project changes…"
              : message ||
                (dirty
                  ? "You have unsaved project changes."
                  : "Project details are up to date.")}
          </p>
          <button
            type="button"
            disabled={pending || !dirty}
            onClick={save}
            className={buttonClassName({})}
          >
            {pending ? "Saving…" : "Save project"}
          </button>
        </div>
        {updatesOpened ? (
          <div hidden={section !== "updates"}>
            <ProjectCustomerUpdatePanel projectId={projectId} />
          </div>
        ) : null}
        {section === "records" && isAdmin ? (
          <ProjectAdminActions
            projectId={projectId}
            projectTitle={title}
            status={initialStatus}
            onUpdated={() => router.refresh()}
            onDeleted={() => router.push(`/clients/${clientId}/projects`)}
          />
        ) : null}
      </div>
      <Link
        href={`/projects?selected=${projectId}`}
        className="mt-5 inline-block text-xs text-muted-foreground underline underline-offset-4"
      >
        Advanced project controls and assessment context
      </Link>
    </section>
  );
}
