import { describe, expect, it } from "vitest";
import { deriveStatusFromEvent } from "@/lib/communications/tracking/status";
import { extractLinkLabel, maskSensitiveUrl } from "@/lib/communications/tracking/url-sanitize";

describe("communications url sanitization", () => {
  it("masks activation tokens in URLs", () => {
    const masked = maskSensitiveUrl(
      "https://stackscore.bobkatit.com/activate-account?token=super-secret",
    );
    expect(masked).toContain("token=%5Bredacted%5D");
    expect(masked).not.toContain("super-secret");
  });

  it("labels activation links", () => {
    expect(extractLinkLabel("https://stackscore.bobkatit.com/activate-account")).toBe(
      "Activation link",
    );
  });
});

describe("communication status derivation", () => {
  it("promotes status for engagement events", () => {
    expect(deriveStatusFromEvent("DELIVERED", "OPENED")).toBe("OPENED");
    expect(deriveStatusFromEvent("OPENED", "CLICKED")).toBe("CLICKED");
  });

  it("prioritizes hard failures", () => {
    expect(deriveStatusFromEvent("DELIVERED", "BOUNCED")).toBe("BOUNCED");
    expect(deriveStatusFromEvent("CLICKED", "FAILED")).toBe("FAILED");
  });
});
