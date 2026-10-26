import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import {
  API_ROUTE_REGISTRY,
  API_ROUTE_REGISTRY_BY_PATH,
  getApiRouteRegistration,
  listPublicApiRoutes,
  type ApiRouteClass,
} from "@/lib/api/route-registry";

const API_ROOT = join(process.cwd(), "src", "app", "api");

const ALLOWED_CLASSES: ReadonlySet<ApiRouteClass> = new Set([
  "public",
  "authenticated",
  "staff",
  "admin",
  "client_scoped",
  "internal",
  "mixed",
]);

/** Classifications that must not be treated as "accidentally public". */
const NON_PUBLIC: ReadonlySet<ApiRouteClass> = new Set([
  "authenticated",
  "staff",
  "admin",
  "client_scoped",
  "internal",
  "mixed",
]);

function listFilesystemRoutePaths(dir: string = API_ROOT): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listFilesystemRoutePaths(full));
      continue;
    }
    if (name === "route.ts") {
      out.push(relative(API_ROOT, full).replace(/\\/g, "/"));
    }
  }
  return out.sort();
}

describe("SS-SEC-007 API route registry (SEC-001-H03)", () => {
  const filesystemPaths = listFilesystemRoutePaths();

  it("classifies every filesystem route.ts under src/app/api", () => {
    const registryPaths = API_ROUTE_REGISTRY.map((e) => e.path).sort();
    expect(registryPaths).toEqual(filesystemPaths);
  });

  it("has no duplicate registry paths", () => {
    expect(API_ROUTE_REGISTRY_BY_PATH.size).toBe(API_ROUTE_REGISTRY.length);
  });

  it("uses only known classification values with notes", () => {
    for (const entry of API_ROUTE_REGISTRY) {
      expect(ALLOWED_CLASSES.has(entry.classification), entry.path).toBe(true);
      expect(entry.notes.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps registry sorted by path for maintainability", () => {
    const paths = API_ROUTE_REGISTRY.map((e) => e.path);
    expect(paths).toEqual([...paths].sort());
  });

  it("lists intentional public routes only", () => {
    const publicPaths = listPublicApiRoutes().map((r) => r.path).sort();
    expect(publicPaths).toEqual([
      "auth/[...nextauth]/route.ts",
      "checkout/create-session/route.ts",
      "product-overview/pdf/route.ts",
      "v1/health/route.ts",
      "v1/public/activate-account/route.ts",
      "v1/public/password-reset/route.ts",
      "v1/public/technology-snapshot/[leadId]/continue-assessment/route.ts",
      "v1/public/technology-snapshot/route.ts",
    ]);
  });

  it("marks admin, staff, client_scoped, and internal routes as non-public", () => {
    for (const entry of API_ROUTE_REGISTRY) {
      if (entry.classification === "public") continue;
      expect(NON_PUBLIC.has(entry.classification), entry.path).toBe(true);
    }
  });

  it("resolves registrations via getApiRouteRegistration", () => {
    expect(getApiRouteRegistration("v1/health/route.ts")?.classification).toBe("public");
    expect(getApiRouteRegistration("v1\\users\\route.ts")?.classification).toBe("admin");
    expect(getApiRouteRegistration("missing/route.ts")).toBeUndefined();
  });

  it("rejects unclassified routes by requiring registry ≡ filesystem", () => {
    // Simulated new route would fail the equality assertion above.
    expect(filesystemPaths.length).toBeGreaterThan(100);
    expect(API_ROUTE_REGISTRY.length).toBe(filesystemPaths.length);
  });
});
