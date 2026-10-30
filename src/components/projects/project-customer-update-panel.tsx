"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, RefreshCw, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type DraftItem = {
  id: string;
  kind: string;
  title: string;
  detail: string | null;
  completedAtLabel: string | null;
  targetOrDueLabel: string | null;
  included: boolean;
};

type Draft = {
  projectName: string;
  projectStatusLabel: string;
  progressPercent: number | null;
  tasksCompleted: number;
  tasksTotal: number;
  workCompleted: DraftItem[];
  inProgress: DraftItem[];
  comingNext: DraftItem[];
  staffMessage: string;
  includeProjectStatus: boolean;
  includeWorkCompleted: boolean;
  includeInProgress: boolean;
  includeComingNext: boolean;
  includeStaffMessage: boolean;
};

type UpdateRecord = {
  id: string;
  status: string;
  draft: Draft;
  subject: string | null;
  publishedAt: string | null;
  sentAt: string | null;
  failureReason: string | null;
  delivery: {
    status: string;
    recipientEmail: string;
    subject: string;
    sentAt: string | null;
    deliveredAt: string | null;
    failureReason: string | null;
    isTest: boolean;
  } | null;
};

type PreviewResult = {
  subject: string;
  previewText: string;
  html: string;
  text: string;
  recipients: Array<{ email: string; name: string | null; source: string }>;
  emptyActivity: boolean;
};

type ProjectCustomerUpdatePanelProps = {
  projectId: string;
};

