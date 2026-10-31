import type { ReactNode } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import {
  ClientEmptyState,
  ClientPageHeader,
  ClientPageShell,
  ClientSectionHeader,
} from "@/components/client-ui";
import { ReportCard } from "@/components/customer-portal/reports/report-card";
import { BookingButton } from "@/components/support/booking-button";
import { buttonClassName } from "@/components/ui/button";
import { customerOverviewPath } from "@/lib/clients/paths";
import {
  CLIENT_EQUAL_CARD_GRID,
  CLIENT_SURFACE_CARD,
} from "@/lib/client-ui/tokens";
import type {
  CustomerReportCard,
  CustomerReportGuideItem,
  CustomerReportsExperienceDto,
} from "@/lib/customer-portal/reports-dto";
import { cn } from "@/lib/utils";

type CustomerReportsExperienceProps = {
  experience: CustomerReportsExperienceDto;
  /** Override Overview empty-state link (SS-WEB-003-R1 public demo). */
  overviewHref?: string;
  /** Hide booking CTA for read-only public demo. Default true. */
  showBookingCta?: boolean;
};

export function CustomerReportsExperience({
  experience,
  overviewHref,
  showBookingCta = true,
}: CustomerReportsExperienceProps) {
  const resolvedOverviewHref =
    overviewHref ?? customerOverviewPath(experience.clientId);

  return (
    <ClientPageShell className="max-w-5xl space-y-10">
      <ClientPageHeader
        eyebrow="Executive deliverables"
        title="Reports"
        description="Assessment reports, executive progress, and published business reviews for your organization."
        actions={
          showBookingCta ? (
            <BookingButton label="primary" variant="outline" />
          ) : undefined
        }
      />

      <ReportGuide items={experience.guide} />

      <ReportSection
        id="latest-assessment-report"
        eyebrow="Current deliverable"
        title="Latest assessment report"
        description="The newest completed technology assessment and its PDF."
      >
        {experience.latest ? (
          <div className="max-w-3xl">
            <ReportCard card={experience.latest} />
          </div>
        ) : (
          <ClientEmptyState
            icon={FileText}
            title="Report not available yet"
            description="Your assessment report is available after a technology assessment is completed."
            nextStep="Complete or resume your assessment to unlock the report."
            action={
              experience.resumeAssessmentHref ? (
                <Link href={experience.resumeAssessmentHref} className={buttonClassName({})}>
                  Resume assessment
                </Link>
              ) : (
                <Link
                  href={resolvedOverviewHref}
                  className={buttonClassName({ variant: "outline" })}
                >
                  Back to Overview
                </Link>
              )
            }
          />
        )}
      </ReportSection>

      {experience.latest ? (
        <ReportSection
          id="assessment-history"
          eyebrow="Earlier assessments"
          title="Assessment history"
          description="Completed assessments, newest first. Each report is listed once."
        >
          {experience.history.length === 0 ? (
            <EmptyNote>No earlier assessment reports.</EmptyNote>
          ) : (
            <CardGrid cards={experience.history} />
          )}
        </ReportSection>
      ) : null}

      {experience.executiveReports.length > 0 ? (
        <ReportSection
          id="executive-reports"
          eyebrow="Progress"
          title="Executive reports"
          description="On-screen progress since your latest completed assessment. This report has no separate PDF download."
        >
          <CardGrid cards={experience.executiveReports} />
        </ReportSection>
      ) : null}

      {experience.businessReviews ? (
        <ReportSection
          id="business-reviews"
          eyebrow="Strategic IT Consulting"
          title="Business reviews"
          description="Published reviews for this organization. Draft reviews stay with your advisor."
        >
          {experience.businessReviews.length === 0 ? (
            <EmptyNote>
              No business reviews have been published yet. Completed reviews will appear here.
            </EmptyNote>
          ) : (
            <CardGrid cards={experience.businessReviews} />
          )}
        </ReportSection>
      ) : null}
    </ClientPageShell>
  );
}

function ReportGuide({ items }: { items: CustomerReportGuideItem[] }) {
  return (
    <section className="space-y-4" aria-labelledby="report-guide-heading">
      <div id="report-guide-heading">
        <ClientSectionHeader
          eyebrow="How to read these"
          title="What each report covers"
          description="These are different views of work already recorded. None of them forecast a future StackScore."
        />
      </div>
      <ul className={cn(CLIENT_EQUAL_CARD_GRID, "xl:grid-cols-2")}>
        {items.map((item) => (
          <li key={item.id} className="h-full">
            <article
              className={cn(
                CLIENT_SURFACE_CARD,
                "flex h-full min-w-0 flex-col rounded-sm border bg-card p-4 sm:p-5",
              )}
            >
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              {item.href && item.actionLabel ? (
                <div className="mt-auto pt-4">
                  <Link
                    href={item.href}
                    className={buttonClassName({
                      variant: "outline",
                      size: "sm",
                      className: "w-full sm:w-auto",
                    })}
                  >
                    {item.actionLabel}
                  </Link>
                </div>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReportSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4" aria-labelledby={id}>
      <div id={id}>
        <ClientSectionHeader eyebrow={eyebrow} title={title} description={description} />
      </div>
      {children}
    </section>
  );
}

function CardGrid({ cards }: { cards: CustomerReportCard[] }) {
  return (
    <ul className={cn(CLIENT_EQUAL_CARD_GRID, "xl:grid-cols-2")}>
      {cards.map((card) => (
        <li key={card.id} className="h-full">
          <ReportCard card={card} />
        </li>
      ))}
    </ul>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}
