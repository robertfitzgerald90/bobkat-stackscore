import { createHash } from "node:crypto";
import type { AssessmentAiSnapshot } from "./schema";

/** JSONB reorders object keys. Canonicalize recursively so fingerprints survive persistence. */
export function snapshotHash(snapshot: AssessmentAiSnapshot) {
  function canonical(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonical);
    if (value !== null && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value)
          .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          .map(([key, child]) => [key, canonical(child)]),
      );
    return value;
  }
  return createHash("sha256")
    .update(JSON.stringify(canonical(snapshot)))
    .digest("hex");
}
