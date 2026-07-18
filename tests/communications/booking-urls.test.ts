import { afterEach, describe, expect, it } from "vitest";
import {
  getTechnologyMaturityAssessmentBookingUrl,
  TECHNOLOGY_MATURITY_ASSESSMENT_BOOKING_PATH,
} from "@/lib/communications/booking-urls";

describe("getTechnologyMaturityAssessmentBookingUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_TECHNOLOGY_ASSESSMENT_BOOKING_URL;
    delete process.env.NEXT_PUBLIC_ASSESSMENT_BOOKING_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("defaults to the assessment offer path on the app origin", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://stackscore.tech";
    expect(getTechnologyMaturityAssessmentBookingUrl()).toBe(
      `https://stackscore.tech${TECHNOLOGY_MATURITY_ASSESSMENT_BOOKING_PATH}`,
    );
  });

  it("prefers NEXT_PUBLIC_TECHNOLOGY_ASSESSMENT_BOOKING_URL when set", () => {
    process.env.NEXT_PUBLIC_TECHNOLOGY_ASSESSMENT_BOOKING_URL =
      "https://stackscore.tech/assessment-offer";
    expect(getTechnologyMaturityAssessmentBookingUrl()).toBe(
      "https://stackscore.tech/assessment-offer",
    );
  });
});
