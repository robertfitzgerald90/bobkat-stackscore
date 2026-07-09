import { cn } from "@/lib/utils";

export function OfferBrowserFrame({
  children,
  className,
  chrome = true,
}: {
  children: React.ReactNode;
  className?: string;
  chrome?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-card",
        "shadow-[0_20px_50px_-12px_rgba(8,47,91,0.18)] ring-1 ring-black/[0.04]",
        "transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_28px_60px_-12px_rgba(8,47,91,0.22)]",
        className,
      )}
    >
      {chrome ? (
        <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/30 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/80" />
          <span className="ml-3 h-2 flex-1 max-w-[45%] rounded-full bg-border/70" />
        </div>
      ) : null}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-b from-muted/20 to-background">
        {children}
      </div>
    </div>
  );
}

export function OfferDocumentFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-muted/40 to-muted/20 p-4 sm:p-6",
        "shadow-[0_20px_50px_-12px_rgba(8,47,91,0.18)] ring-1 ring-black/[0.04]",
        "transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_28px_60px_-12px_rgba(8,47,91,0.22)]",
        className,
      )}
    >
      <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-lg border border-border/40 bg-white shadow-md">
        {children}
      </div>
    </div>
  );
}
