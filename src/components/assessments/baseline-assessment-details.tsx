import { Badge } from "@/components/ui/badge";
import { formatAssessmentCompletionDate } from "@/lib/assessments/display";
import { getRating, RATING_LABELS } from "@/lib/scoring";
import { RATING_BADGE_VARIANT } from "@/lib/scoring/rating-display";
import { getScoreTextColorClass } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type BaselineAssessmentDetailsProps = {
  completedAt: string | null;
  overallScore: number | null;
};

export function BaselineAssessmentDetails({
  completedAt,
  overallScore,
}: BaselineAssessmentDetailsProps) {
  const rating = overallScore !== null ? getRating(overallScore) : null;

  return (
    <div className="space-y-2.5 rounded-md border border-border/60 bg-background/90 px-3 py-2.5">
      <DetailRow label="Assessment Date" value={formatAssessmentCompletionDate(completedAt)} />
      <DetailRow
        label="Assessment Score"
        value={overallScore !== null ? String(overallScore) : "—"}
        valueClassName={cn("font-semibold tabular-nums", getScoreTextColorClass(overallScore))}
      />
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Assessment Rating</span>
        {rating ? (
          <Badge variant={RATING_BADGE_VARIANT[rating]}>{RATING_LABELS[rating]}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium tabular-nums", valueClassName)}>{value}</span>
    </div>
  );
}
