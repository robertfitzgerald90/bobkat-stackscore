"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HorizontalScrollTabItem = {
  id: string;
  label: string;
};

type HorizontalScrollTabListProps = {
  items: HorizontalScrollTabItem[];
  activeId: string;
  onActiveChange: (id: string) => void;
  ariaLabel: string;
  panelId: string;
  /** When set, tab element ids become `{idPrefix}-tab-{itemId}` for aria-labelledby on the panel. */
  idPrefix?: string;
  className?: string;
  renderTab?: (item: HorizontalScrollTabItem, isActive: boolean) => ReactNode;
  tabClassName?: string | ((isActive: boolean) => string);
};

function scrollTabIntoView(scrollEl: HTMLElement, tabEl: HTMLElement) {
  const tabStart = tabEl.offsetLeft;
  const tabEnd = tabStart + tabEl.offsetWidth;
  const viewStart = scrollEl.scrollLeft;
  const viewEnd = viewStart + scrollEl.clientWidth;
  const padding = 12;

  if (tabStart < viewStart + padding) {
    scrollEl.scrollTo({ left: Math.max(0, tabStart - padding), behavior: "smooth" });
    return;
  }

  if (tabEnd > viewEnd - padding) {
    scrollEl.scrollTo({
      left: tabEnd - scrollEl.clientWidth + padding,
      behavior: "smooth",
    });
  }
}

export function HorizontalScrollTabList({
  items,
  activeId,
  onActiveChange,
  ariaLabel,
  panelId,
  idPrefix,
  className,
  renderTab,
  tabClassName,
}: HorizontalScrollTabListProps) {
  const generatedId = useId();
  const prefix = idPrefix ?? generatedId;
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollAffordance = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  const ensureActiveTabVisible = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const scrollEl = scrollRef.current;
      const tabEl = tabRefs.current.get(activeId);
      if (!scrollEl || !tabEl) return;

      const tabStart = tabEl.offsetLeft;
      const tabEnd = tabStart + tabEl.offsetWidth;
      const viewStart = scrollEl.scrollLeft;
      const viewEnd = viewStart + scrollEl.clientWidth;
      const padding = 12;

      let targetLeft: number | null = null;
      if (tabStart < viewStart + padding) {
        targetLeft = Math.max(0, tabStart - padding);
      } else if (tabEnd > viewEnd - padding) {
        targetLeft = tabEnd - scrollEl.clientWidth + padding;
      }

      if (targetLeft !== null) {
        scrollEl.scrollTo({ left: targetLeft, behavior });
      }
    },
    [activeId],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollAffordance();
    el.addEventListener("scroll", updateScrollAffordance, { passive: true });
    const observer = new ResizeObserver(updateScrollAffordance);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollAffordance);
      observer.disconnect();
    };
  }, [updateScrollAffordance, items.length]);

  useEffect(() => {
    ensureActiveTabVisible("auto");
    const frame = window.requestAnimationFrame(() => ensureActiveTabVisible("auto"));
    return () => window.cancelAnimationFrame(frame);
  }, [activeId, ensureActiveTabVisible, items.length]);

  function scrollByPage(direction: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(200, el.clientWidth * 0.65), behavior: "smooth" });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = items[index + 1];
      if (next) onActiveChange(next.id);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const previous = items[index - 1];
      if (previous) onActiveChange(previous.id);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      const first = items[0];
      if (first) onActiveChange(first.id);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const last = items[items.length - 1];
      if (last) onActiveChange(last.id);
    }
  }

  function resolveTabClassName(isActive: boolean) {
    if (typeof tabClassName === "function") return tabClassName(isActive);
    if (tabClassName) return tabClassName;
    return cn(
      "shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out motion-reduce:transition-none",
      "min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      isActive
        ? "border-primary bg-primary text-primary-foreground shadow-md"
        : "border-border/70 bg-card text-foreground hover:border-primary/30 hover:bg-muted/40",
    );
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      {canScrollLeft ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background via-background/90 to-transparent sm:w-12"
        />
      ) : null}
      {canScrollRight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background via-background/90 to-transparent sm:w-12"
        />
      ) : null}

      {canScrollLeft ? (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Scroll tabs left"
          className="absolute left-0 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background/95 shadow-sm backdrop-blur-sm sm:inline-flex"
          onClick={() => scrollByPage(-1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>
      ) : null}

      {canScrollRight ? (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Scroll tabs right"
          className="absolute right-0 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background/95 shadow-sm backdrop-blur-sm sm:inline-flex"
          onClick={() => scrollByPage(1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      ) : null}

      <div
        ref={scrollRef}
        className={cn(
          "min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth pb-1",
          "snap-x snap-mandatory touch-pan-x",
          "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklch,var(--primary)_35%,transparent)_transparent]",
          "[&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/30",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          canScrollLeft ? "pl-1 sm:pl-10" : "pl-1",
          canScrollRight ? "pr-1 sm:pr-10" : "pr-1",
        )}
      >
        <div className="flex w-max flex-nowrap items-center gap-2" role="tablist" aria-label={ariaLabel}>
          {items.map((item, index) => {
            const isActive = item.id === activeId;
            const tabId = `${prefix}-tab-${item.id}`;

            return (
              <button
                key={item.id}
                ref={(node) => {
                  if (node) tabRefs.current.set(item.id, node);
                  else tabRefs.current.delete(item.id);
                }}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => {
                  onActiveChange(item.id);
                  const scrollEl = scrollRef.current;
                  const tabEl = tabRefs.current.get(item.id);
                  if (scrollEl && tabEl) {
                    window.requestAnimationFrame(() => scrollTabIntoView(scrollEl, tabEl));
                  }
                }}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={resolveTabClassName(isActive)}
              >
                {renderTab ? renderTab(item, isActive) : item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
