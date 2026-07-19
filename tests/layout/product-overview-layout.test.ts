import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("product overview public route", () => {
  it("whitelists /product-overview in auth config", () => {
    const authConfig = readFileSync(
      resolve(process.cwd(), "src/lib/auth/auth.config.ts"),
      "utf8",
    );

    expect(authConfig).toContain('pathname.startsWith("/product-overview")');
  });
});
