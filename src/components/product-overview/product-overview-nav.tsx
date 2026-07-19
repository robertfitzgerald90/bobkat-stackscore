"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRODUCT_OVERVIEW_NAV_ITEMS } from "@/lib/product-overview/navigation";

const SECTION_IDS = PRODUCT_OVERVIEW_NAV_ITEMS.filter((item) => item.sectionId).map((item) => ({
  id: item.id,
  sectionId: item.sectionId!,
}));

export function ProductOverviewNav() {
  const [activeId, setActiveId] = useState("overview");

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

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      if (item.sectionId) {
                        document.getElementById(item.sectionId)?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
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
