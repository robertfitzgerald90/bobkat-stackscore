import { getPillarDisplayForV1CategoryCode } from "@/lib/technology-maturity/pillars";

type RecommendationPillarHintProps = {
  categoryCode: string;
  className?: string;
};

export function RecommendationPillarHint({ categoryCode, className }: RecommendationPillarHintProps) {
  const pillar = getPillarDisplayForV1CategoryCode(categoryCode);
  if (!pillar) return null;

  return (
    <div className={className}>
      <p className="text-xs font-medium text-foreground">Technology Pillar: {pillar.pillarName}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{pillar.businessQuestion}</p>
    </div>
  );
}
