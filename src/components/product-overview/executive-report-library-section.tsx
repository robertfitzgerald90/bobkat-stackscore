"use client";

import { FileText } from "lucide-react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductOverview } from "@/components/product-overview/product-overview-context";
import { cn } from "@/lib/utils";

export function ExecutiveReportLibrarySection() {
  const { demoProfile, openReport, isHighlighted } = useProductOverview();

  return (
    <section
      id="product-overview-reports"
      className="scroll-mt-36 border-t border-border/70 bg-background px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Executive Reporting
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Reports leadership actually uses
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Polished executive reports generated from live platform data — not one-off slide decks
              or static PDF exports.
            </p>
          </div>
        </OfferReveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoProfile.executiveReports.map((report, index) => (
            <OfferReveal key={report.id} delayMs={index * 40}>
              <Card
                id={`product-overview-report-${report.id}`}
                className={cn(
                  "border-border/70 shadow-sm transition-shadow hover:shadow-md",
                  isHighlighted({ reportId: report.id }) && "ring-2 ring-primary ring-offset-2",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <CardTitle className="mt-4 text-base">{report.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">Generated {report.generatedDate}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{report.description}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => openReport(report.id, "report_library")}
                  >
                    Preview Report
                  </Button>
                </CardContent>
              </Card>
            </OfferReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
