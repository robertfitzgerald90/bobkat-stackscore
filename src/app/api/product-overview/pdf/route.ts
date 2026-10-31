import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * SS-WEB-003-R2 — Legacy interactive-demo PDF generator retired.
 * Public demo no longer exposes speculative financial / proposal PDFs.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "gone",
      message:
        "The legacy StackScore interactive demo PDF is no longer available. Explore the current product demo at /demo/overview.",
      demoHref: "/demo/overview",
    },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
