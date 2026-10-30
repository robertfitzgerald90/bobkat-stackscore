"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  SerializedProjectMilestone,
  SerializedProjectRecommendationLink,
  SerializedProjectTask,
} from "@/lib/projects/delivery-service";
import type { ProjectProgressResult } from "@/lib/projects/progress";
import { ProjectCustomerUpdatePanel } from "@/components/projects/project-customer-update-panel";
import { toast } from "sonner";

type DeliveryBundle = {
  progress: ProjectProgressResult;
  tasks: SerializedProjectTask[];
  milestones: SerializedProjectMilestone[];
  recommendations: SerializedProjectRecommendationLink[];
};

type ProjectDeliveryPanelProps = {
  projectId: string;
  clientId: string;
};

const TASK_STATUS_LABEL: Record<SerializedProjectTask["status"], string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Complete",
};

export function ProjectDeliveryPanel({ projectId, clientId }: ProjectDeliveryPanelProps) {
  const [bundle, setBundle] = useState<DeliveryBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskTitle, setTaskTitle] = useState("");
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [linkRecommendationId, setLinkRecommendationId] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/delivery`);
      if (!response.ok) {
        toast.error("Failed to load delivery details");
        return;
      }
      const data = (await response.json()) as DeliveryBundle;
      setBundle(data);
    } catch {
      toast.error("Failed to load delivery details");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createTask() {
    if (!taskTitle.trim()) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskTitle.trim() }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error ?? "Failed to create task");
        return;
      }
      setTaskTitle("");
      toast.success("Task created");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function patchTask(
    taskId: string,
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error ?? "Failed to update task");
        return;
      }
      toast.success(successMessage);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeTask(taskId: string) {
    if (!window.confirm("Delete this task?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        toast.error("Failed to delete task");
        return;
      }
      toast.success("Task deleted");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function moveTask(taskId: string, direction: -1 | 1) {
    if (!bundle) return;
    const ids = bundle.tasks.map((task) => task.id);
    const index = ids.indexOf(taskId);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) return;
    const orderedIds = [...ids];
    const [item] = orderedIds.splice(index, 1);
    orderedIds.splice(next, 0, item);
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/tasks/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!response.ok) {
        toast.error("Failed to reorder tasks");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function createMilestone() {
    if (!milestoneTitle.trim()) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: milestoneTitle.trim() }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error ?? "Failed to create milestone");
        return;
      }
      setMilestoneTitle("");
      toast.success("Milestone created");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleMilestone(milestone: SerializedProjectMilestone) {
    setBusy(true);
    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/milestones/${milestone.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !milestone.completedAt }),
        },
      );
      if (!response.ok) {
        toast.error("Failed to update milestone");
        return;
      }
      toast.success(milestone.completedAt ? "Milestone reopened" : "Milestone completed");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeMilestone(milestoneId: string) {
    if (!window.confirm("Delete this milestone?")) return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/milestones/${milestoneId}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        toast.error("Failed to delete milestone");
        return;
      }
      toast.success("Milestone deleted");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function moveMilestone(milestoneId: string, direction: -1 | 1) {
    if (!bundle) return;
    const ids = bundle.milestones.map((milestone) => milestone.id);
    const index = ids.indexOf(milestoneId);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) return;
    const orderedIds = [...ids];
    const [item] = orderedIds.splice(index, 1);
    orderedIds.splice(next, 0, item);
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/milestones/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!response.ok) {
        toast.error("Failed to reorder milestones");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function linkRecommendation() {
    if (!linkRecommendationId.trim()) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: linkRecommendationId.trim() }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error ?? "Failed to link recommendation");
        return;
      }
      setLinkRecommendationId("");
      toast.success("Recommendation linked (status unchanged)");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function unlinkRecommendation(recommendationId: string, isPrimary: boolean) {
    if (isPrimary) {
      toast.error("Primary recommendation cannot be unlinked yet");
      return;
    }
    if (!window.confirm("Remove this recommendation link?")) return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/recommendations?recommendationId=${encodeURIComponent(recommendationId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error ?? "Failed to unlink recommendation");
        return;
      }
      toast.success("Recommendation unlinked");
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (loading || !bundle) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/10 p-3 text-sm text-muted-foreground">
        Loading delivery checklist…
      </div>
    );
  }

  const progressLabel =
    bundle.progress.progressPercent === null
      ? "No tasks yet"
      : `${bundle.progress.progressPercent}% (${bundle.progress.tasksCompleted}/${bundle.progress.tasksTotal})`;

  return (
    <div className="space-y-5 rounded-lg border border-border/60 bg-muted/10 p-3.5">
      <ProjectCustomerUpdatePanel projectId={projectId} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Delivery progress
        </p>
        <p className="mt-1 text-sm font-medium">{progressLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Task completion does not auto-complete the project or change StackScore.
        </p>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Tasks</h3>
          <span className="text-xs text-muted-foreground">{bundle.tasks.length}</span>
        </div>
        <div className="flex gap-2">
          <Input
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder="New task title"
            disabled={busy}
          />
          <Button type="button" size="sm" onClick={() => void createTask()} disabled={busy}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {bundle.tasks.map((task, index) => (
            <li
              key={task.id}
              className="rounded-md border border-border/50 bg-background px-2.5 py-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium leading-snug">{task.title}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary">{TASK_STATUS_LABEL[task.status]}</Badge>
                    {task.dueDate ? (
                      <Badge variant="outline">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </Badge>
                    ) : null}
                  </div>
                  {task.internalNotes ? (
                    <p className="text-xs text-muted-foreground">
                      Internal: {task.internalNotes}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busy || index === 0}
                    onClick={() => void moveTask(task.id, -1)}
                    aria-label="Move task up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busy || index === bundle.tasks.length - 1}
                    onClick={() => void moveTask(task.id, 1)}
                    aria-label="Move task down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {task.status !== "completed" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void patchTask(task.id, { status: "completed" }, "Task completed")
                    }
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Complete
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void patchTask(task.id, { status: "in_progress" }, "Task reopened")
                    }
                  >
                    Reopen
                  </Button>
                )}
                {task.status === "not_started" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      void patchTask(task.id, { status: "in_progress" }, "Task started")
                    }
                  >
                    Start
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void removeTask(task.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Milestones</h3>
          <span className="text-xs text-muted-foreground">{bundle.milestones.length}</span>
        </div>
        <div className="flex gap-2">
          <Input
            value={milestoneTitle}
            onChange={(event) => setMilestoneTitle(event.target.value)}
            placeholder="New milestone title"
            disabled={busy}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => void createMilestone()}
            disabled={busy}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {bundle.milestones.map((milestone, index) => (
            <li
              key={milestone.id}
              className="rounded-md border border-border/50 bg-background px-2.5 py-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium leading-snug">{milestone.title}</p>
                  <Badge variant={milestone.completedAt ? "success" : "secondary"}>
                    {milestone.completedAt ? "Complete" : "Open"}
                  </Badge>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busy || index === 0}
                    onClick={() => void moveMilestone(milestone.id, -1)}
                    aria-label="Move milestone up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busy || index === bundle.milestones.length - 1}
                    onClick={() => void moveMilestone(milestone.id, 1)}
                    aria-label="Move milestone down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void toggleMilestone(milestone)}
                >
                  {milestone.completedAt ? "Reopen" : "Mark complete"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void removeMilestone(milestone.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Linked recommendations</h3>
        <p className="text-xs text-muted-foreground">
          Linking does not change recommendation status. Client: {clientId.slice(0, 8)}…
        </p>
        <div className="flex gap-2">
          <Input
            value={linkRecommendationId}
            onChange={(event) => setLinkRecommendationId(event.target.value)}
            placeholder="Recommendation UUID to link"
            disabled={busy}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => void linkRecommendation()}
            disabled={busy}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {bundle.recommendations.map((link) => (
            <li
              key={link.id}
              className="flex items-start justify-between gap-2 rounded-md border border-border/50 bg-background px-2.5 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium leading-snug">{link.title}</p>
                <p className="text-xs text-muted-foreground">
                  {link.isPrimary ? "Primary" : "Additional"} · {link.status}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy || link.isPrimary}
                onClick={() => void unlinkRecommendation(link.recommendationId, link.isPrimary)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Staff notes on tasks</Label>
        <p className="text-xs text-muted-foreground">
          Use task internal notes for private staff context — never shown to customers.
        </p>
      </div>
    </div>
  );
}
