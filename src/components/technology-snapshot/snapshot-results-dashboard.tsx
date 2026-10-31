"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import { SnapshotContactCapture } from "@/components/technology-snapshot/snapshot-contact-capture";
import { SnapshotRadar } from "@/components/technology-snapshot/snapshot-radar";
import { buttonVariants } from "@/components/ui/button";
import {
  trackSnapshotAssessmentCtaClick,
  trackSnapshotConsultationClick,
} from "@/lib/analytics/ga4-events";
import { SNAPSHOT_CATEGORIES_V2 } from "@/lib/technology-snapshot/catalog-v2";
import { SNAPSHOT_OFFICIAL_DISCLAIMER } from "@/lib/technology-snapshot/display";
import type { SnapshotAnswersV2, SnapshotFindingsV2 } from "@/lib/technology-snapshot/engine";
import type { SnapshotBusinessContext } from "@/lib/technology-snapshot/session-state";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { cn } from "@/lib/utils";

type SnapshotResultsDashboardProps = {
  findings: SnapshotFindingsV2;
  context: SnapshotBusinessContext;
  answers: SnapshotAnswersV2;
  prospectId?: string;
  campaignId?: string;
  invitationFlow?: boolean;
  onRestart?: () => void;
  onLeadSaved?: (leadId: string) => void;
};

