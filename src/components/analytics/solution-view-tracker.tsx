"use client";

import { useEffect, useRef } from "react";
import { trackSolutionPageView } from "@/lib/analytics/marketing-events";

type SolutionViewTrackerProps = {
  solutionId: string;
  solutionTitle: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export function SolutionViewTracker({
  solutionId,
  solutionTitle,
  id,
  className,
  children,
}: SolutionViewTrackerProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || trackedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || trackedRef.current) return;

        trackedRef.current = true;
        trackSolutionPageView({ solutionId, solutionTitle });
        observer.disconnect();
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [solutionId, solutionTitle]);

  return (
    <article ref={rootRef} id={id} className={className} data-solution-id={solutionId}>
      {children}
    </article>
  );
}
