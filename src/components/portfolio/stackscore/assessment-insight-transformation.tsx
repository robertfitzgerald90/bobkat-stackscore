import { AlertTriangle, BarChart3, CheckCircle2, ClipboardList, FileText, Scale } from "lucide-react";
import { ArrowConnector, Eyebrow, VisualFrame } from "./visual-primitives";

const steps = [
  { title: "Structured evidence", detail: "42 governed responses", icon: ClipboardList },
  { title: "Rules-based scoring", detail: "Weighted maturity model", icon: Scale },
  { title: "Risk separation", detail: "2 critical exposures", icon: AlertTriangle },
  { title: "Maturity profile", detail: "7 decision pillars", icon: BarChart3 },
  { title: "Executive findings", detail: "Priorities in business language", icon: FileText },
];

export function AssessmentInsightTransformation() {
  return (
    <VisualFrame label="Evidence transformation">
      <div className="p-6 sm:p-8">
        <Eyebrow>From technical observation to executive understanding</Eyebrow>
        <div className="mt-6 grid gap-3 md:flex md:items-stretch">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="contents" key={step.title}>
                <div className="flex min-w-0 flex-1 items-start gap-3 border border-border bg-background p-4 md:block">
                  <div className={`flex size-8 shrink-0 items-center justify-center border ${index === 2 ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-primary/40 bg-primary/10 text-primary"}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="md:mt-5">
                    <div className="text-sm font-semibold">{step.title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.detail}</div>
                  </div>
                </div>
                {index < steps.length - 1 ? <ArrowConnector /> : null}
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex items-start gap-3 border-l-2 border-primary bg-primary/6 p-4">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            StackScore does not surface a questionnaire. It converts governed evidence into a decision-ready view of health, risk, and next action.
          </p>
        </div>
      </div>
    </VisualFrame>
  );
}

