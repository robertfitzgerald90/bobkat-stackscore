"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  computeFeaturePopoverPosition,
  type PopoverCoords,
} from "@/lib/product-overview/feature-popover-position";
import type {
  FeaturePopoverModel,
  FeaturePopoverPlacement,
  FeaturePopoverTourControls,
} from "@/lib/product-overview/feature-popover-types";
import { useReducedMotion } from "@/lib/product-overview/use-reduced-motion";
import { cn } from "@/lib/utils";

type FeaturePopoverProps = {
  open: boolean;
  anchor: HTMLElement | null;
  model: FeaturePopoverModel | null;
  onClose: () => void;
  onRelatedAction?: (action: NonNullable<FeaturePopoverModel["relatedActions"]>[number]) => void;
  tourControls?: FeaturePopoverTourControls | null;
  preferredPlacement?: FeaturePopoverPlacement[];
  closeOnOutsideClick?: boolean;
  className?: string;
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
        {label}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

export function FeaturePopover({
  open,
  anchor,
  model,
  onClose,
  onRelatedAction,
  tourControls = null,
  preferredPlacement,
  closeOnOutsideClick = true,
  className,
}: FeaturePopoverProps) {
  const reducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (!open || !anchor) {
      setCoords(null);
      setVisible(false);
      return;
    }

    const update = () => {
      const height = cardRef.current?.offsetHeight ?? 280;
      setCoords(
        computeFeaturePopoverPosition(
          anchor.getBoundingClientRect(),
          height,
          preferredPlacement,
        ),
      );
    };

    update();
    const frame = window.requestAnimationFrame(() => {
      update();
      setVisible(true);
    });

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchor, open, preferredPlacement, model?.title, tourControls?.stepLabel]);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!closeOnOutsideClick) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (cardRef.current?.contains(target)) return;
      if (anchor?.contains(target)) return;
      onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("touchstart", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("touchstart", onPointerDown);
    };
  }, [anchor, closeOnOutsideClick, onClose, open]);

  if (!open || !model || !anchor || !coords) return null;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="feature-popover-title"
      className={cn(
        "fixed z-[80] max-h-[min(70vh,560px)] overflow-y-auto rounded-2xl border border-border/80",
        "bg-background/95 p-4 shadow-[0_20px_50px_-24px_rgba(8,47,91,0.55)] backdrop-blur-md",
        "origin-center",
        !reducedMotion && "transition-[opacity,transform] duration-150 ease-out",
        visible ? "scale-100 opacity-100" : "scale-[0.97] opacity-0",
        className,
      )}
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
        transitionDuration: visible ? (reducedMotion ? "0ms" : "180ms") : reducedMotion ? "0ms" : "100ms",
      }}
      data-placement={coords.placement}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {tourControls ? (
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary">
              {tourControls.stepLabel}
            </p>
          ) : model.badge ? (
            <Badge variant="outline" className="text-[0.65rem] uppercase tracking-wide">
              {model.badge}
            </Badge>
          ) : null}
          <h3
            id="feature-popover-title"
            className="mt-2 text-base font-semibold tracking-tight text-foreground"
          >
            {model.title}
          </h3>
          {model.subtitle ? (
            <p className="mt-1 text-xs text-muted-foreground">{model.subtitle}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onClose}
          aria-label="Close feature details"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {tourControls ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 motion-reduce:transition-none"
            style={{ width: `${tourControls.progressPercent}%` }}
          />
        </div>
      ) : null}

      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{model.description}</p>

      {model.metrics && model.metrics.length > 0 ? (
        <dl className="mt-3 grid grid-cols-2 gap-2">
          {model.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg bg-muted/40 px-2.5 py-2">
              <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-4 space-y-3">
        {model.whyItMatters ? (
          <Section label="Why it matters">{model.whyItMatters}</Section>
        ) : null}
        {model.businessValue ? (
          <Section label="Business value">{model.businessValue}</Section>
        ) : null}
        {model.highlights && model.highlights.length > 0 ? (
          <Section label="Highlights">
            <ul className="space-y-1">
              {model.highlights.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </Section>
        ) : null}
        {(model.relatedActions && model.relatedActions.length > 0) ||
        (model.relatedFeatures && model.relatedFeatures.length > 0) ? (
          <Section label="Related">
            {model.relatedActions && model.relatedActions.length > 0 && onRelatedAction ? (
              <div className="flex flex-wrap gap-1.5">
                {model.relatedActions.map((action) => (
                  <Button
                    key={`${action.label}-${action.featureKey ?? action.panel.type}`}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => onRelatedAction(action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {(model.relatedFeatures ?? []).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            )}
          </Section>
        ) : null}
      </div>

      {tourControls ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={tourControls.onPrevious}
            disabled={tourControls.isFirst}
          >
            Previous
          </Button>
          <Button type="button" size="sm" onClick={tourControls.onNext}>
            {tourControls.isLast ? "Finish Tour" : "Next"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={tourControls.onSkip}>
            Skip
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={tourControls.onRestart}>
            Restart
          </Button>
        </div>
      ) : null}
    </div>
  );
}
