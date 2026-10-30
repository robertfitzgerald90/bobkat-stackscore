"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ClipboardList, Compass, X } from "lucide-react";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
} from "@/components/client-ui";
import { PillarDetailPanel } from "@/components/customer-portal/explore/pillar-detail-panel";
import { PillarTile } from "@/components/customer-portal/explore/pillar-tile";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_EQUAL_CARD_GRID } from "@/lib/client-ui/tokens";
import { customerOverviewPath } from "@/lib/clients/paths";
import {
  isTechnologyPillarCode,
  type CustomerExploreDto,
} from "@/lib/customer-portal/pillar-detail-dto";
import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import { cn } from "@/lib/utils";

type CustomerExploreExperienceProps = {
  explore: CustomerExploreDto;
};

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
  const [mobileDetailOpen, setMobileDetailOpen] = useState(Boolean(paramPillar));

  useEffect(() => {
    setSelected(selectedFromUrl);
    if (paramPillar && isTechnologyPillarCode(paramPillar)) {
      setMobileDetailOpen(true);
    }
  }, [selectedFromUrl, paramPillar]);

  const selectPillar = useCallback(
    (code: TechnologyPillarCode) => {
      setSelected(code);
      setMobileDetailOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("pillar", code);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeMobileDetail = useCallback(() => {
    setMobileDetailOpen(false);
  }, []);

  const detail = selected ? explore.detailsByCode[selected] : null;

  if (!explore.hasCompletedAssessment && !explore.assessmentInProgress) {
    return (
      <ClientPageShell className="max-w-4xl">
        <ClientPageHeader
          eyebrow="Technology Maturity"
          title="Explore"
          description="Select a technology pillar to review maturity, evidence, and improvement opportunities."
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
    <ClientPageShell>
      <ClientPageHeader
        eyebrow="Technology Maturity"
        title="Explore"
        description="Select any of the eight technology pillars to understand maturity, evidence, and improvement opportunities."
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <section className="space-y-3" aria-label="Technology pillars">
          <div className={CLIENT_EQUAL_CARD_GRID}>
            {explore.pillars.map((pillar) => (
              <PillarTile
                key={pillar.code}
                pillar={pillar}
                selected={selected === pillar.code}
                interactive
                onSelect={selectPillar}
              />
            ))}
          </div>
        </section>

        {/* Desktop / tablet adjacent detail */}
        <div className="hidden lg:block">
          {detail ? (
            <PillarDetailPanel detail={detail} />
          ) : (
            <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Select a pillar to view maturity detail.
            </p>
          )}
        </div>
      </div>

      {/* Mobile / small tablet full-screen detail sheet */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background lg:hidden",
          mobileDetailOpen && detail ? "flex flex-col" : "hidden",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={detail ? `${detail.name} details` : "Pillar details"}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Pillar detail</p>
          <button
            type="button"
            className={buttonClassName({ variant: "ghost", size: "sm" })}
            onClick={closeMobileDetail}
            aria-label="Close pillar detail"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {detail ? <PillarDetailPanel detail={detail} /> : null}
        </div>
      </div>
    </ClientPageShell>
  );
}
