import { getPillarDisplayForCategoryCode } from "@/lib/technology-maturity/pillars";
import { cn } from "@/lib/utils";

type RecommendationPillarHintProps = {
  categoryCode: string;
  className?: string;
};

export function RecommendationPillarHint({ categoryCode, className }: RecommendationPillarHintProps) {
  const pillar = getPillarDisplayForCategoryCode(categoryCode);
  if (!pillar) return null;

  return (
    <div className={cn("min-w-0", className)}>
      <p className="break-words text-xs font-medium text-foreground">
        Technology Pillar: {pillar.pillarName}
      </p>
      <p className="break-words text-xs leading-relaxed text-muted-foreground">
        {pillar.businessQuestion}
      </p>
    </div>
  );
}
