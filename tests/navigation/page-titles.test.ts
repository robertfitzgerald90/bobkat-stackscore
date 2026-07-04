import { describe, expect, it } from "vitest";
import { getPageTitle } from "@/lib/navigation/page-titles";

describe("getPageTitle", () => {
  it("returns global module titles", () => {
    expect(getPageTitle("/portfolio")).toBe("Portfolio");
    expect(getPageTitle("/dashboard")).toBe("Dashboard");
    expect(getPageTitle("/projects")).toBe("Projects");
  });

  it("returns Client Workspace for overview routes", () => {
    expect(getPageTitle("/clients/client-1/technology-profile")).toBe("Client Workspace");
    expect(getPageTitle("/clients/client-1")).toBe("Client Workspace");
  });

  it("returns DOC-201 section titles for workspace routes", () => {
    expect(getPageTitle("/clients/client-1/journey")).toBe("Technology Journey");
    expect(getPageTitle("/clients/client-1/roadmap")).toBe("Roadmap");
    expect(getPageTitle("/clients/client-1/recommendations")).toBe("Recommendations");
    expect(getPageTitle("/clients/client-1/executive-reports")).toBe("Executive Reports");
  });

  it("returns specific titles for nested client routes", () => {
    expect(getPageTitle("/clients/client-1/assessments/history")).toBe("Assessment History");
    expect(getPageTitle("/clients/client-1/assessments/compare")).toBe("Compare Assessments");
    expect(getPageTitle("/clients/client-1/improvement")).toBe("Improvement Dashboard");
    expect(getPageTitle("/clients/client-1/improvement-plan/tip-1")).toBe("Improvement Plan");
  });

  it("maps legacy routes to their workspace section titles", () => {
    expect(getPageTitle("/clients/client-1/improvement-plan")).toBe("Roadmap");
    expect(getPageTitle("/clients/client-1/business-profile")).toBe("Contacts");
    expect(getPageTitle("/clients/client-1/quarterly-review")).toBe("Executive Reports");
  });
});
