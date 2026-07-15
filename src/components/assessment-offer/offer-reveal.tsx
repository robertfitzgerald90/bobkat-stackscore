"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type OfferRevealProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  variant?: "default" | "image";
};

export function OfferReveal({ children, className, delayMs = 0, variant = "default" }: OfferRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : variant === "image"
            ? "translate-y-8 scale-[0.96] opacity-0"
            : "translate-y-6 scale-[0.98] opacity-0",
        className,
      )}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
