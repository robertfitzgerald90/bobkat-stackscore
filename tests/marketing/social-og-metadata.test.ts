import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SOCIAL_OG_ASSETS,
  SOCIAL_OG_HEIGHT,
  SOCIAL_OG_WIDTH,
  buildSocialPageMetadata,
  socialOgImage,
} from "@/lib/branding/social-og";

function readAppSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("WEB-OG-002 social Open Graph assets", () => {
  it("exports approved 1200×630 preview files under public/images/og", () => {
    for (const asset of Object.values(SOCIAL_OG_ASSETS)) {
      const absolute = resolve(process.cwd(), `public${asset.path}`);
      const bytes = readFileSync(absolute);
      expect(bytes.byteLength).toBeGreaterThan(50_000);
      // PNG signature
      expect(bytes.subarray(0, 8)).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
      // IHDR width/height at bytes 16–23 (big-endian)
      expect(bytes.readUInt32BE(16)).toBe(SOCIAL_OG_WIDTH);
      expect(bytes.readUInt32BE(20)).toBe(SOCIAL_OG_HEIGHT);
    }
  });

  it("builds summary_large_image metadata with absolute-ready image fields", () => {
    const meta = buildSocialPageMetadata({
      title: "Free Technology Snapshot | Bobkat IT",
      description: "Free, 14 questions, no account required.",
      path: "/technology-snapshot",
      image: "snapshot",
    });

    expect(meta.openGraph?.images).toEqual([socialOgImage("snapshot")]);
    expect(meta.twitter?.card).toBe("summary_large_image");
    expect(meta.alternates?.canonical).toBe("/technology-snapshot");
  });

  it("wires key public routes to approved artwork keys", () => {
    const home = readAppSource("src/app/page.tsx");
    const demo = readAppSource("src/app/demo/page.tsx");
    const overview = readAppSource("src/app/demo/(workspace)/overview/page.tsx");
    const snapshot = readAppSource("src/app/technology-snapshot/page.tsx");
    const offer = readAppSource("src/app/assessment-offer/page.tsx");
    const invitation = readAppSource("src/app/assessment-invitation/page.tsx");

    expect(home).toContain('image: "stackscoreDemo"');
    expect(demo).toContain('image: "stackscoreDemo"');
    expect(demo).toContain("StackScore Demo | See Technology Intelligence in Action");
    expect(overview).toContain('image: "stackscoreDemo"');
    expect(overview).toContain('path: "/demo"');
    expect(snapshot).toContain('image: "snapshot"');
    expect(snapshot).toContain("Free Technology Snapshot | Bobkat IT");
    expect(offer).toContain('image: "stackscoreDemo"');
    expect(invitation).toContain('image: "snapshot"');
    expect(invitation).not.toContain("/images/og/assessment-invitation.png");
  });
});
