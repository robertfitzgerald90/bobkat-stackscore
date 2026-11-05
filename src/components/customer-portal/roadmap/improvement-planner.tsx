"use client";

import type { CSSProperties } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, ArrowRight, Flag } from "lucide-react";
import {
  HORIZONS,
  STATUSES,
  PLANNER_PILLARS,
  summarizePlanner,
  type PlannerTaskInput,
  type PlannerTaskView,
} from "@/lib/planner/model";
import { buttonClassName } from "@/components/ui/button";

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary";
const blank: PlannerTaskInput = {
  title: "",
  description: "",
  owner: "",
  pillarCode: null,
  horizon: "now",
  status: "planned",
  dueDate: null,
  steps: "",
};
export type PlannerSuggestion = {
  title: string;
  description: string;
  pillarCode: string | null;
};

export function ImprovementPlanner({
  clientId,
  initialTasks,
  suggestions = [],
}: {
  clientId: string;
  initialTasks: PlannerTaskView[];
  suggestions?: PlannerSuggestion[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<"all" | "open" | "complete">("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PlannerTaskInput>(blank);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const summary = summarizePlanner(tasks);
  const base = `/api/v1/clients/${clientId}/planner`;
  function open(task?: PlannerTaskView) {
    setError("");
    setEditing(task?.id ?? "new");
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        owner: task.owner,
        pillarCode: task.pillarCode,
        horizon: task.horizon,
        status: task.status,
        dueDate: task.dueDate,
        steps: task.steps,
      });
    } else setForm({ ...blank });
  }
  function mutate(
    method: string,
    id: string | null,
    data?: Partial<PlannerTaskInput>,
  ) {
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        const response = await fetch(id ? `${base}/${id}` : base, {
          method,
          headers: { "Content-Type": "application/json" },
          ...(data ? { body: JSON.stringify(data) } : {}),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            body.error ||
              body.message ||
              "Unable to save your task. Try again.",
          );
        }
        if (method === "POST") {
          const { task } = await response.json();
          setTasks((current) => [...current, task]);
        } else if (method === "DELETE")
          setTasks((current) => current.filter((t) => t.id !== id));
        else
          setTasks((current) =>
            current.map((t) => (t.id === id ? { ...t, ...data } : t)),
          );
        if (method !== "PATCH" || editing === id) setEditing(null);
        setNotice(method === "DELETE" ? "Task deleted." : "Changes saved.");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to save task");
      }
    });
  }
  return (
    <section
      style={
        {
          "--primary": "#4f8051",
          "--brand-primary-fill": "#315e3d",
          "--primary-foreground": "#ffffff",
        } as CSSProperties
      }
      className="space-y-5"
      aria-labelledby="planner-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Turn insight into progress
          </p>
          <h2
            id="planner-heading"
            className="mt-2 text-2xl font-semibold tracking-tight"
          >
            Your improvement planner
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a focused plan, assign ownership, and record your next
            meaningful improvement.
          </p>
        </div>
        <button
          className={buttonClassName({})}
          onClick={() => open()}
          disabled={pending}
        >
          <Plus className="mr-2 h-4 w-4" />
          New task
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Open actions", value: summary.open },
          {
            label: "Actions completed",
            value: `${summary.complete} / ${summary.total}`,
          },
          { label: "Action progress", value: `${summary.progress}%` },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
      <p className="flex gap-2 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
        <Flag className="h-5 w-5 shrink-0 text-primary" />
        Changes are saved to your workspace. Action progress tracks this
        planner; assessment scores and delivery projects are measured
        separately.
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        {pending ? "Saving…" : notice}
      </p>
      {editing !== null && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate(
              editing === "new" ? "POST" : "PATCH",
              editing === "new" ? null : editing,
              form,
            );
          }}
          className="space-y-4 rounded-xl border border-primary/30 bg-card p-5"
          aria-label={editing === "new" ? "Create task" : "Edit task"}
        >
          <h3 className="font-semibold">
            {editing === "new" ? "Create an action" : "Edit action"}
          </h3>
          {editing === "new" && suggestions.length > 0 && (
            <label className="block space-y-1 text-sm">
              <span>Start from a roadmap recommendation (optional)</span>
              <select
                className={field}
                defaultValue=""
                onChange={(e) => {
                  const suggestion = suggestions[Number(e.target.value)];
                  if (e.target.value !== "" && suggestion)
                    setForm((current) => ({ ...current, ...suggestion }));
                }}
              >
                <option value="">Custom task</option>
                {suggestions.map((s, i) => (
                  <option key={i} value={i}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block space-y-1 text-sm">
            <span>Title</span>
            <input
              autoFocus
              required
              maxLength={200}
              className={field}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Description</span>
            <textarea
              maxLength={5000}
              rows={3}
              className={field}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span>Owner</span>
              <input
                maxLength={200}
                className={field}
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Due date</span>
              <input
                type="date"
                className={field}
                value={form.dueDate ?? ""}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value || null })
                }
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Technology pillar</span>
              <select
                className={field}
                value={form.pillarCode ?? ""}
                onChange={(e) =>
                  setForm({ ...form, pillarCode: e.target.value || null })
                }
              >
                <option value="">General improvement</option>
                {PLANNER_PILLARS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span>Timing</span>
              <select
                className={field}
                value={form.horizon}
                onChange={(e) =>
                  setForm({
                    ...form,
                    horizon: e.target.value as PlannerTaskInput["horizon"],
                  })
                }
              >
                {Object.entries(HORIZONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span>Action status</span>
              <select
                className={field}
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as PlannerTaskInput["status"],
                  })
                }
              >
                {Object.entries(STATUSES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            <span>Implementation steps (one per line)</span>
            <textarea
              rows={4}
              maxLength={10000}
              className={field}
              value={form.steps}
              onChange={(e) => setForm({ ...form, steps: e.target.value })}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className={buttonClassName({})}
            >
              {pending ? "Saving…" : "Save task"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setEditing(null)}
              className={buttonClassName({ variant: "outline" })}
            >
              Cancel
            </button>
            {editing !== "new" && (
              <button
                type="button"
                disabled={pending}
                className={buttonClassName({ variant: "outline" })}
                onClick={() => {
                  if (window.confirm("Delete this task permanently?"))
                    mutate("DELETE", editing);
                }}
              >
                Delete task
              </button>
            )}
          </div>
        </form>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" aria-label="Filter actions">
          {(["all", "open", "complete"] as const).map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={buttonClassName({
                variant: filter === f ? "default" : "outline",
                size: "sm",
              })}
            >
              {f === "all" ? "All" : f === "open" ? "Open" : "Complete"}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {summary.total} actions · sequenced by business need
        </span>
      </div>
      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        {Object.entries(HORIZONS).map(([horizon, label]) => {
          const visible = tasks.filter(
            (t) =>
              t.horizon === horizon &&
              (filter === "all" ||
                (filter === "complete"
                  ? t.status === "complete"
                  : t.status !== "complete")),
          );
          return (
            <div
              key={horizon}
              className="min-w-0 space-y-3 rounded-xl border border-border bg-primary/[0.035] p-3 sm:p-4"
            >
              <h3 className="flex justify-between text-sm font-semibold">
                {label}
                <span className="rounded bg-primary/10 px-2 text-primary">
                  {visible.length}
                </span>
              </h3>
              {visible.map((task) => (
                <article
                  id={`task-${task.id}`}
                  key={task.id}
                  className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {PLANNER_PILLARS.find((p) => p.code === task.pillarCode)
                        ?.name ?? "General improvement"}
                    </p>
                    <h4 className="mt-2 break-words text-sm font-semibold">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </div>
                  {(task.owner || task.dueDate) && (
                    <p className="break-words text-xs text-muted-foreground">
                      {task.owner || "Unassigned"}
                      {task.dueDate ? ` · Due ${task.dueDate}` : ""}
                    </p>
                  )}
                  <label className="block space-y-1">
                    <span className="text-[10px] uppercase text-muted-foreground">
                      Action status
                      <span className="sr-only"> for {task.title}</span>
                    </span>
                    <select
                      className={field}
                      disabled={pending}
                      value={task.status}
                      onChange={(e) =>
                        mutate("PATCH", task.id, {
                          status: e.target.value as PlannerTaskInput["status"],
                        })
                      }
                    >
                      {Object.entries(STATUSES).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                  {task.steps && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium text-primary">
                        View steps
                      </summary>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                        {task.steps
                          .split("\n")
                          .filter((s) => s.trim())
                          .map((step, i) => (
                            <li key={i} className="break-words">
                              {step}
                            </li>
                          ))}
                      </ol>
                    </details>
                  )}
                  <button
                    disabled={pending}
                    className="flex items-center gap-2 text-xs font-medium text-primary"
                    onClick={() => open(task)}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit task<span className="sr-only">: {task.title}</span>
                  </button>
                </article>
              ))}
              {!visible.length && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No {filter === "complete" ? "completed " : ""}actions here
                  yet.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <Link
        href={`/clients/${clientId}/technology-profile`}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        Back to overview
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
