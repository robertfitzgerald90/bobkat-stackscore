import type { ResponseFilterState, ResponseSummaryStats } from "@/lib/assessments/response-view";

type AssessmentResponseSummaryProps = {
  stats: ResponseSummaryStats;
};

export function AssessmentResponseSummary({ stats }: AssessmentResponseSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm sm:grid-cols-5">
      <SummaryItem label="Total questions" value={stats.totalQuestions} />
      <SummaryItem label="Answered" value={stats.answered} />
      <SummaryItem label="Unanswered" value={stats.unanswered} />
      <SummaryItem label="Flagged" value={stats.flagged} />
      <SummaryItem
        label="Sections complete"
        value={`${stats.sectionsCompleted}/${stats.sectionCount}`}
      />
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export type { ResponseFilterState };
