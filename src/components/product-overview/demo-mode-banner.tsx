import { Info } from "lucide-react";

export function DemoModeBanner() {
  return (
    <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p>
          <span className="font-medium">Interactive demo</span> — changes are temporary and reset when
          you leave the page.
        </p>
      </div>
    </div>
  );
}
