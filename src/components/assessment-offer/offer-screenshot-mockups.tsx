import { cn } from "@/lib/utils";

function MiniBar({ width, color }: { width: string; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
      <div className={cn("h-full rounded-full", color)} style={{ width }} />
    </div>
  );
}

export function MockExecutiveDashboard() {
  return (
    <div className="flex h-full flex-col gap-2 text-[8px] sm:text-[10px]">
      <div className="flex gap-2">
        <div className="w-1/4 space-y-1 rounded-md bg-primary/90 p-2 text-primary-foreground">
          <div className="h-1.5 w-3/4 rounded bg-white/30" />
          <div className="h-1 w-1/2 rounded bg-white/20" />
          <div className="mt-2 space-y-1">
            <div className="h-1 w-full rounded bg-white/15" />
            <div className="h-1 w-full rounded bg-white/15" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            {["76", "82", "68"].map((score, index) => (
              <div key={score} className="rounded-md border bg-card p-1.5 shadow-sm">
                <div className="text-[7px] text-muted-foreground">Score</div>
                <div className="text-sm font-bold text-primary sm:text-base">{score}</div>
                <MiniBar
                  width={`${score}%`}
                  color={index === 2 ? "bg-warning" : "bg-primary"}
                />
              </div>
            ))}
          </div>
          <div className="rounded-md border bg-card p-2 shadow-sm">
            <div className="mb-1 font-medium text-foreground">Portfolio overview</div>
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-6 rounded bg-muted/80" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockMaturityScore() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/20 sm:h-24 sm:w-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent rotate-[-45deg]" />
        <span className="text-2xl font-bold text-primary sm:text-3xl">76</span>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground sm:text-sm">StackScore</p>
        <p className="text-[10px] text-muted-foreground sm:text-xs">Stable · Managed maturity</p>
      </div>
      <div className="grid w-full max-w-[85%] grid-cols-2 gap-1.5">
        {["Identity", "Security", "Backup", "Strategy"].map((label) => (
          <div key={label} className="rounded border bg-card px-2 py-1 text-[8px] sm:text-[9px]">
            <span className="text-muted-foreground">{label}</span>
            <MiniBar width="70%" color="bg-primary/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockAssessmentExperience() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
        <span className="font-medium text-foreground">Endpoint Management</span>
        <span className="text-muted-foreground">12 / 48</span>
      </div>
      <MiniBar width="25%" color="bg-primary" />
      <div className="flex-1 rounded-md border bg-card p-2 shadow-sm">
        <p className="mb-2 text-[9px] font-medium leading-snug text-foreground sm:text-[10px]">
          Are company devices regularly patched, monitored, and protected?
        </p>
        <div className="space-y-1">
          {["Yes — consistently", "Partially", "No"].map((option, index) => (
            <div
              key={option}
              className={cn(
                "rounded border px-2 py-1 text-[8px] sm:text-[9px]",
                index === 0 ? "border-primary bg-primary/5 font-medium" : "bg-muted/30",
              )}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MockRecommendations() {
  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="text-[9px] font-semibold text-foreground sm:text-[10px]">Critical</div>
      {[
        "Improve MFA adoption across cloud apps",
        "Validate backup recovery procedures",
      ].map((title, index) => (
        <div key={title} className="rounded-md border bg-card p-2 shadow-sm">
          <div className="mb-1 flex items-center gap-1">
            <span className="rounded bg-destructive/10 px-1 py-0.5 text-[7px] font-medium text-destructive">
              {index === 0 ? "Critical" : "High"}
            </span>
          </div>
          <p className="text-[8px] leading-snug text-foreground sm:text-[9px]">{title}</p>
          <MiniBar width="40%" color="bg-primary/60" />
        </div>
      ))}
    </div>
  );
}

export function MockExecutiveReport() {
  return (
    <div className="flex h-full gap-2">
      <div className="w-1/3 space-y-1 rounded-md border bg-card p-2 shadow-sm">
        <div className="h-2 w-2/3 rounded bg-primary/20" />
        <div className="h-1 w-full rounded bg-muted" />
        <div className="h-1 w-full rounded bg-muted" />
        <div className="mt-2 h-8 rounded bg-primary/10" />
      </div>
      <div className="flex-1 rounded-md border bg-white p-2 shadow-sm">
        <div className="mb-2 border-b pb-1">
          <div className="text-[9px] font-bold text-primary sm:text-[10px]">Executive Summary</div>
        </div>
        <div className="space-y-1">
          {[1, 2, 3, 4].map((line) => (
            <div
              key={line}
              className="h-1 rounded bg-muted"
              style={{ width: `${100 - line * 8}%` }}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <div className="h-6 rounded bg-muted/60" />
          <div className="h-6 rounded bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

export const OFFER_SCREENSHOT_MOCKUPS = {
  "executive-dashboard": MockExecutiveDashboard,
  "maturity-score": MockMaturityScore,
  "assessment-experience": MockAssessmentExperience,
  recommendations: MockRecommendations,
  "executive-report": MockExecutiveReport,
} as const;