export function SnapshotResultsDashboard({
  findings,
  context,
  answers,
  prospectId,
  campaignId,
  invitationFlow = false,
  onRestart,
  onLeadSaved,
}: SnapshotResultsDashboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(findings.categories[0]?.id ?? null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const headingId = useId();

  const completed = new Date(findings.scoredAt);
  const companyLabel = context.companyName.trim() || "Your organization";
  const strongest = SNAPSHOT_CATEGORIES_V2.find(
    (c) => c.id === findings.keyFindings.strongestCategoryId,
  );
  const highestRisk = SNAPSHOT_CATEGORIES_V2.find(
    (c) => c.id === findings.keyFindings.highestRiskCategoryId,
  );

  const consultHref = `${SERVICES_CTA_DESTINATIONS.generalConsultation.href}${
    SERVICES_CTA_DESTINATIONS.generalConsultation.href.includes("?") ? "&" : "?"
  }utm_source=technology_snapshot&utm_medium=results`;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Free Technology Snapshot
        </p>
        <h1 id={headingId} className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          {companyLabel}
        </h1>
        <p className="text-sm text-muted-foreground">
          Completed{" "}
          {completed.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="inline-flex flex-col items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-5 py-3">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Indicative technology posture
          </span>
          <span className="text-xl font-semibold text-foreground sm:text-2xl">
            {findings.overall.classificationLabel}
          </span>
        </div>
        <p className="mx-auto max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
          {findings.overall.summary}
        </p>
        <p className="text-xs text-muted-foreground">{SNAPSHOT_OFFICIAL_DISCLAIMER}</p>
      </header>

      <CornerBrackets corners="four" className="w-full">
        <div className="border border-primary/30 bg-card/50 p-4 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.08)] sm:p-6 md:p-8">
          <h2 className="text-center text-sm font-semibold tracking-tight text-foreground sm:text-base">
            Indicative Snapshot profile
          </h2>
          <SnapshotRadar categories={findings.categories} className="mt-3 sm:mt-4" />
        </div>
      </CornerBrackets>

      {findings.criticalRisks.length > 0 ? (
        <section aria-labelledby="critical-risks-heading" className="space-y-3">
          <h2 id="critical-risks-heading" className="flex items-center gap-2 text-lg font-semibold">
            <ShieldAlert className="h-5 w-5 text-amber-400" aria-hidden />
            Critical attention items
          </h2>
          <p className="text-sm text-muted-foreground">
            These flags come from specific answers. They stay visible even when the overall posture
            looks stronger in other areas.
          </p>
          <ul className="space-y-3">
            {findings.criticalRisks.map((risk) => (
              <li
                key={risk.id}
                className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
                  <div>
                    <p className="font-medium text-foreground">{risk.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{risk.summary}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Based on question {risk.questionId} ({risk.answer}).
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="categories-heading" className="space-y-3">
        <h2 id="categories-heading" className="text-lg font-semibold">
          Technology categories
        </h2>
        <div className="grid gap-3">
          {findings.categories.map((category) => {
            const open = expandedId === category.id;
            return (
              <div
                key={category.id}
                className="overflow-hidden rounded-xl border border-primary/15 bg-card/30"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-primary/5 sm:px-5"
                  aria-expanded={open}
                  onClick={() => setExpandedId(open ? null : category.id)}
                >
                  <div>
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.classificationLabel}</p>
                  </div>
                  <span className="text-xs text-primary">{open ? "Hide" : "Details"}</span>
                </button>
                {open ? (
                  <div className="space-y-3 border-t border-border/60 px-4 py-4 text-sm sm:px-5">
                    <p className="text-muted-foreground">{category.summary}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-border/50 bg-background/40 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Biggest strength
                        </p>
                        <p className="mt-1 text-foreground">
                          {category.strength?.text ?? "No clear strength signaled in this area."}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background/40 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Biggest concern
                        </p>
                        <p className="mt-1 text-foreground">
                          {category.concern?.text ?? "No major concern stood out in this area."}
                        </p>
                      </div>
                    </div>
                    <p>
                      <span className="font-medium text-foreground">Recommended next step: </span>
                      <span className="text-muted-foreground">{category.nextStep}</span>
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="key-findings-heading" className="space-y-3">
        <h2 id="key-findings-heading" className="text-lg font-semibold">
          Key findings
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-primary/15 bg-card/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Strongest category
            </p>
            <p className="mt-1 font-medium text-foreground">{strongest?.name}</p>
          </div>
          <div className="rounded-xl border border-primary/15 bg-card/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Most significant potential risk
            </p>
            <p className="mt-1 font-medium text-foreground">{highestRisk?.name}</p>
          </div>
        </div>
        <div className="rounded-xl border border-primary/15 bg-card/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Prioritized improvement opportunities
          </p>
          <ol className="mt-3 space-y-3">
            {findings.keyFindings.opportunities.map((opp, index) => (
              <li key={opp.questionId} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-foreground">{opp.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{opp.why}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    From question {opp.questionId} ({opp.answer}).
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="next-steps-heading" className="space-y-4">
        <h2 id="next-steps-heading" className="text-lg font-semibold">
          Next steps
        </h2>
        <div className="flex flex-col gap-3">
          <a
            href={consultHref}
            className={cn(buttonVariants({ size: "lg" }), "h-auto w-full justify-center py-3")}
            onClick={() => trackSnapshotConsultationClick()}
          >
            Book Your Free 60-Minute Technology Consultation
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
          <Link
            href="/assessment-offer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-auto w-full justify-center py-3",
            )}
            onClick={() =>
              trackSnapshotAssessmentCtaClick({ destinationPath: "/assessment-offer" })
            }
          >
            Get Your Full StackScore Assessment — $1,500
          </Link>
          <Link
            href="/demo/overview"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "h-auto w-full justify-center py-3 text-primary",
            )}
          >
            Explore the Full StackScore Demo
          </Link>
        </div>
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {[
            "Official StackScore from a completed assessment",
            "Pillar-level maturity analysis",
            "Prioritized recommendations",
            "Executive-ready report",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {!leadId ? (
        <SnapshotContactCapture
          answers={answers}
          context={context}
          prospectId={prospectId}
          campaignId={campaignId}
          onSaved={(id) => {
            setLeadId(id);
            onLeadSaved?.(id);
          }}
        />
      ) : (
        <div
          className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"
          role="status"
        >
          <p className="font-medium text-foreground">Snapshot saved for follow-up.</p>
          {invitationFlow ? (
            <p className="mt-1 text-muted-foreground">
              If you were invited to continue into a full assessment, use any email link from Bobkat
              IT or ask your consultant for next steps. Lead reference: {leadId.slice(0, 8)}…
            </p>
          ) : (
            <p className="mt-1 text-muted-foreground">
              Bobkat IT can reach you using the contact details you provided.
            </p>
          )}
        </div>
      )}

      {onRestart ? (
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={onRestart}
          >
            Start another Snapshot
          </button>
        </div>
      ) : null}
    </div>
  );
}
