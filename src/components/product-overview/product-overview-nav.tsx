"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRODUCT_OVERVIEW_NAV_ITEMS } from "@/lib/product-overview/navigation";

type ProductOverviewNavProps = {
  activeId?: string;
};

const SECTION_IDS = PRODUCT_OVERVIEW_NAV_ITEMS.filter((item) => item.sectionId).map((item) => ({
  id: item.id,
  sectionId: item.sectionId!,
  phase: item.phase,
  teaserDescription: item.teaserDescription,
}));

export function ProductOverviewNav({ activeId: activeIdProp }: ProductOverviewNavProps) {
  const [activeId, setActiveId] = useState(activeIdProp ?? "overview");
  const [hintId, setHintId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const topEntry = visible[0];
        if (!topEntry) return;

        const matched = SECTION_IDS.find((item) => item.sectionId === topEntry.target.id);
        if (matched) {
          setActiveId(matched.id);
        }
      },
      {
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    for (const item of SECTION_IDS) {
      const element = document.getElementById(item.sectionId);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string, itemId: string, phase: 1 | 2 | 3) => {
    if (phase === 3) {
      setHintId(itemId);
    } else {
      setHintId(null);
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

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
              const isPhase3 = item.phase === 3;

              return (
                <li key={item.id} className="relative">
                  <button
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    aria-describedby={hintId === item.id ? `${item.id}-hint` : undefined}
                    onClick={() => {
                      if (item.sectionId) {
                        scrollToSection(item.sectionId, item.id, item.phase);
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
                  {hintId === item.id && isPhase3 ? (
                    <div
                      id={`${item.id}-hint`}
                      role="status"
                      className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-64 rounded-lg border border-border bg-popover p-3 text-left shadow-lg"
                    >
                      <p className="text-xs font-semibold text-foreground">Coming in Phase 3</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.teaserDescription}</p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-medium text-primary hover:underline"
                        onClick={() => {
                          setHintId(null);
                          document.getElementById("product-overview-phase-3")?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }}
                      >
                        View Phase 3 preview
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
