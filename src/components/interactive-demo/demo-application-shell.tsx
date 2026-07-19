"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useDemoScrollSpy } from "@/components/interactive-demo/demo-scroll-spy-provider";
import { STICKY_DEMO_SHELL_CLASS } from "@/lib/ui/sticky-chrome";
import { cn } from "@/lib/utils";

type DemoApplicationShellProps = {
  children: ReactNode;
};

export function DemoApplicationShell({ children }: DemoApplicationShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const { isCompact, setShellHeight } = useDemoScrollSpy();

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const measure = () => {
      setShellHeight(Math.ceil(shell.getBoundingClientRect().height));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(shell);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isCompact, setShellHeight]);

  return (
    <div
      ref={shellRef}
      data-demo-shell
      data-compact={isCompact ? "true" : "false"}
      className={cn(
        STICKY_DEMO_SHELL_CLASS,
        "transition-[box-shadow] duration-200 ease-out",
        isCompact && "shadow-md",
      )}
    >
      {children}
    </div>
  );
}
