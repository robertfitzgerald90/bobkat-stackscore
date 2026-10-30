import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import {
  ClientPageHeader,
  ClientPageShell,
  ClientSectionHeader,
  ClientStatusBadge,
} from "@/components/client-ui";
import { buttonClassName } from "@/components/ui/button";
import { CLIENT_SURFACE_CARD, CLIENT_SURFACE_CARD_INDUSTRIAL } from "@/lib/client-ui/tokens";
import type { CustomerProjectDetailDto } from "@/lib/customer-portal/projects-dto";
import { cn } from "@/lib/utils";

type CustomerProjectDetailProps = {
  detail: CustomerProjectDetailDto;
};

export function CustomerProjectDetail({ detail }: CustomerProjectDetailProps) {
  return (
    <ClientPageShell className="max-w-4xl space-y-8">
      <ClientPageHeader
        eyebrow="Project workspace"
        title={detail.title}
        description="Delivery detail for this improvement project. Tasks and milestones will appear here when Bobkat IT adds them."
        actions={
          <Link
            href={detail.listHref}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            All projects
          </Link>
        }
      />

      <section
        className={cn(CLIENT_SURFACE_CARD_INDUSTRIAL, "space-y-4 p-5 sm:p-6")}
        aria-labelledby="project-overview-heading"
      >
        <div className="flex flex-wrap items-center gap-2">
          <ClientStatusBadge tone="muted">{detail.statusLabel}</ClientStatusBadge>
          <ClientStatusBadge tone="default">{detail.priorityLabel}</ClientStatusBadge>
          {detail.pillarName ? (
            detail.pillarHref ? (
              <Link
                href={detail.pillarHref}
                className="text-xs font-medium text-primary hover:underline"
              >
                {detail.pillarName}
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">{detail.pillarName}</span>
            )
          ) : null}
        </div>
        <h2 id="project-overview-heading" className="text-xl font-bold text-foreground">
          Objective
        </h2>
        <p className="text-sm leading-relaxed text-foreground/90">
          {detail.description ??
            "Bobkat IT is delivering this improvement as a tracked project for your organization."}
        </p>

        <dl className="grid gap-3 sm:grid-cols-2">
          <MetaItem label="Start date" value={detail.startDateLabel ?? "Not set"} />
          <MetaItem
            label="Target completion"
            value={detail.targetCompletionDateLabel ?? "Not set"}
          />
          {detail.completedAtLabel ? (
            <MetaItem label="Completed" value={detail.completedAtLabel} />
          ) : null}
          <MetaItem
            label="Progress"
            value={
              detail.progressPercent !== null
                ? `${detail.progressPercent}%`
                : `Tracked by status · ${detail.statusLabel}`
            }
          />
        </dl>

        {detail.expectedOutcome ? (
          <div className="space-y-1.5 border-t border-border/60 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
              Expected outcome
            </h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {detail.expectedOutcome}
            </p>
          </div>
        ) : null}

        {detail.completionReportHref ? (
          <div className="pt-2">
            <Link
              href={detail.completionReportHref}
              className={buttonClassName({ size: "sm" })}
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden />
              View completion report
            </Link>
          </div>
        ) : null}
      </section>

      {detail.recommendations.length > 0 ? (
        <section className="space-y-3" aria-labelledby="project-recs-heading">
          <ClientSectionHeader
            eyebrow="Related"
            title="Recommendations"
            description="Assessment opportunities linked to this project."
          />
          <h2 id="project-recs-heading" className="sr-only">
            Related recommendations
          </h2>
          <ul className="space-y-2">
            {detail.recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <Link
                  href={recommendation.href}
                  className={cn(
                    CLIENT_SURFACE_CARD,
                    "flex flex-col gap-1 rounded-sm border bg-card p-4 transition-colors hover:border-primary",
                  )}
                >
                  <span className="font-medium text-foreground">{recommendation.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {recommendation.statusLabel}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.roadmapInitiatives.length > 0 ? (
        <section className="space-y-3" aria-labelledby="project-initiatives-heading">
          <ClientSectionHeader
            eyebrow="Roadmap"
            title="Related initiatives"
            description="Roadmap initiatives that share this project's recommendation."
          />
          <h2 id="project-initiatives-heading" className="sr-only">
            Related roadmap initiatives
          </h2>
          <ul className="space-y-2">
            {detail.roadmapInitiatives.map((initiative) => (
              <li key={initiative.id}>
                <Link
                  href={initiative.href}
                  className={cn(
                    CLIENT_SURFACE_CARD,
                    "flex flex-col gap-1 rounded-sm border bg-card p-4 transition-colors hover:border-primary",
                  )}
                >
                  <span className="font-medium text-foreground">{initiative.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Phase · {initiative.phaseName}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.activity.length > 0 ? (
        <section className="space-y-3" aria-labelledby="project-activity-heading">
          <ClientSectionHeader
            eyebrow="History"
            title="Activity"
            description="Customer-visible updates for this project."
          />
          <h2 id="project-activity-heading" className="sr-only">
            Project activity
          </h2>
          <ol className="space-y-3">
            {detail.activity.map((event) => (
              <li
                key={event.id}
                className={cn(CLIENT_SURFACE_CARD, "rounded-sm border bg-card p-4")}
              >
                <p className="text-xs text-muted-foreground">{event.occurredAtLabel}</p>
                <p className="mt-1 font-medium text-foreground">{event.title}</p>
                {event.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section
        className="rounded-sm border border-dashed border-border/80 bg-muted/10 px-4 py-3"
        aria-label="Upcoming project capabilities"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Coming next
        </p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {detail.showTaskPlaceholder ? (
            <li>Task checklist — delivery steps will appear when Bobkat IT adds them.</li>
          ) : null}
          {detail.showMilestonePlaceholder ? (
            <li>Milestones — target checkpoints will appear when configured.</li>
          ) : null}
          {detail.showUpdatesPlaceholder ? (
            <li>Project updates — staff-initiated notifications will appear here.</li>
          ) : null}
        </ul>
      </section>
    </ClientPageShell>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-muted/10 px-3 py-2">
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
