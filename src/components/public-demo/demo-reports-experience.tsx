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
import { buttonClassName } from "@/components/ui/button";
import {
  CLIENT_EQUAL_CARD_GRID,
  CLIENT_SURFACE_CARD,
} from "@/lib/client-ui/tokens";
import type {
  CustomerReportCard,
  CustomerReportGuideItem,
  CustomerReportsExperienceDto,
} from "@/lib/customer-portal/reports-dto";
import { PUBLIC_DEMO_OVERVIEW_PATH } from "@/lib/public-demo/routes";
import { cn } from "@/lib/utils";

type DemoReportsExperienceProps = {
  experience: CustomerReportsExperienceDto;
};

/**
 * SS-WEB-003 — Reports hub without booking CTAs or authenticated PDF downloads.
 */
export function DemoReportsExperience({ experience }: DemoReportsExperienceProps) {
  return (
    <ClientPageShell className="max-w-5xl space-y-10">
      <ClientPageHeader
        eyebrow="Executive deliverables"
        title="Reports"
        description="Sample assessment and progress report metadata for this fictional workspace. Downloads of real customer PDFs are not available in the demo."
      />

      <ReportGuide items={experience.guide} />

      <ReportSection
        id="latest-assessment-report"
        eyebrow="Current deliverable"
        title="Latest assessment report"
        description="Sample technology assessment metadata and preview."
      >
        {experience.latest ? (
          <div className="max-w-3xl">
            <ReportCard card={experience.latest} />
          </div>
        ) : (
          <ClientEmptyState
            icon={FileText}
            title="Sample report not available"
            description="This demo normally includes a labeled sample assessment report."
            nextStep="Return to Overview to continue exploring."
            action={
              <Link
                href={PUBLIC_DEMO_OVERVIEW_PATH}
                className={buttonClassName({ variant: "outline" })}
              >
                Back to Overview
              </Link>
            }
          />
        )}
      </ReportSection>

      {experience.executiveReports.length > 0 ? (
        <ReportSection
          id="executive-reports"
          eyebrow="Progress"
          title="Executive reports"
          description="Sample on-screen progress metadata. No separate PDF download in the demo."
        >
          <CardGrid cards={experience.executiveReports} />
        </ReportSection>
      ) : null}
    </ClientPageShell>
  );
}

function ReportGuide({ items }: { items: CustomerReportGuideItem[] }) {
  return (
    <section
      className={cn(CLIENT_SURFACE_CARD, "space-y-4 rounded-sm border p-4 sm:p-5")}
      aria-label="How reports work"
    >
      <ClientSectionHeader
        eyebrow="Guide"
        title="What you will find here"
        description="Same structure as the customer Reports area — sample data only."
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-sm border border-border/70 bg-card/40 p-3">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            {item.href && item.actionLabel ? (
              <Link
                href={item.href}
                className="mt-2 inline-flex text-sm font-medium text-primary hover:underline"
              >
                {item.actionLabel}
              </Link>
            ) : null}
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
    <section id={id} className="space-y-4" aria-labelledby={`${id}-heading`}>
      <ClientSectionHeader eyebrow={eyebrow} title={title} description={description} />
      <h2 id={`${id}-heading`} className="sr-only">
        {title}
      </h2>
      {children}
    </section>
  );
}

function CardGrid({ cards }: { cards: CustomerReportCard[] }) {
  return (
    <div className={CLIENT_EQUAL_CARD_GRID}>
      {cards.map((card) => (
        <ReportCard key={card.id} card={card} />
      ))}
    </div>
  );
}
