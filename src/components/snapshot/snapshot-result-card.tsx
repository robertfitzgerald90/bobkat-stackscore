import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SnapshotClassification } from "@/lib/technology-snapshot/types";
import { cn } from "@/lib/utils";

const CLASSIFICATION_VARIANT: Record<
  SnapshotClassification,
  "success" | "secondary" | "warning" | "destructive"
> = {
  healthy: "success",
  needs_attention: "secondary",
  elevated_risk: "warning",
  immediate_action: "destructive",
};

export type SnapshotResultCardData = {
  companyName: string;
  score: number;
  maxScore: number;
  status: string;
  classification: SnapshotClassification;
  summary: string;
  observations: string[];
};

type SnapshotResultCardProps = {
  data: SnapshotResultCardData;
  preview?: boolean;
  className?: string;
};

export function SnapshotResultCard({ data, preview = false, className }: SnapshotResultCardProps) {
  return (
    <Card
      className={cn(
        "border-primary/20 shadow-md",
        preview && "shadow-[0_16px_48px_-18px_rgba(8,47,91,0.16)]",
        className,
      )}
    >
      <CardHeader className="space-y-3 text-center">
        <p className="text-sm text-muted-foreground">{data.companyName}</p>
        <CardTitle className="text-2xl">Your Technology Snapshot</CardTitle>
        <div className="flex flex-col items-center gap-2">
          <p className="text-4xl font-bold tabular-nums text-primary">{data.score}</p>
          <p className="text-sm text-muted-foreground">out of {data.maxScore}</p>
          <Badge variant={CLASSIFICATION_VARIANT[data.classification]} className="text-sm">
            {data.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="break-words text-center text-sm leading-relaxed text-muted-foreground">
          {data.summary}
        </p>

        {data.observations.length > 0 ? (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Key observations</p>
            <ul className="space-y-2">
              {data.observations.map((observation) => (
                <li key={observation} className="flex gap-2 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 break-words">{observation}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function snapshotResultsPayloadToCardData(
  companyName: string,
  result: {
    totalScore: number;
    classification: SnapshotClassification;
    classificationLabel: string;
    summary: string;
    observations: string[];
  },
  maxScore: number,
): SnapshotResultCardData {
  return {
    companyName,
    score: result.totalScore,
    maxScore,
    status: result.classificationLabel,
    classification: result.classification,
    summary: result.summary,
    observations: result.observations,
  };
}
