"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ClipboardList, Compass } from "lucide-react";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
} from "@/components/client-ui";
import { PillarIntelligenceTabs } from "@/components/customer-portal/explore/pillar-intelligence-tabs";
import { PillarOverview } from "@/components/customer-portal/explore/pillar-overview";
import { PillarSelector } from "@/components/customer-portal/explore/pillar-selector";
import { PillarStrengthsAttention } from "@/components/customer-portal/explore/pillar-strengths-attention";
import { buttonClassName } from "@/components/ui/button";
import { customerOverviewPath } from "@/lib/clients/paths";
import {
  isTechnologyPillarCode,
  type CustomerExploreDto,
} from "@/lib/customer-portal/pillar-detail-dto";
import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";

type CustomerExploreExperienceProps = {
  explore: CustomerExploreDto;
};

/**
 * SS-UX-016-R1 — Technology Intelligence Center layout.
 * Full-width stack: compact selector → overview → strengths/attention → tabs.
 * Reuses SS-UX-016 DTO; no left-grid/right-detail panel.
 */
export function CustomerExploreExperience({ explore }: CustomerExploreExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramPillar = searchParams.get("pillar");

  const selectedFromUrl = useMemo(() => {
    if (isTechnologyPillarCode(paramPillar)) return paramPillar;
    return explore.selectedPillarCode;
  }, [paramPillar, explore.selectedPillarCode]);

  const [selected, setSelected] = useState<TechnologyPillarCode | null>(selectedFromUrl);

  useEffect(() => {
    setSelected(selectedFromUrl);
  }, [selectedFromUrl]);

  const selectPillar = useCallback(
    (code: TechnologyPillarCode) => {
      setSelected(code);
      const params = new URLSearchParams(searchParams.toString());
      params.set("pillar", code);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const detail = selected ? explore.detailsByCode[selected] : null;

  if (!explore.hasCompletedAssessment && !explore.assessmentInProgress) {
    return (
      <ClientPageShell className="max-w-4xl">
        <ClientPageHeader
          eyebrow="Technology Maturity"
          title="Explore"
          description="Select a technology pillar to review maturity, findings, opportunities, and related improvement work."
        />
        <ClientEmptyState
          icon={ClipboardList}
          title="Assessment required"
          description="Complete a technology maturity assessment to explore pillar-level insights for your organization."
          nextStep="Return to Overview to continue your assessment journey."
          action={
            <Link
              href={customerOverviewPath(explore.clientId)}
              className={buttonClassName({})}
            >
              Go to Overview
            </Link>
          }
        />
      </ClientPageShell>
    );
  }

  return (
    <ClientPageShell className="max-w-6xl space-y-6">
      <ClientPageHeader
        eyebrow="Technology Maturity"
        title="Explore"
        description="Technology Intelligence Center — select a pillar to review maturity, what is working, what needs attention, and related improvement work."
        actions={
          <Link
            href={customerOverviewPath(explore.clientId)}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Overview
          </Link>
        }
      />

      {explore.assessmentInProgress && !explore.hasCompletedAssessment ? (
        <ClientEmptyState
          icon={Compass}
          title="Assessment in progress"
          description="Pillar scores unlock when you complete the assessment. You can still browse pillar definitions after completion."
          action={
            <Link href="/assessment/start" className={buttonClassName({})}>
              Resume Assessment
            </Link>
          }
        />
      ) : null}

      <PillarSelector
        pillars={explore.pillars}
        selected={selected}
        onSelect={selectPillar}
      />

      {detail ? (
        <div className="space-y-6" key={detail.code}>
          <PillarOverview detail={detail} />
          <PillarStrengthsAttention
            code={detail.code}
            strengths={detail.strengths}
            attentionItems={detail.attentionItems}
          />
          <PillarIntelligenceTabs detail={detail} />
        </div>
      ) : (
        <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          Select a pillar to view maturity detail.
        </p>
      )}
    </ClientPageShell>
  );
}
