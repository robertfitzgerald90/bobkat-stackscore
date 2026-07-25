import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

/** Critical production paths that must have a page.tsx (or next.config redirect). */
const CRITICAL_PAGE_PATHS: Array<{ route: string; pageFile: string }> = [
  { route: "/", pageFile: "src/app/page.tsx" },
  { route: "/login", pageFile: "src/app/login/page.tsx" },
  { route: "/assessment-offer", pageFile: "src/app/assessment-offer/page.tsx" },
  { route: "/assessment-invitation", pageFile: "src/app/assessment-invitation/page.tsx" },
  { route: "/assessment/start", pageFile: "src/app/assessment/start/page.tsx" },
  { route: "/activate-account", pageFile: "src/app/activate-account/page.tsx" },
  { route: "/onboarding", pageFile: "src/app/onboarding/page.tsx" },
  { route: "/assessment-purchased", pageFile: "src/app/assessment-purchased/page.tsx" },
  { route: "/subscription-activated", pageFile: "src/app/subscription-activated/page.tsx" },
  { route: "/technology-snapshot", pageFile: "src/app/technology-snapshot/page.tsx" },
  { route: "/checkout/strategic-it-consulting", pageFile: "src/app/checkout/strategic-it-consulting/page.tsx" },
  { route: "/dashboard", pageFile: "src/app/(dashboard)/dashboard/page.tsx" },
  { route: "/demo", pageFile: "src/app/demo/page.tsx" },
];

const CRITICAL_API_ROUTES = [
  "src/app/api/checkout/create-session/route.ts",
  "src/app/api/checkout/vcio/route.ts",
  "src/app/api/webhooks/stripe/route.ts",
  "src/app/api/v1/public/activate-account/route.ts",
];

function collectPageFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectPageFiles(full, acc);
    } else if (entry === "page.tsx") {
      acc.push(full.replace(/\\/g, "/"));
    }
  }
  return acc;
}

describe("critical StackScore routes exist", () => {
  it("has page modules for the assessment and purchase funnel", () => {
    for (const item of CRITICAL_PAGE_PATHS) {
      expect(existsSync(resolve(root, item.pageFile)), `missing ${item.route} → ${item.pageFile}`).toBe(
        true,
      );
    }
  });

  it("has checkout and webhook API handlers", () => {
    for (const file of CRITICAL_API_ROUTES) {
      expect(existsSync(resolve(root, file)), `missing ${file}`).toBe(true);
    }
  });

  it("exposes a branded not-found page", () => {
    const notFound = readFileSync(resolve(root, "src/app/not-found.tsx"), "utf8");
    expect(notFound).toContain("assessment-offer");
    expect(notFound).toContain("Sign In");
    expect(notFound).toContain("Return Home");
  });
});

describe("Stripe success URLs point at canonical confirmation routes", () => {
  it("uses assessment-purchased and subscription-activated", () => {
    const assessmentCheckout = readFileSync(
      resolve(root, "src/app/api/checkout/create-session/route.ts"),
      "utf8",
    );
    const vcioCheckout = readFileSync(
      resolve(root, "src/app/api/checkout/vcio/route.ts"),
      "utf8",
    );

    expect(assessmentCheckout).toContain("ASSESSMENT_PURCHASED_PATH");
    expect(assessmentCheckout).toContain("session_id={CHECKOUT_SESSION_ID}");
    expect(assessmentCheckout).toContain("/assessment-offer");
    expect(vcioCheckout).toContain("SUBSCRIPTION_ACTIVATED_PATH");
    expect(vcioCheckout).toContain("session_id={CHECKOUT_SESSION_ID}");
  });
});

describe("legacy route redirects", () => {
  it("maps known historical paths to canonical destinations", () => {
    const config = readFileSync(resolve(root, "next.config.ts"), "utf8");
    expect(config).toContain('source: "/assessment/invitation"');
    expect(config).toContain('destination: "/assessment-invitation"');
    expect(config).toContain('source: "/assessment/invite"');
    expect(config).toContain('source: "/activate"');
    expect(config).toContain('destination: "/activate-account"');
    expect(config).toContain('source: "/purchase/success"');
    expect(config).toContain('destination: "/assessment-purchased"');
    expect(config).toContain('source: "/vcio-offer/success"');
    expect(config).toContain('destination: "/subscription-activated"');
  });
});

describe("internal hardcoded route integrity (smoke)", () => {
  it("does not reference known-dead invitation path segments in src", () => {
    const appPages = collectPageFiles(resolve(root, "src/app"));
    expect(appPages.length).toBeGreaterThan(50);

    // Runtime source should not invent /assessment/invite token pages.
    const inviteRefs = [
      "src/lib/communications/links/build-protected-url.ts",
      "src/lib/marketing/stackscore-routes.ts",
      "src/lib/assessment-offer/attribution.ts",
    ];
    for (const file of inviteRefs) {
      const contents = readFileSync(resolve(root, file), "utf8");
      expect(contents).not.toContain("/assessment/invite/");
      expect(contents).not.toContain("/assessment/invitation");
    }
  });
});
