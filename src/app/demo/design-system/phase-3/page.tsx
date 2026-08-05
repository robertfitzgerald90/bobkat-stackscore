import type { Metadata } from "next";
import { InstrumentPhase3Client } from "@/components/design-system/instrument/instrument-phase-3-client";

export const metadata: Metadata = {
  title: "StackScore Instrument Design System — Phase 3",
  robots: { index: false, follow: false },
};

export default function InstrumentPhase3Page() {
  return <InstrumentPhase3Client />;
}
