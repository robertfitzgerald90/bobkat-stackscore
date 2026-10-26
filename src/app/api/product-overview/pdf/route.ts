import { NextResponse } from "next/server";
import { generateProductOverviewPdf } from "@/lib/pdf/generate";
import { buildDemoProfile, getIndustryOption } from "@/lib/product-overview/demo-profiles";
import type { DemoIndustryId } from "@/lib/product-overview/demo-profiles/types";
import { sanitizeFilename } from "@/lib/pdf/types";
import {
  enforceProductOverviewPdfLimits,
  temporarilyUnavailableResponse,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const VALID_INDUSTRIES = new Set<DemoIndustryId>([
  "manufacturing",
  "professional-services",
  "healthcare",
  "construction",
  "distribution",
  "engineering",
  "financial-services",
  "retail",
]);

export async function GET(request: Request) {
  const rate = await enforceProductOverviewPdfLimits(request);
  if (!rate.allowed) {
    if (rate.backendError) {
      return temporarilyUnavailableResponse(rate.retryAfterSeconds);
    }
    return tooManyRequestsResponse(rate.retryAfterSeconds);
  }

  const { searchParams } = new URL(request.url);
  const companyName = (searchParams.get("company") ?? "Northstar Manufacturing").slice(0, 120);
  const industryParam = searchParams.get("industry") ?? "manufacturing";
  const industryId = VALID_INDUSTRIES.has(industryParam as DemoIndustryId)
    ? (industryParam as DemoIndustryId)
    : "manufacturing";
  const employeeCount = Number(searchParams.get("employees") ?? "85") || 85;
  const locationCount = Number(searchParams.get("locations") ?? "2") || 2;

  const profile = buildDemoProfile({
    companyName,
    industryId,
    employeeCount,
    locationCount,
    businessGoal: "reduce-it-risk",
  });

  const generatedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const buffer = await generateProductOverviewPdf({
    companyName,
    industry: getIndustryOption(industryId).label,
    generatedDate,
    profile,
  });

  const filename = `${sanitizeFilename(companyName)}-stackscore-interactive-demo.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Short public cache reduces repeat CPU cost for identical demo params (SS-SEC-007 / M02).
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
    },
  });
}
