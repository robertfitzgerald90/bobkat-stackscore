import { describe, expect, it } from "vitest";
import { buildDedupeKey } from "@/lib/recommendations/dedupe";

describe("buildDedupeKey for V2 catalog", () => {
  it("uses template catalog code as stable client-level key", () => {
    expect(
      buildDedupeKey({
        recommendationTemplateId: "uuid-in-db",
        templateCode: "REC-IA-001",
      }),
    ).toBe("template:REC-IA-001");
  });

  it("matches keys produced by migration backfill prefix", () => {
    const runtimeKey = buildDedupeKey({ templateCode: "REC-DP-003" });
    const legacyBackfillKey = `template:REC-DP-003`;
    expect(runtimeKey).toBe(legacyBackfillKey);
  });
});
