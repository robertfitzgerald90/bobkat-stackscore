"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, Loader2, NotebookPen, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/display";

type PlanningNote = {
  id: string;
  noteType: "executive" | "strategy_session";
  title: string | null;
  content: string;
  scheduledAt: string | null;
  completedAt: string | null;
  actionItemsJson: unknown;
  createdAt: string;
  user: { name: string } | null;
};

type TimelineItem = {
  id: string;
  label: string;
  date: string;
  type: "assessment" | "project" | "qbr" | "technology";
};

type PlanningItem = {
  id: string;
  name: string;
  vendor: string;
  renewalDate: string | null;
  warrantyExpiresAt: string | null;
  plannedReplacementDate: string | null;
  budgetAmountCents: number | null;
  budgetPeriod: string | null;
};

type Props = {
  clientId: string;
  canEdit: boolean;
  readOnlyReason: string | null;
  initialNotes: PlanningNote[];
  timeline: TimelineItem[];
  planningItems: PlanningItem[];
  annualAssessmentDue: boolean;
  nextRecommendedAssessmentAt: string | null;
};

function formatMoney(cents: number | null) {
  if (cents === null) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function actionItems(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

export function VcioFeatureUnlocksPanel({
  clientId,
  canEdit,
  readOnlyReason,
  initialNotes,
  timeline,
  planningItems,
  annualAssessmentDue,
  nextRecommendedAssessmentAt,
}: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [noteType, setNoteType] = useState<"executive" | "strategy_session">("executive");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [actionItemsText, setActionItemsText] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveNote() {
    if (!content.trim()) {
      toast.error("Add note content before saving.");
      return;
    }
    setSaving(true);
    const response = await fetch(`/api/v1/clients/${clientId}/vcio/planning-notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noteType,
        title,
        content,
        scheduledAt: scheduledAt || null,
        completedAt: completedAt || null,
        actionItems: actionItemsText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });
    setSaving(false);
    const payload = (await response.json().catch(() => null)) as
      | { note?: PlanningNote; error?: string }
      | null;
    if (!response.ok || !payload?.note) {
      toast.error(payload?.error ?? "Unable to save vCIO planning note.");
      return;
    }
    setNotes((current) => [payload.note as PlanningNote, ...current]);
    setTitle("");
    setContent("");
    setScheduledAt("");
    setCompletedAt("");
    setActionItemsText("");
    toast.success("vCIO planning note saved.");
  }

  return (
    <div className="space-y-4">
      {!canEdit && readOnlyReason ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-sm text-muted-foreground">{readOnlyReason}</CardContent>
        </Card>
      ) : null}

      {annualAssessmentDue ? (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent className="flex items-start gap-3 p-4 text-sm">
            <CalendarDays className="mt-0.5 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium">Annual assessment refresh recommended</p>
              <p className="text-muted-foreground">
                Technology assessment data should be refreshed every twelve months.
                {nextRecommendedAssessmentAt
                  ? ` Recommended date: ${formatDisplayDate(nextRecommendedAssessmentAt)}.`
                  : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <NotebookPen className="h-4 w-4 text-primary" />
              Executive Notes & Strategy Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {canEdit ? (
              <div className="space-y-3 rounded-xl border border-border/60 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                    value={noteType}
                    onChange={(event) =>
                      setNoteType(event.target.value as "executive" | "strategy_session")
                    }
                  >
                    <option value="executive">Executive Note</option>
                    <option value="strategy_session">Strategy Session</option>
                  </select>
                  <input
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    type="datetime-local"
                  />
                </div>
                {noteType === "strategy_session" ? (
                  <input
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    value={completedAt}
                    onChange={(event) => setCompletedAt(event.target.value)}
                    type="datetime-local"
                    aria-label="Completed date and time"
                  />
                ) : null}
                <input
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Title"
                />
                <textarea
                  className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Planning notes, decisions, or session summary"
                />
                <textarea
                  className="min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={actionItemsText}
                  onChange={(event) => setActionItemsText(event.target.value)}
                  placeholder="Action items, one per line"
                />
                <Button type="button" onClick={saveNote} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  Save Planning Note
                </Button>
              </div>
            ) : null}

            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vCIO planning notes yet.</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-border/60 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">
                        {note.title ?? (note.noteType === "executive" ? "Executive note" : "Strategy session")}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {note.scheduledAt
                          ? formatDisplayDate(note.scheduledAt)
                          : formatDisplayDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-muted-foreground">{note.content}</p>
                    {actionItems(note.actionItemsJson).length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                        {actionItems(note.actionItemsJson).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {note.completedAt ? (
                      <p className="mt-2 flex items-center gap-1 text-xs text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed {formatDisplayDate(note.completedAt)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Technology Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No timeline events yet.</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((item) => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type} · {formatDisplayDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget, Vendor, and Lifecycle Planning</CardTitle>
        </CardHeader>
        <CardContent>
          {planningItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add technologies in the Client Technology Profile to track vendors, renewals, licensing,
              warranties, replacements, and budgets.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {planningItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-border/60 p-3 text-sm">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">{item.vendor}</p>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {item.renewalDate ? <p>Renewal: {formatDisplayDate(item.renewalDate)}</p> : null}
                    {item.warrantyExpiresAt ? (
                      <p>Warranty: {formatDisplayDate(item.warrantyExpiresAt)}</p>
                    ) : null}
                    {item.plannedReplacementDate ? (
                      <p>Replacement: {formatDisplayDate(item.plannedReplacementDate)}</p>
                    ) : null}
                    {formatMoney(item.budgetAmountCents) ? (
                      <p>
                        Budget: {formatMoney(item.budgetAmountCents)}
                        {item.budgetPeriod ? ` / ${item.budgetPeriod}` : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
