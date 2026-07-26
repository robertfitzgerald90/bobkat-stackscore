import { describe, expect, it } from "vitest";
import {
  BOBKAT_FOUNDER_SIGNATURE,
  buildBobkatFounderSignatureLines,
  formatBobkatFounderSignaturePlainText,
} from "@/lib/email/bobkat-founder-signature";
import { EmailClosingSignature } from "@/emails/components/email-closing-signature";
import { renderEmailTemplate } from "@/emails/render-email";

describe("bobkat founder signature", () => {
  it("formats the closing block without the legacy BF initials", () => {
    const text = formatBobkatFounderSignaturePlainText();
    expect(text).toContain("Take care and be well!");
    expect(text).toContain(BOBKAT_FOUNDER_SIGNATURE.name);
    expect(text).toContain(BOBKAT_FOUNDER_SIGNATURE.title);
    expect(text).not.toContain("\nBF\n");
    expect(text).not.toMatch(/^BF$/m);
  });

  it("places contact details on separate lines with a blank line before email", () => {
    const lines = buildBobkatFounderSignatureLines();
    const titleIndex = lines.indexOf(BOBKAT_FOUNDER_SIGNATURE.title);
    const emailIndex = lines.indexOf("bobby@bobkatit.com");

    expect(lines[titleIndex + 1]).toBe("");
    expect(lines[emailIndex - 1]).toBe("");
  });

  it("renders each signature line as its own HTML block", async () => {
    const { html } = await renderEmailTemplate(
      EmailClosingSignature({ closingMessage: "Take care and be well!" }),
    );

    expect(html).toContain("Take care and be well!");
    expect(html).toContain(BOBKAT_FOUNDER_SIGNATURE.name);
    expect(html).toContain(BOBKAT_FOUNDER_SIGNATURE.title);
    expect(html).not.toContain(">BF<");
  });
});
