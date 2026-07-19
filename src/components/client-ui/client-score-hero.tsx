import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLIENT_METRIC_VALUE, CLIENT_SURFACE_CARD } from "@/lib/client-ui/tokens";
import { cn } from "@/lib/utils";

type ClientScoreHeroProps = {
  label?: string;
  score: number | null;
  maxScore?: number;
  maturityLabel?: string | null;
  sublabel?: string;
  className?: string;
  scoreClassName?: string;
};

export function ClientScoreHero({
  label = "Overall StackScore",
  score,
  maxScore = 100,
  maturityLabel,
  sublabel,
  className,
  scoreClassName,
}: ClientScoreHeroProps) {
  return (
    <Card className={cn(CLIENT_SURFACE_CARD, className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-4">
        <div>
          <p className={cn("text-5xl font-semibold text-foreground", CLIENT_METRIC_VALUE, scoreClassName)}>
            {score ?? "—"}
            {score !== null ? (
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
