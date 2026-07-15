import { TechnologyMaturityProfile } from "@/components/technology-maturity/technology-maturity-profile";
import { technologyMaturityProfilePropsFromDetail } from "@/lib/technology-maturity/profile-props";
import type { TechnologyProfileDetail } from "@/lib/technology-profile/types";

type TpHeroSummaryProps = {
  detail: TechnologyProfileDetail;
  marketingPreview?: boolean;
};

export function TpHeroSummary({ detail, marketingPreview = false }: TpHeroSummaryProps) {
  const profileProps = technologyMaturityProfilePropsFromDetail(detail);

  return <TechnologyMaturityProfile {...profileProps} marketingPreview={marketingPreview} />;
}
