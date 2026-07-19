"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRODUCT_OVERVIEW_NAV_ITEMS } from "@/lib/product-overview/navigation";

type ProductOverviewNavProps = {
  activeId?: string;
  onUpcomingClick?: (itemId: string) => void;
};

export function ProductOverviewNav({
  activeId = "overview",
  onUpcomingClick,
}: ProductOverviewNavProps) {
  const [hintId, setHintId] = useState<string | null>(null);

  return (
    <nav
      aria-label="Product overview sections"
      className="sticky top-[61px] z-30 border-b border-border/70 bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
          Interactive Product Tour
        </Badge>
        <div className="min-w-0 flex-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex min-w-max items-center gap-2">
            {PRODUCT_OVERVIEW_NAV_ITEMS.map((item) => {
              const isActive = item.id === activeId;
              const isUpcoming = item.phase === 2;

              return (
                <li key={item.id} className="relative">
                  <button
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    aria-describedby={hintId === item.id ? `${item.id}-hint` : undefined}
                    onClick={() => {
                      if (isUpcoming) {
                        setHintId(item.id);
                        onUpcomingClick?.(item.id);
                        return;
                      }
                      document.getElementById("product-overview-dashboard")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {item.label}
                  </button>
                  {hintId === item.id && isUpcoming ? (
                    <div
                      id={`${item.id}-hint`}
                      role="status"
                      className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-64 rounded-lg border border-border bg-popover p-3 text-left shadow-lg"
                    >
                      <p className="text-xs font-semibold text-foreground">Coming in the full tour</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.teaserDescription}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-medium text-primary hover:underline"
                        onClick={() => {
                          setHintId(null);
                          document.getElementById("product-overview-phase-2")?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }}
                      >
                        View upcoming modules
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
