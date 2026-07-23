import { EXECUTIVE_OS_BRIEFING_PANEL } from "@/lib/executive-os/tokens";
import { cn } from "@/lib/utils";

/** Static preview shown on the login screen — no live data. */
export function LoginExecutivePreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        EXECUTIVE_OS_BRIEFING_PANEL,
        "mt-8 hidden max-w-md text-left lg:block",
        className,
      )}
      aria-hidden
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        Executive Briefing
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
        Good morning. Here&apos;s what changed since your last review.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>✔ Security posture improved</li>
        <li>✔ Business continuity verified</li>
        <li>⚠ One high-priority recommendation requires attention</li>
      </ul>
      <div className="mt-5 rounded-lg border border-primary/15 bg-primary/[0.06] p-4">
        <p className="text-xs uppercase tracking-wider text-primary">Overall Technology Health</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">86 / 100</p>
      </div>
    </div>
  );
}
