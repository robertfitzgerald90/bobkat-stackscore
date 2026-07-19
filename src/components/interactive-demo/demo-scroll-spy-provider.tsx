"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_DEMO_SHELL_HEIGHT,
  DEMO_SHELL_SECTIONS,
  readDemoSectionOffsets,
  resolveActiveDemoSection,
} from "@/lib/product-overview/demo-scroll-spy";
import { getScrollBehavior } from "@/lib/product-overview/polish-classes";

type DemoScrollSpyContextValue = {
  activeSectionId: string;
  activeSectionLabel: string;
  shellHeight: number;
  isCompact: boolean;
  setShellHeight: (height: number) => void;
  scrollToDemoSection: (sectionId: string) => void;
};

const DemoScrollSpyContext = createContext<DemoScrollSpyContextValue | null>(null);

export function useDemoScrollSpy() {
  const context = useContext(DemoScrollSpyContext);
  if (!context) {
    throw new Error("useDemoScrollSpy must be used within DemoScrollSpyProvider");
  }
  return context;
}

export function DemoScrollSpyProvider({ children }: { children: ReactNode }) {
  const [activeSectionId, setActiveSectionId] = useState("overview");
  const [shellHeight, setShellHeight] = useState(DEFAULT_DEMO_SHELL_HEIGHT);
  const [isCompact, setIsCompact] = useState(false);

  const activeSectionLabel = useMemo(() => {
    return (
      DEMO_SHELL_SECTIONS.find((section) => section.id === activeSectionId)?.label ?? "Overview"
    );
  }, [activeSectionId]);

  const updateActiveSection = useCallback(() => {
    const offsets = readDemoSectionOffsets();
    const nextActive = resolveActiveDemoSection(window.scrollY, shellHeight, offsets);
    setActiveSectionId((current) => (current === nextActive ? current : nextActive));
    setIsCompact((current) => {
      const next = window.scrollY > 24;
      return current === next ? current : next;
    });
  }, [shellHeight]);

  useEffect(() => {
    updateActiveSection();

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActiveSection();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateActiveSection);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [updateActiveSection]);

  useEffect(() => {
    const main = document.getElementById("product-overview-main");
    if (!main) return;

    let timer: number | undefined;
    const observer = new MutationObserver(() => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(updateActiveSection, 120);
    });

    observer.observe(main, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [updateActiveSection]);

  useEffect(() => {
    document.documentElement.style.setProperty("--demo-shell-height", `${shellHeight}px`);
    document.documentElement.style.scrollPaddingTop = `${shellHeight}px`;

    return () => {
      document.documentElement.style.removeProperty("--demo-shell-height");
      document.documentElement.style.scrollPaddingTop = "";
    };
  }, [shellHeight]);

  const scrollToDemoSection = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (!element) return;

      const matched = DEMO_SHELL_SECTIONS.find((section) => section.sectionId === sectionId);
      if (matched) {
        setActiveSectionId(matched.id);
      }

      const absoluteTop = window.scrollY + element.getBoundingClientRect().top;
      window.scrollTo({
        top: Math.max(0, absoluteTop - shellHeight - 8),
        behavior: getScrollBehavior(),
      });
    },
    [shellHeight],
  );

  const value = useMemo(
    () => ({
      activeSectionId,
      activeSectionLabel,
      shellHeight,
      isCompact,
      setShellHeight,
      scrollToDemoSection,
    }),
    [activeSectionId, activeSectionLabel, isCompact, scrollToDemoSection, shellHeight],
  );

  return (
    <DemoScrollSpyContext.Provider value={value}>{children}</DemoScrollSpyContext.Provider>
  );
}
