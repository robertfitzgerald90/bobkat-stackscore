import { describe, expect, it } from "vitest";
import { buildBusinessReviewPdfFilename } from "@/lib/qbr/pdf-filename";

describe("buildBusinessReviewPdfFilename", () => {
  it("builds a sanitized professional filename without IDs", () => {
    expect(
      buildBusinessReviewPdfFilename({
        clientName: "Pinnacle Engineering",
        reviewPeriodLabel: "Apr 1, 2026 to Jun 30, 2026",
      }),
    ).toBe("Pinnacle-Engineering-Business-Review-Apr-1-2026-to-Jun-30-2026.pdf");
  });

  it("strips invalid filename characters", () => {
    expect(
      buildBusinessReviewPdfFilename({
        clientName: 'Acme / "Inc."',
        reviewPeriodLabel: "Q2/2026",
      }),
    ).toBe("Acme-Inc-Business-Review-Q2-2026.pdf");
  });
});
