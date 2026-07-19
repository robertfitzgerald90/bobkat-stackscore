"use client";

import { useEffect, useRef } from "react";
import { OfferReveal } from "@/components/assessment-offer/offer-reveal";
import { trackProductOverviewSectionViewed } from "@/lib/analytics/product-overview-events";

type ProductOverviewSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

export function ProductOverviewSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: ProductOverviewSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackProductOverviewSectionViewed(id);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [id]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`scroll-mt-36 border-t border-border/70 px-4 py-10 sm:px-6 sm:py-12 ${className ?? "bg-background"}`}
    >
      <div className="mx-auto max-w-7xl">
        <OfferReveal>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </OfferReveal>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
