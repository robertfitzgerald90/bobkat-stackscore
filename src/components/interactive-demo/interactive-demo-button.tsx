"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { trackDemoCtaClicked } from "@/lib/analytics/interactive-demo-events";
import {
  buildDemoHref,
  type DemoDeepLinkSection,
} from "@/lib/interactive-demo/routes";
import { persistDemoReturnTo } from "@/lib/interactive-demo/session";
import { cn } from "@/lib/utils";

type InteractiveDemoButtonProps = {
  label?: string;
  placement: string;
  section?: DemoDeepLinkSection;
  returnTo?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  captureCurrentPath?: boolean;
};

export function InteractiveDemoButton({
  label = "Explore the Interactive Demo",
  placement,
  section,
  returnTo,
  variant = "outline",
  className,
  captureCurrentPath = false,
}: InteractiveDemoButtonProps) {
  const href = buildDemoHref({
    section,
    returnTo,
    source: placement,
  });

  function handleClick() {
    trackDemoCtaClicked(placement);
    if (returnTo) {
      persistDemoReturnTo(returnTo);
      return;
    }
    if (captureCurrentPath && typeof window !== "undefined") {
      persistDemoReturnTo(`${window.location.pathname}${window.location.search}`);
    }
  }

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant }), className)}
      onClick={handleClick}
    >
      {label}
    </Link>
  );
}
