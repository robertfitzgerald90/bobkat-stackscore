import { cn } from "@/lib/utils";

export function OfferBrowserFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg ring-1 ring-border/40",
        "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
        <span className="ml-2 h-2 flex-1 max-w-[40%] rounded-full bg-border/80" />
      </div>
      <div className="aspect-[16/10] bg-gradient-to-br from-muted/30 to-background p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
}
