import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoOpportunityDetail } from "@/components/public-demo/demo-opportunity-detail";
import { PUBLIC_DEMO_COMPANY_NAME } from "@/lib/public-demo/constants";
import { DEMO_OPPORTUNITIES } from "@/lib/public-demo/fixtures";
import { getPublicDemoOpportunity } from "@/lib/public-demo/provider";

type OpportunityPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return DEMO_OPPORTUNITIES.map((row) => ({ id: row.id }));
}

export async function generateMetadata({ params }: OpportunityPageProps): Promise<Metadata> {
  const { id } = await params;
  const opportunity = getPublicDemoOpportunity(id);
  return {
    title: opportunity
      ? `${opportunity.title} | ${PUBLIC_DEMO_COMPANY_NAME} Demo`
      : `Opportunity | ${PUBLIC_DEMO_COMPANY_NAME} Demo`,
    robots: { index: false, follow: true },
  };
}

export default async function PublicDemoOpportunityPage({ params }: OpportunityPageProps) {
  const { id } = await params;
  const opportunity = getPublicDemoOpportunity(id);
  if (!opportunity) notFound();
  return <DemoOpportunityDetail opportunity={opportunity} />;
}
