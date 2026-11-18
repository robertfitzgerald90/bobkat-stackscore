import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("SS-ADMIN-008 project detail modal layout", () => {
  const dashboard = read("src/components/projects/projects-dashboard.tsx");
  const delivery = read("src/components/projects/project-delivery-panel.tsx");
  const customer = read("src/components/projects/project-customer-update-panel.tsx");

  it("keeps Notes, Customer Communications, and Delivery Progress as separate stacked sections", () => {
    expect(dashboard).toContain('id="project-notes"');
    expect(dashboard).toContain("ProjectCustomerUpdatePanel");
    expect(dashboard).toContain("ProjectDeliveryPanel");

    const notesIndex = dashboard.indexOf('id="project-notes"');
    const customerIndex = dashboard.indexOf("<ProjectCustomerUpdatePanel");
    const deliveryIndex = dashboard.indexOf("<ProjectDeliveryPanel");
    expect(notesIndex).toBeGreaterThan(-1);
    expect(customerIndex).toBeGreaterThan(notesIndex);
    expect(deliveryIndex).toBeGreaterThan(customerIndex);
  });

  it("does not nest Customer Communications inside the delivery panel", () => {
    expect(delivery).not.toContain("ProjectCustomerUpdatePanel");
    expect(delivery).toContain("Delivery progress");
  });

  it("avoids flex min-h-0 compression around Notes that caused overlap", () => {
    expect(dashboard).not.toContain("min-h-full flex-1 flex-col");
    expect(dashboard).not.toContain("flex min-h-0 flex-col gap-2");
    expect(dashboard).toContain("max-h-60");
    expect(dashboard).toContain("overflow-y-auto");
  });

  it("keeps Prepare Customer Update out of absolute overlap layouts", () => {
    expect(customer).toContain("Prepare Customer Update");
    expect(customer).toContain("Customer communications");
    expect(customer).not.toMatch(/className="[^"]*absolute[^"]*Prepare|Prepare[\s\S]*absolute top/);
    expect(customer).toContain("flex flex-col gap-3 sm:flex-row");
  });
});
