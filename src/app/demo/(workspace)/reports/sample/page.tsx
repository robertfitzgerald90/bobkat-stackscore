import type { Metadata } from "next";
import { DemoSampleReport } from "@/components/public-demo/demo-sample-report";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";

export const metadata: Metadata = {
  title: `Sample Report | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
  description: "On-screen sample StackScore assessment report preview — fictional data only.",
  alternates: { canonical: "/demo/reports/sample" },
  robots: { index: false, follow: true },
};

export default function PublicDemoSampleReportPage() {
  return <DemoSampleReport />;
}
