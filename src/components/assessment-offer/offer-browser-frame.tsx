import Image from "next/image";
import { Bell, Search, User } from "lucide-react";
import { BRAND } from "@/lib/branding";
import { cn } from "@/lib/utils";

const FRAME_CLASS =
  "overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-[0_20px_50px_-12px_rgba(8,47,91,0.18)] ring-1 ring-black/[0.04] backdrop-blur-sm transition-all duration-500 ease-out group-hover/mockup:-translate-y-1 group-hover/mockup:scale-[1.015] group-hover/mockup:shadow-[0_28px_60px_-12px_rgba(8,47,91,0.24)]";

export function OfferBrowserFrame({
  children,
  className,
  viewportClassName,
  frameTitle,
}: {
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
  frameTitle?: string;
}) {
  return (
    <div className={cn(FRAME_CLASS, className)}>
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#0B1220] px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src="/branding/bobkat-it-logo.png"
            alt=""
            width={20}
            height={20}
            className="shrink-0 rounded-sm"
            aria-hidden
          />
          <span className="truncate text-xs font-semibold tracking-tight text-white/90 sm:text-sm">
            {BRAND.productName}
          </span>
        </div>

        <div className="mx-auto hidden min-w-0 max-w-[220px] flex-1 sm:block">
          <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1 text-center">
            <p className="truncate text-[11px] text-white/45">{frameTitle ?? "Technology Platform"}</p>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2.5 text-white/35" aria-hidden>
          <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
          <User className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
      </div>

      <div className={cn("relative overflow-hidden bg-[#061426]", viewportClassName)}>{children}</div>
    </div>
  );
}
