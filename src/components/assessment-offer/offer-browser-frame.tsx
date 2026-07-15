import { cn } from "@/lib/utils";

const FRAME_CLASS =
  "overflow-hidden rounded-xl border border-border/60 bg-card shadow-[0_8px_30px_rgba(8,47,91,0.08)] ring-1 ring-black/[0.03]";

export function OfferBrowserFrame({
  children,
  className,
  viewportClassName,
}: {
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
}) {
  return (
    <div className={cn(FRAME_CLASS, className)}>
      <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/25 px-3 py-2 sm:px-4">
        <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
        <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
        <span className="h-2 w-2 rounded-full bg-[#28C840]" />
        <span className="ml-2 h-1.5 max-w-[42%] flex-1 rounded-full bg-border/80" />
      </div>
      <div className={cn("relative overflow-hidden bg-[#061426]", viewportClassName)}>
        {children}
      </div>
    </div>
  );
}
