import { getPillarDisplayForCategoryCode } from "@/lib/technology-maturity/pillars";
import { cn } from "@/lib/utils";

type RecommendationPillarHintProps = {
  categoryCode: string;
  className?: string;
  documentTheme?: boolean;
};

export function RecommendationPillarHint({
  categoryCode,
  className,
  documentTheme = false,
}: RecommendationPillarHintProps) {
  const pillar = getPillarDisplayForCategoryCode(categoryCode);
  if (!pillar) return null;

  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "break-words text-xs font-medium",
          documentTheme ? "report-pillar-hint-title" : "text-foreground",
        )}
      >
        Technology Pillar: {pillar.pillarName}
      </p>
      <p
        className={cn(
          "break-words text-xs leading-relaxed",
          documentTheme ? "report-pillar-hint-body" : "text-muted-foreground",
        )}
      >
        {pillar.businessQuestion}
      </p>
    </div>
  );
}
