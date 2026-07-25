"use client";

import { useMemo, useState } from "react";
import { clientImprovementPlanDemoData } from "./data/client-improvement-plan-demo-data";
import { ExecutiveReportDemo } from "./stages/ExecutiveReportDemo";
import { MaturityProfileDemo } from "./stages/MaturityProfileDemo";
import { RecommendationsDemo } from "./stages/RecommendationsDemo";
import { SolutionPlaybooksDemo } from "./stages/SolutionPlaybooksDemo";
import { TechnologyRoadmapDemo } from "./stages/TechnologyRoadmapDemo";
import {
  TIP_DEMO_STAGE_LABELS,
  TIP_DEMO_STAGES,
  type ClientImprovementPlanDemoData,
  type TipDemoAudience,
  type TipDemoStage,
} from "./types";
import { cn } from "./utils/cn";

export type TechnologyImprovementPlanDemoProps = {
  activeStage?: TipDemoStage;
  defaultStage?: TipDemoStage;
  audience?: TipDemoAudience;
  data?: ClientImprovementPlanDemoData;
  onStageChange?: (stage: TipDemoStage) => void;
  className?: string;
  showStageTabs?: boolean;
};

export function TechnologyImprovementPlanDemo({
  activeStage,
  defaultStage = "maturity-profile",
  audience = "client",
  data = clientImprovementPlanDemoData,
  onStageChange,
  className,
  showStageTabs = true,
}: TechnologyImprovementPlanDemoProps) {
  const [uncontrolledStage, setUncontrolledStage] = useState<TipDemoStage>(defaultStage);
  const stage = activeStage ?? uncontrolledStage;

  const setStage = (next: TipDemoStage) => {
    if (activeStage === undefined) {
      setUncontrolledStage(next);
    }
    onStageChange?.(next);
  };

  const stageView = useMemo(() => {
    switch (stage) {
      case "maturity-profile":
        return <MaturityProfileDemo data={data} />;
      case "recommendations":
        return <RecommendationsDemo data={data} />;
      case "solution-playbooks":
        return <SolutionPlaybooksDemo data={data} />;
      case "technology-roadmap":
        return <TechnologyRoadmapDemo data={data} />;
      case "executive-report":
        return <ExecutiveReportDemo data={data} />;
      default:
        return <MaturityProfileDemo data={data} />;
    }
  }, [data, stage]);

  return (
    <div
      className={cn(
        "midnight min-w-0 max-w-full space-y-6 text-foreground",
        className,
      )}
      data-audience={audience}
      data-tip-demo-stage={stage}
    >
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {data.planTitle}
        </p>
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="page-title text-2xl font-semibold tracking-tight sm:text-3xl">
              {data.clientName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{data.assessmentName}</p>
          </div>
          <p className="text-sm text-muted-foreground">Client experience preview</p>
        </div>
      </header>

      {showStageTabs ? (
        <nav
          aria-label="Technology Improvement Plan stages"
          className="-mx-1 overflow-x-auto px-1 pb-1"
        >
          <div className="flex w-max min-w-full gap-2">
            {TIP_DEMO_STAGES.map((item) => {
              const selected = item === stage;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStage(item)}
                  className={cn(
                    "shrink-0 rounded-md border px-3 py-1.5 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted/40",
                  )}
                  aria-current={selected ? "page" : undefined}
                >
                  {TIP_DEMO_STAGE_LABELS[item]}
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}

      <div className="min-w-0">{stageView}</div>
    </div>
  );
}
