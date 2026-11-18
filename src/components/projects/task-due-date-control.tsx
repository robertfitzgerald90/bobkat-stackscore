"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TaskDueDateControl({
  title,
  dueDate,
  disabled,
  onSave,
}: {
  title: string;
  dueDate: string | null;
  disabled: boolean;
  onSave: (date: string | null) => Promise<boolean>;
}) {
  const initial = dueDate?.slice(0, 10) ?? "";
  const [date, setDate] = useState(initial);
  const [savedDate, setSavedDate] = useState(initial);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    setMessage("");
    try {
      // Date-only deadlines cover the selected UTC calendar day, not its first morning.
      const ok = await onSave(date ? `${date}T23:59:59.999Z` : null);
      if (ok) {
        setSavedDate(date);
        setMessage("Due date saved.");
      } else setMessage("Due date was not saved. Try again.");
    } catch {
      setMessage("Due date was not saved. Try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="mt-3 space-y-1.5 border-t border-border/50 pt-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 text-xs text-muted-foreground">
          <span className="mb-1 block">Due date</span>
          <input
            type="date"
            aria-label={`Due date for ${title}`}
            value={date}
            disabled={disabled || saving}
            onChange={(event) => {
              setDate(event.target.value);
              setMessage("");
            }}
            className="min-h-9 max-w-full rounded-md border border-border bg-background px-2 text-sm text-foreground"
          />
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || saving || date === savedDate}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : "Save due date"}
        </Button>
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {message || (date !== savedDate ? "Unsaved due date" : "")}
      </p>
    </div>
  );
}
