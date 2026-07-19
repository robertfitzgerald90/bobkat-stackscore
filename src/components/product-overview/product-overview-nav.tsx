"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useDemoScrollSpy } from "@/components/interactive-demo/demo-scroll-spy-provider";
import { cn } from "@/lib/utils";
import { PRODUCT_OVERVIEW_NAV_ITEMS } from "@/lib/product-overview/navigation";

export function ProductOverviewNav() {
  const { activeSectionId, isCompact, scrollToDemoSection } = useDemoScrollSpy();
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tab = activeTabRef.current;
    const container = scrollContainerRef.current;
    if (!tab || !container) return;

    const tabLeft = tab.offsetLeft;
    const tabRight = tabLeft + tab.offsetWidth;
    const visibleLeft = container.scrollLeft;
    const visibleRight = visibleLeft + container.clientWidth;

    if (tabLeft < visibleLeft + 16) {
      container.scrollTo({ left: Math.max(0, tabLeft - 16), behavior: "smooth" });
    } else if (tabRight > visibleRight - 16) {
      container.scrollTo({
        left: tabRight - container.clientWidth + 16,
        behavior: "smooth",
      });
    }
  }, [activeSectionId]);

  return (
    <nav aria-label="Product overview sections" className="bg-background">
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center gap-3 px-4 sm:px-6",
          "transition-[padding] duration-200 ease-out",
          isCompact ? "py-2" : "py-3",
        )}
      >
        <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
          Interactive Demo
        </Badge>
        <div
          ref={scrollContainerRef}
          className="min-w-0 flex-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex min-w-max items-center gap-2">
            {PRODUCT_OVERVIEW_NAV_ITEMS.map((item) => {
              const isActive = item.id === activeSectionId;

              return (
                <li key={item.id}>
                  <button
                    ref={isActive ? activeTabRef : null}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      if (item.sectionId) {
                        scrollToDemoSection(item.sectionId);
                      }
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
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
