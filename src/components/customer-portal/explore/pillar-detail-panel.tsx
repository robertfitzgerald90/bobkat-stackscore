import { PillarIntelligenceTabs } from "@/components/customer-portal/explore/pillar-intelligence-tabs";
import { PillarOverview } from "@/components/customer-portal/explore/pillar-overview";
import { PillarStrengthsAttention } from "@/components/customer-portal/explore/pillar-strengths-attention";
import type { CustomerPillarDetailDto } from "@/lib/customer-portal/pillar-detail-dto";
import { cn } from "@/lib/utils";

type PillarDetailPanelProps = {
  detail: CustomerPillarDetailDto;
  className?: string;
};

/**
 * SS-UX-016-R1 — Full-width pillar intelligence stack.
 * Prefer composing from CustomerExploreExperience; this wrapper remains for reuse.
 */
export function PillarDetailPanel({ detail, className }: PillarDetailPanelProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <PillarOverview detail={detail} />
      <PillarStrengthsAttention
        code={detail.code}
        strengths={detail.strengths}
        attentionItems={detail.attentionItems}
      />
      <PillarIntelligenceTabs detail={detail} />
    </div>
  );
}
