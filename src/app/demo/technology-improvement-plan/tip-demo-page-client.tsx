"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  TechnologyImprovementPlanDemo,
  isTipDemoStage,
  type TipDemoStage,
} from "@/components/marketing-demo";

type TipDemoPageClientProps = {
  initialStage: TipDemoStage;
};

export function TipDemoPageClient({ initialStage }: TipDemoPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeStage = isTipDemoStage(searchParams.get("stage"))
    ? (searchParams.get("stage") as TipDemoStage)
    : initialStage;

  const handleStageChange = useCallback(
    (stage: TipDemoStage) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("stage", stage);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <TechnologyImprovementPlanDemo
      activeStage={activeStage}
      audience="client"
      onStageChange={handleStageChange}
    />
  );
}
