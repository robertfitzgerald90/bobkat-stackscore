import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CLIENT_METRIC_VALUE,
  clientSurfaceCardClass,
  type ClientVisualVariant,
} from "@/lib/client-ui/tokens";
import { formatMaturityScore } from "@/lib/scoring/score-display";
import { cn } from "@/lib/utils";

type ClientScoreHeroProps = {
  label?: string;
  score: number | null;
  maxScore?: number;
  maturityLabel?: string | null;
  sublabel?: string;
  /** Score hero is a major panel — industrial by default (SS-UX-003). */
  variant?: ClientVisualVariant;
  className?: string;
  scoreClassName?: string;
};

export function ClientScoreHero({
  label = "Overall StackScore",
  score,
  maxScore = 100,
  maturityLabel,
  sublabel,
  variant = "industrial",
  className,
  scoreClassName,
}: ClientScoreHeroProps) {
  return (
    <Card className={cn(clientSurfaceCardClass(variant), className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-4">
        <div>
          <p className={cn("text-5xl font-semibold text-foreground", CLIENT_METRIC_VALUE, scoreClassName)}>
            {formatMaturityScore(score)}
            {score !== null && score !== undefined && Number.isFinite(score) ? (
              <span className="text-2xl font-normal text-muted-foreground"> / {maxScore}</span>
            ) : null}
          </p>
          {maturityLabel ? (
            <Badge variant="outline" className="mt-3">
              {maturityLabel}
            </Badge>
          ) : null}
        </div>
        {sublabel ? (
          <div className="rounded-lg bg-muted/30 px-4 py-3">
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