export function ProjectCustomerUpdatePanel({ projectId }: ProjectCustomerUpdatePanelProps) {
  const [updates, setUpdates] = useState<UpdateRecord[]>([]);
  const [active, setActive] = useState<UpdateRecord | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [staffMessage, setStaffMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/v1/projects/${projectId}/customer-updates`);
    if (!response.ok) {
      toast.error("Failed to load customer updates");
      return;
    }
    const data = (await response.json()) as { updates: UpdateRecord[] };
    setUpdates(data.updates);
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function prepare() {
    setBusy(true);
    setPreview(null);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/customer-updates`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error ?? "Failed to prepare update");
        return;
      }
      const update = (await response.json()) as UpdateRecord;
      setActive(update);
      setStaffMessage(update.draft.staffMessage ?? "");
      toast.success("Draft prepared from project activity");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function patchDraft(body: Record<string, unknown>) {
    if (!active) return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/customer-updates/${active.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error ?? "Failed to update draft");
        return;
      }
      const update = (await response.json()) as UpdateRecord;
      setActive(update);
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  async function runPreview() {
    if (!active) return;
    setBusy(true);
    try {
      if (staffMessage !== active.draft.staffMessage) {
        await patchDraft({
          staffMessage,
          includeStaffMessage: Boolean(staffMessage.trim()),
        });
      }
      const response = await fetch(
        `/api/v1/projects/${projectId}/customer-updates/${active.id}/preview`,
        { method: "POST" },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error ?? "Preview failed");
        return;
      }
      const data = (await response.json()) as PreviewResult;
      setPreview(data);
      toast.success("Preview ready");
    } finally {
      setBusy(false);
    }
  }

  async function sendUpdate(isTest: boolean) {
    if (!active) return;
    const label = isTest ? "Send test update" : "Send customer update";
    if (
      !window.confirm(
        isTest
          ? "Send a TEST update? It will not publish to the customer portal."
          : "Send this customer update now? This cannot be undone.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      if (staffMessage !== active.draft.staffMessage) {
        await fetch(`/api/v1/projects/${projectId}/customer-updates/${active.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staffMessage,
            includeStaffMessage: Boolean(staffMessage.trim()),
          }),
        });
      }
      const response = await fetch(
        `/api/v1/projects/${projectId}/customer-updates/${active.id}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm: true, isTest }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error ?? `${label} failed`);
        if (data.update) setActive(data.update);
        await load();
        return;
      }
      toast.success(
        isTest
          ? "Test update sent (not published)"
          : "Customer update sent — provider acceptance is not inbox delivery",
      );
      setActive(data.update ?? null);
      setPreview(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  function toggleItem(itemId: string, included: boolean) {
    void patchDraft(
      included
        ? { includedItemIds: [itemId] }
        : { excludedItemIds: [itemId] },
    );
  }

  const draft = active?.draft;

  return (
    <section className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Customer communications
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prepare a consolidated update from real project activity. Nothing sends automatically.
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => void prepare()} disabled={busy}>
          <Mail className="mr-1.5 h-3.5 w-3.5" />
          Prepare Customer Update
        </Button>
      </div>

      {active && draft ? (
        <div className="space-y-3 rounded-md border border-border/50 bg-background p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{active.status}</Badge>
            <span className="text-sm font-medium">{draft.projectName}</span>
            <span className="text-xs text-muted-foreground">
              {draft.progressPercent !== null
                ? `${draft.progressPercent}% · ${draft.tasksCompleted}/${draft.tasksTotal} tasks`
                : draft.projectStatusLabel}
            </span>
          </div>

          <ItemGroup
            title="Work completed"
            items={draft.workCompleted}
            empty="No completed work since the last published update."
            onToggle={toggleItem}
            disabled={busy}
          />
          <ItemGroup
            title="In progress"
            items={draft.inProgress}
            empty="No active tasks."
            onToggle={toggleItem}
            disabled={busy}
          />
          <ItemGroup
            title="Coming next"
            items={draft.comingNext}
            empty="No upcoming tasks or milestones."
            onToggle={toggleItem}
            disabled={busy}
          />

          <div className="space-y-1.5">
            <Label htmlFor="staff-message">Additional message</Label>
            <Input
              id="staff-message"
              value={staffMessage}
              onChange={(event) => setStaffMessage(event.target.value)}
              placeholder="Optional note for the customer"
              disabled={busy}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void runPreview()}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Preview Email
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void sendUpdate(true)}
            >
              Send Test
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => void sendUpdate(false)}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send Customer Update
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setActive(null);
                setPreview(null);
              }}
            >
              Close draft
            </Button>
          </div>

          {preview ? (
            <div className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Preview
              </p>
              <p className="text-sm font-medium">{preview.subject}</p>
              <p className="text-xs text-muted-foreground">{preview.previewText}</p>
              <p className="text-xs text-muted-foreground">
                Recipients:{" "}
                {preview.recipients.map((recipient) => recipient.email).join(", ") || "None"}
              </p>
              {preview.emptyActivity ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  No new activity items included — message-only update.
                </p>
              ) : null}
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-background p-2 text-xs text-muted-foreground">
                {preview.text}
              </pre>
            </div>
          ) : null}

          {active.failureReason ? (
            <p className="text-xs text-destructive">Last failure: {active.failureReason}</p>
          ) : null}
        </div>
      ) : null}

      {updates.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Update history
          </p>
          <ul className="space-y-1.5">
            {updates.slice(0, 8).map((update) => (
              <li
                key={update.id}
                className="rounded border border-border/40 px-2.5 py-2 text-xs text-muted-foreground"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{update.status}</Badge>
                  <span>{update.subject ?? "Untitled draft"}</span>
                </div>
                <p className="mt-1">
                  {update.delivery
                    ? `${update.delivery.recipientEmail} · provider ${update.delivery.status}${
                        update.delivery.deliveredAt ? " · delivered confirmed" : ""
                      }${update.delivery.isTest ? " · TEST" : ""}`
                    : update.publishedAt
                      ? `Published ${new Date(update.publishedAt).toLocaleString()}`
                      : "Not sent"}
                </p>
                {update.failureReason ? (
                  <p className="mt-1 text-destructive">{update.failureReason}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ItemGroup({
  title,
  items,
  empty,
  onToggle,
  disabled,
}: {
  title: string;
  items: DraftItem[];
  empty: string;
  onToggle: (id: string, included: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={item.included}
                disabled={disabled}
                onChange={(event) => onToggle(item.id, event.target.checked)}
              />
              <div>
                <p className="font-medium text-foreground">
                  {item.title}{" "}
                  <span className="font-normal text-muted-foreground">({item.kind})</span>
                </p>
                {item.completedAtLabel ? (
                  <p className="text-muted-foreground">Completed {item.completedAtLabel}</p>
                ) : null}
                {item.targetOrDueLabel ? (
                  <p className="text-muted-foreground">Target/due {item.targetOrDueLabel}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
