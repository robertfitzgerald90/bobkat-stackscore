import { describe, expect, it } from "vitest";
import { resolveLegacyDomainRedirect } from "@/lib/url/legacy-domain-redirect";

function mockRequest(input: {
  host: string;
  pathname: string;
  search?: string;
}) {
  return {
    headers: {
      get(name: string) {
        return name.toLowerCase() === "host" ? input.host : null;
      },
    },
    nextUrl: {
      pathname: input.pathname,
      search: input.search ?? "",
    },
  };
}

describe("resolveLegacyDomainRedirect", () => {
  it("redirects legacy host pages to stackscore.tech with path preserved", () => {
    const destination = resolveLegacyDomainRedirect(
      mockRequest({
        host: "stackscore.bobkatit.com",
        pathname: "/services",
      }),
    );

    expect(destination?.toString()).toBe("https://stackscore.tech/services");
  });

  it("preserves query strings", () => {
    const destination = resolveLegacyDomainRedirect(
      mockRequest({
        host: "stackscore.bobkatit.com",
        pathname: "/login",
        search: "?callbackUrl=%2Fdashboard",
      }),
    );

    expect(destination?.toString()).toBe(
      "https://stackscore.tech/login?callbackUrl=%2Fdashboard",
    );
  });

  it("does not redirect localhost", () => {
    expect(
      resolveLegacyDomainRedirect(
        mockRequest({ host: "localhost:3000", pathname: "/dashboard" }),
      ),
    ).toBeNull();
  });

  it("does not redirect the canonical host", () => {
    expect(
      resolveLegacyDomainRedirect(
        mockRequest({ host: "stackscore.tech", pathname: "/dashboard" }),
      ),
    ).toBeNull();
  });

  it("does not redirect API routes on the legacy host", () => {
    expect(
      resolveLegacyDomainRedirect(
        mockRequest({
          host: "stackscore.bobkatit.com",
          pathname: "/api/webhooks/stripe",
        }),
      ),
    ).toBeNull();
  });
});
