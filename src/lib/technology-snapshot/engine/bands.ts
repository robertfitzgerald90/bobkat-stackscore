import type { SnapshotPostureBand } from "./types";

export const SNAPSHOT_POSTURE_LABELS: Record<SnapshotPostureBand, string> = {
  strong_foundation: "Strong Foundation",
  mixed_signals: "Mixed Signals",
  notable_gaps: "Notable Gaps",
  urgent_attention: "Urgent Attention Needed",
};

export const SNAPSHOT_POSTURE_SUMMARIES: Record<SnapshotPostureBand, string> = {
  strong_foundation:
    "Your responses suggest a solid technology foundation across the areas we checked. A full StackScore assessment can still uncover deeper risks and a clearer improvement plan.",
  mixed_signals:
    "Some areas look healthier than others. Focusing on the weaker spots now can reduce surprises and make technology more predictable for the business.",
  notable_gaps:
    "Several important gaps stand out. Without focused attention, security, recovery, or day-to-day reliability may create avoidable business risk.",
  urgent_attention:
    "Multiple foundational practices appear weak or unclear. Prioritize expert review and a structured assessment before issues escalate.",
};

/**
 * Classify using normalized percent (0–100) so 3-question and 4-question
 * categories share the same public bands as the overall 0–42 score.
 *
 * Thresholds align with SS-SNAP-002: ≥87%, ≥62%, ≥33%, else urgent.
 */
export function classifyPosturePercent(percent: number): SnapshotPostureBand {
  if (percent >= 87) return "strong_foundation";
  if (percent >= 62) return "mixed_signals";
  if (percent >= 33) return "notable_gaps";
  return "urgent_attention";
}

export function classifyPosturePoints(points: number, max: number): SnapshotPostureBand {
  if (max <= 0) return "urgent_attention";
  return classifyPosturePercent((points / max) * 100);
}

export function getPostureLabel(band: SnapshotPostureBand): string {
  return SNAPSHOT_POSTURE_LABELS[band];
}

export function getPostureSummary(band: SnapshotPostureBand): string {
  return SNAPSHOT_POSTURE_SUMMARIES[band];
}
