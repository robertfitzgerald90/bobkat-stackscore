import { describe, expect, it } from "vitest";
import { technologyLifecycleDemoData } from "@/lib/demo-data/technology-lifecycle";

describe("technology lifecycle demo data", () => {
  it("includes four vendor cards with budgets and renewals", () => {
    expect(technologyLifecycleDemoData).toHaveLength(4);
    expect(technologyLifecycleDemoData[0]?.name).toBe("Ubiquiti UniFi");
    expect(technologyLifecycleDemoData[0]?.annualBudgetCents).toBe(1_850_000);
    expect(technologyLifecycleDemoData.at(-1)?.name).toBe(
      "Microsoft 365 Business Premium & Azure LOB Apps",
    );
    expect(technologyLifecycleDemoData.at(-1)?.renewalDate).toBeUndefined();
  });
});
