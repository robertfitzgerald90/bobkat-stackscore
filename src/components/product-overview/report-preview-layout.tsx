import type { DemoReportPreview } from "@/lib/product-overview/types";

type ReportPreviewLayoutProps = {
  preview: DemoReportPreview;
};

export function ReportPreviewLayout({ preview }: ReportPreviewLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/70 bg-muted/20 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">StackScore Report</p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">{preview.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{preview.subtitle}</p>
        <p className="mt-3 text-xs text-muted-foreground">Generated {preview.generatedDate}</p>
      </div>

      {preview.metrics ? (
        <div className="grid grid-cols-2 gap-3">
          {preview.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {preview.sections.map((section) => (
        <div key={section.heading} className="rounded-xl border border-border/70 p-4">
          <h4 className="text-sm font-semibold text-foreground">{section.heading}</h4>
          {section.body ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          ) : null}
          {section.bullets ? (
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
