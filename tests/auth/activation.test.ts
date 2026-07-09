import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

describe("activation token hashing", () => {
  it("hashes tokens consistently for lookup", () => {
    const raw = "sample-token";
    const hash = createHash("sha256").update(raw).digest("hex");
    expect(hash).toHaveLength(64);
    expect(createHash("sha256").update(raw).digest("hex")).toBe(hash);
  });
});
