import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("interactive demo public route", () => {
  it("whitelists /demo in auth config", () => {
    const authConfig = readFileSync(
      resolve(process.cwd(), "src/lib/auth/auth.config.ts"),
      "utf8",
    );

    expect(authConfig).toContain('pathname.startsWith("/demo")');
    expect(authConfig).toContain('pathname.startsWith("/product-overview")');
  });

  it("permanently redirects /product-overview to /demo", () => {
    const nextConfig = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");
    expect(nextConfig).toContain('source: "/product-overview"');
    expect(nextConfig).toContain('destination: "/demo"');
    expect(nextConfig).toContain("permanent: true");
  });
});
