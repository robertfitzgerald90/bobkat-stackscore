import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * StackScore "Instrument" corner-bracket motif — Phase 2.
 *
 * Thin L-shaped marks at container corners, offset slightly outside the
 * edge (visible gap, not flush). Used liberally here compared to Bobkat
 * IT's "two by default" rule, since StackScore's whole job is measurement:
 *
 * - Four corners: anywhere a "reading" is being displayed (score panels,
 *   maturity radar/chart, Executive Summary report view).
 * - Two corners: secondary cards, list items, navigation elements.
 *
 * Tone carries the signal — phosphor for a normal/measured reading, ember
 * when the bracketed panel is displaying a critical or at-risk reading.
 */

export type CornerBracketTone = "measured" | "critical";
export type CornerBracketCoverage = "four" | "two";

type CornerBracketsProps = {
  tone?: CornerBracketTone;
  corners?: CornerBracketCoverage;
  /**
   * Tightens the brackets toward the edge on hover (Phase 3 motion pass).
   * A single-property offset transition, disabled under
   * prefers-reduced-motion — no glow, no scale, no spring easing.
   */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
};

const TONE_COLOR: Record<CornerBracketTone, string> = {
  // Fallbacks let brackets work outside the `.instrument` demo scope too
  // (e.g. wrapped around production score panels), where raw `--phosphor`
  // / `--ember` aren't declared but the semantic `--primary` / `--destructive`
  // tokens already carry the right color once the Midnight theme is active.
  measured: "var(--phosphor, var(--primary, #3ecf7a))",
  critical: "var(--ember, var(--destructive, #b23a3a))",
};

const CORNER_POSITIONS: Record<CornerBracketCoverage, string[]> = {
  four: ["top-left", "top-right", "bottom-left", "bottom-right"],
  // Diagonal pair reads clearly as "bracketed" without the weight of all
  // four corners — reserved for secondary/supporting surfaces.
  two: ["top-left", "bottom-right"],
};

export function CornerBrackets({
  tone = "measured",
  corners = "two",
  interactive = false,
  className,
  children,
}: CornerBracketsProps) {
  const positions = CORNER_POSITIONS[corners];

  return (
    <div
      className={cn("instrument-bracket", interactive && "instrument-bracket-interactive", className)}
      style={{ "--bracket-color": TONE_COLOR[tone] } as CSSProperties}
    >
      {children}
      {positions.map((position) => (
        <span
          key={position}
          aria-hidden="true"
          data-position={position}
          className="instrument-bracket-corner"
        />
      ))}
    </div>
  );
}
