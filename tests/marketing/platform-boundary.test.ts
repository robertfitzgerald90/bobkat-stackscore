import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import { STRATEGIC_IT_CONSULTING_CHECKOUT_PATH } from "@/lib/marketing/stackscore-routes";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";

describe("marketing platform boundary", () => {
  it("redirects StackScore services and solutions pages to Bobkat IT", () => {
    const nextConfig = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");
    expect(nextConfig).toContain('source: "/services"');
    expect(nextConfig).toContain(`destination: BOBKAT_IT_URLS.services`);
    expect(nextConfig).toContain('source: "/solutions"');
    expect(nextConfig).toContain(`destination: BOBKAT_IT_URLS.solutions`);
  });

  it("uses permanent server redirects in route pages", () => {
    const servicesPage = readFileSync(
      resolve(process.cwd(), "src/app/services/page.tsx"),
      "utf8",
    );
    const solutionsPage = readFileSync(
      resolve(process.cwd(), "src/app/solutions/page.tsx"),
      "utf8",
    );

    expect(servicesPage).toContain("permanentRedirect");
    expect(servicesPage).toContain("BOBKAT_IT_URLS.services");
    expect(solutionsPage).toContain("permanentRedirect");
    expect(solutionsPage).toContain("BOBKAT_IT_URLS.solutions");
  });

  it("points public CTAs at Bobkat IT marketing and StackScore checkout", () => {
    expect(SERVICES_CTA_DESTINATIONS.solutionsLanding.href).toBe(BOBKAT_IT_URLS.solutions);
    expect(SERVICES_CTA_DESTINATIONS.servicesLanding.href).toBe(BOBKAT_IT_URLS.services);
    expect(SERVICES_CTA_DESTINATIONS.vcioOffer.href).toBe(STRATEGIC_IT_CONSULTING_CHECKOUT_PATH);
    expect(SERVICES_CTA_DESTINATIONS.strategicConsultingExplore.href).toBe(
      BOBKAT_IT_URLS.strategicItConsulting,
    );
  });
});
