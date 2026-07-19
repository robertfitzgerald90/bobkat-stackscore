"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { scrollToSection } from "@/lib/product-overview/polish-classes";
import { resolveDemoSectionId } from "@/lib/interactive-demo/routes";
import {
  isSafeInternalPath,
  persistDemoReturnTo,
} from "@/lib/interactive-demo/session";

type DemoSessionBootstrapProps = {
  sectionSlug?: string;
};

export function DemoSessionBootstrap({ sectionSlug }: DemoSessionBootstrapProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnTo = searchParams.get("returnTo");
    if (isSafeInternalPath(returnTo)) {
      persistDemoReturnTo(returnTo);
    }

    const querySection = searchParams.get("section");
    const hashId =
      typeof window !== "undefined" && window.location.hash
        ? window.location.hash.replace(/^#/, "")
        : null;
    const sectionId =
      resolveDemoSectionId(sectionSlug) ??
      resolveDemoSectionId(querySection ?? undefined) ??
      hashId;

    if (!sectionId) return;

    const timer = window.setTimeout(() => {
      scrollToSection(sectionId, "start");
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchParams, sectionSlug]);

  return null;
}
