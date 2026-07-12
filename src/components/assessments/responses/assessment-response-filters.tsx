"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResponseCategory, ResponseFilterState } from "@/lib/assessments/response-view";
import { DEFAULT_RESPONSE_FILTERS } from "@/lib/assessments/response-view";

type AssessmentResponseFiltersProps = {
  categories: ResponseCategory[];
  filters: ResponseFilterState;
  onChange: (filters: ResponseFilterState) => void;
};

export function AssessmentResponseFilters({
  categories,
  filters,
  onChange,
}: AssessmentResponseFiltersProps) {
  function update(partial: Partial<ResponseFilterState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="grid gap-3 rounded-lg border border-border/60 p-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1.5 xl:col-span-2">
        <Label htmlFor="response-search" className="text-xs">
          Search responses
        </Label>
        <Input
          id="response-search"
          value={filters.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Search question text, code, or answer"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Section</Label>
        <Select
          value={filters.sectionCode}
          onValueChange={(value) =>
            update({ sectionCode: (value ?? "all") as ResponseFilterState["sectionCode"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sections</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.code}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Answer status</Label>
        <Select
          value={filters.answerStatus}
          onValueChange={(value) =>
            update({ answerStatus: value as ResponseFilterState["answerStatus"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All answers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All answers</SelectItem>
            <SelectItem value="answered">Answered only</SelectItem>
            <SelectItem value="unanswered">Unanswered only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Finding severity</Label>
        <Select
          value={filters.severity}
          onValueChange={(value) =>
            update({ severity: value as ResponseFilterState["severity"] })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All findings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All findings</SelectItem>
            <SelectItem value="critical">Critical only</SelectItem>
            <SelectItem value="flagged">Flagged only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-end gap-2 xl:col-span-4">
        <FilterToggle
          active={filters.showUnansweredOnly}
          label="Unanswered only"
          onClick={() =>
            update({
              showUnansweredOnly: !filters.showUnansweredOnly,
              answerStatus: !filters.showUnansweredOnly ? "unanswered" : "all",
            })
          }
        />
        <FilterToggle
          active={filters.showFlaggedOnly}
          label="Flagged only"
          onClick={() =>
            update({
              showFlaggedOnly: !filters.showFlaggedOnly,
              severity: !filters.showFlaggedOnly ? "flagged" : "all",
            })
          }
        />
        <button
          type="button"
          className="text-xs text-primary hover:underline"
          onClick={() => onChange(DEFAULT_RESPONSE_FILTERS)}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}

function FilterToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted/40"
      }`}
    >
      {label}
    </button>
  );
}
